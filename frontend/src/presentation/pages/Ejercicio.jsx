/**
 * Ejercicio.jsx
 * Ruta: frontend/src/presentation/pages/Ejercicio.jsx
 *
 * CAMBIO: integración del temporizador de ejercicio.
 *
 * Los archivos del timer YA EXISTÍAN en el proyecto pero nunca
 * se importaron aquí. Este archivo los conecta:
 *
 *   useEjercicioTimer  →  frontend/src/application/services/useEjercicioTimer.js
 *   CronometroEjercicio → frontend/src/presentation/components/ui/exercises/CronometroEjercicio.jsx
 *
 * NOTA sobre la copia duplicada:
 *   Existe también frontend/src/presentation/components/ui/CronometroEjercicio.jsx
 *   (sin la subcarpeta exercises/). Ese archivo es idéntico y puede borrarse.
 *   Este import apunta a la ubicación canónica: .../exercises/CronometroEjercicio.jsx
 *
 * LÓGICA DEL TIMER:
 *   - Corre solo mientras el ejercicio está activo (no hay resultado y no avanza).
 *   - Al llegar a 0 dispara evaluar() con respuesta "__tiempo_agotado__" y correcta:false.
 *   - Se reinicia automáticamente al cambiar de ejercicio (activeIndex).
 *   - Si el usuario responde antes de que se acabe, el timer se detiene (activo=false).
 *   - El botón "Intentar nuevamente" reinicia el timer explícitamente con reiniciar().
 *   - Los tiempos por tipo: quiz=20s, auditivo=25s, midi=50s (ver TIMER_CONFIG en el hook).
 */

import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../../application/config/apiBase";
import { authFetch } from "../../application/services/api";
import { useAuth } from "../../application/context/useAuth";
import { usePreferences } from "../../application/context/usePreferences";
import { solicitarFeedbackIA } from "../../application/services/feedbackIA";
import { playError, playSuccess, playPerfectStreak } from "../../application/services/sound";
import { speakText, stopSpeech } from "../../application/services/speech";
import { useEjercicioTimer } from "../../application/services/useEjercicioTimer";
import {
  getCompletedExerciseIds,
  markExerciseCompletedLocal,
  evaluarRespuesta,
  obtenerEjerciciosCompletados,
  registerLessonAttemptLocal,
} from "../../application/services/progress";
import EjercicioRenderer from "../components/ui/exercises/EjercicioRenderer";
import CronometroEjercicio from "../components/ui/exercises/CronometroEjercicio";
import { TutorialContextual } from "../components/ui/OnboardingTutorial";

function describirRespuesta(respuesta) {
  if (respuesta == null) return "sin respuesta";
  if (typeof respuesta !== "object") return String(respuesta);
  if (Array.isArray(respuesta)) return respuesta.join(", ");
  if (Object.hasOwn(respuesta, "respuesta")) {
    return describirRespuesta(respuesta.respuesta);
  }
  return JSON.stringify(respuesta);
}

export default function Ejercicio() {
  const { leccionId } = useParams();
  const navigate      = useNavigate();
  const { preferences }                  = usePreferences();
  const { usuarioDB } = useAuth();

  const [leccion, setLeccion]                       = useState(null);
  const [ejercicios, setEjercicios]                 = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [errorCarga, setErrorCarga]                 = useState(null);
  const [activeIndex, setActiveIndex]               = useState(0);
  const [ejerciciosAprobados, setEjerciciosAprobados] = useState(() => new Set());
  const [modoRepaso, setModoRepaso]                 = useState(false);
  const [avisoNavegacion, setAvisoNavegacion]         = useState("");
  const [attempt, setAttempt]                       = useState(0);
  const [resultadoActual, setResultadoActual]       = useState(null);
  const [avanzando, setAvanzando]                   = useState(false);
  const [isFeedbackSpeaking, setIsFeedbackSpeaking] = useState(false);
  const [rachaAciertos, setRachaAciertos]           = useState(0);
  const feedbackRequestIdRef                        = useRef(0);
  const evaluarRef                                  = useRef(null);

  const currentExercise = ejercicios[activeIndex];
  const todosLosEjerciciosAprobados = ejercicios.length > 0
    && ejercicios.every((exercise) => ejerciciosAprobados.has(String(exercise.id)));

  // ── TIMER ─────────────────────────────────────────────────────────────────
  // Activo = hay ejercicio, no hay resultado visible y no estamos avanzando.
  const timerActivo = Boolean(currentExercise && !resultadoActual && !avanzando);

  // Callback estable: se memo-iza con useCallback para que el hook no se
  // reinicie por referencia nueva en cada render.
  const onAgotado = useCallback(() => {
    if (!currentExercise) return;
    evaluarRef.current?.(currentExercise, {
      respuesta:  { respuesta: "__tiempo_agotado__" },
      correcta:   false,
      puntuacion: 0,
    });
  }, [currentExercise]);

  const { segundosRestantes, porcentaje, enAlerta, reiniciar } = useEjercicioTimer(
    currentExercise?.tipo || "quiz",
    timerActivo,
    onAgotado,
  );

  // Reiniciar el timer cada vez que avanza al siguiente ejercicio.
  // Se ejecuta DESPUÉS de que setActiveIndex actualiza el índice.
  useEffect(() => {
    reiniciar();
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => () => stopSpeech(), []);

  useEffect(() => {
    let cancelado = false;

    const obtenerDatos = async () => {
      try {
        const leccionResponse = await fetch(apiUrl(`/lecciones/${leccionId}`));
        const leccionData = await leccionResponse.json().catch(() => null);
        if (!leccionResponse.ok) {
          throw new Error(leccionData?.error || `No se pudo cargar la lección (${leccionResponse.status}).`);
        }
        if (cancelado) return;
        setLeccion(leccionData);

        const ejerciciosResponse = await authFetch(apiUrl(`/ejercicios/leccion/${leccionId}`));
        const ejerciciosData = await ejerciciosResponse.json().catch(() => null);
        if (!ejerciciosResponse.ok) {
          const error = new Error(ejerciciosData?.error || `No se pudieron cargar los ejercicios (${ejerciciosResponse.status}).`);
          error.status = ejerciciosResponse.status;
          throw error;
        }
        if (!Array.isArray(ejerciciosData)) {
          throw new Error("El servidor devolvió un formato inesperado al cargar los ejercicios.");
        }
        if (cancelado) return;
        setEjercicios(ejerciciosData);

        const completadosEnServidor = usuarioDB?.id
          ? await obtenerEjerciciosCompletados(usuarioDB.id, leccionId).catch(() => [])
          : [];
        const completados = new Set([
          ...getCompletedExerciseIds(leccionId),
          ...completadosEnServidor,
        ].map(String));
        const siguientePendiente = ejerciciosData.findIndex(
          (ex) => !completados.has(String(ex.id))
        );

        // Si la lección ya estaba completada, permitir repasar desde el inicio.
        setEjerciciosAprobados(completados);
        setModoRepaso(ejerciciosData.length > 0 && siguientePendiente === -1);
        setActiveIndex(siguientePendiente === -1 ? 0 : siguientePendiente);
      } catch (error) {
        if (!cancelado) {
          console.error("Error obteniendo ejercicios:", error);
          setErrorCarga({
            leccionId,
            mensaje: error.message || "No se pudieron cargar los ejercicios.",
          });
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    obtenerDatos();
    return () => { cancelado = true; };
  }, [leccionId, usuarioDB?.id]);

  const evaluar = useCallback(async (exercise, payload) => {
    const feedbackRequestId = ++feedbackRequestIdRef.current;

    setAvanzando(true);
    let evaluacion;
    try {
      evaluacion = await evaluarRespuesta(exercise.id, payload.respuesta);
    } catch (error) {
      console.error("No se pudo evaluar la respuesta en el servidor:", error);
      setResultadoActual({
        ...payload,
        correcta: false,
        errorEvaluacion: true,
        puntuacion: 0,
        feedback: "No se pudo validar la respuesta. Comprueba tu conexión e inténtalo de nuevo.",
        feedbackRequestId,
      });
      setAvanzando(false);
      return;
    }

    const resultadoValidado = { ...payload, ...evaluacion };
    setResultadoActual({
      ...resultadoValidado,
      feedback: "Generando retroalimentación...",
      feedbackRequestId,
    });

    if (resultadoValidado.correcta) {
      setEjerciciosAprobados((actuales) => new Set([...actuales, String(exercise.id)]));
      const nuevaRacha = rachaAciertos + 1;
      setRachaAciertos(nuevaRacha);
      if (preferences.soundEnabled) {
        nuevaRacha >= 3 ? playPerfectStreak() : playSuccess();
      }
      markExerciseCompletedLocal(leccionId, exercise.id);
    } else {
      setRachaAciertos(0);
      if (preferences.soundEnabled) playError();
    }

    registerLessonAttemptLocal(leccionId, resultadoValidado.correcta, resultadoValidado.puntuacion);
    setAvanzando(false);

    try {
      const feedback = await solicitarFeedbackIA({
        ejercicio:        exercise,
        respuestaUsuario: payload.respuesta,
        correcta:         resultadoValidado.correcta,
        puntuacion:       resultadoValidado.puntuacion,
      });

      setResultadoActual((cur) => {
        if (!cur || cur.feedbackRequestId !== feedbackRequestId) return cur;
        return { ...cur, feedback };
      });
    } catch (error) {
      console.error("Error generando feedback:", error);
      const respuestaEnviada = describirRespuesta(payload.respuesta);
      const fallback = resultadoValidado.correcta
        ? `¡Correcto! Registré tu respuesta (${respuestaEnviada}). El ejercicio trabaja este concepto: ${exercise.pregunta || exercise.tipo}.`
        : `Tu respuesta fue ${respuestaEnviada}. Repasa este concepto y vuelve a intentarlo: ${exercise.pregunta || exercise.tipo}.`;

      setResultadoActual((cur) => {
        if (!cur || cur.feedbackRequestId !== feedbackRequestId) return cur;
        return { ...cur, feedback: fallback };
      });
    }
  }, [leccionId, preferences.soundEnabled, rachaAciertos]);

  useEffect(() => {
    evaluarRef.current = evaluar;
  }, [evaluar]);

  const toggleFeedbackSpeech = () => {
    if (!resultadoActual?.feedback || !preferences.ttsEnabled) return;
    if (isFeedbackSpeaking) {
      stopSpeech();
      setIsFeedbackSpeaking(false);
      return;
    }
    speakText(resultadoActual.feedback, {
      onStart: () => setIsFeedbackSpeaking(true),
      onEnd:   () => setIsFeedbackSpeaking(false),
      onError: () => setIsFeedbackSpeaking(false),
    });
  };

  const saltarEjercicio = async () => {
    stopSpeech();
    setIsFeedbackSpeaking(false);

    const esUltimo = activeIndex >= ejercicios.length - 1;

    if (esUltimo) {
      const aprobados = new Set([
        ...ejerciciosAprobados,
        ...getCompletedExerciseIds(leccionId),
      ]);
      const todosAprobados = ejercicios.length > 0
        && ejercicios.every((exercise) => aprobados.has(String(exercise.id)));

      if (todosAprobados) {
        navigate(`/resultado/${leccionId}`, {
          replace: true,
          state: { modoRepaso },
        });
        return;
      }

      const primerPendiente = ejercicios.findIndex(
        (exercise) => !aprobados.has(String(exercise.id))
      );
      if (primerPendiente >= 0 && primerPendiente !== activeIndex) {
        setResultadoActual(null);
        setActiveIndex(primerPendiente);
        setAvisoNavegacion("Aún tienes ejercicios sin aprobar. Te llevo al primero pendiente; la página de resultados aparecerá cuando todos estén aprobados.");
      } else {
        setAvisoNavegacion("Aprueba este ejercicio para ver los resultados de la lección.");
      }
      return;
    }

    setAvisoNavegacion("");
    setResultadoActual(null);
    setActiveIndex((cur) => cur + 1);
    // reiniciar() se llama en el useEffect [activeIndex] de arriba.
  };

  const irAlSiguienteEjercicio = async () => {
    await saltarEjercicio();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading || String(leccion?.id) !== String(leccionId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Cargando ejercicios...
      </div>
    );
  }

  if (errorCarga?.leccionId === leccionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-lg w-full rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-gray-900">No se pudo cargar la lección</h1>
          <p className="mt-3 text-sm text-red-700">{errorCarga.mensaje}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!leccion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        No existe la lección
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-950 mb-8 font-bold"
        >
          <ArrowLeft size={18} />
          Volver a la lección
        </button>

        <div id="ejercicio-header" className="mb-10">
          <p className="text-xs font-bold tracking-[0.35em] uppercase mb-2 text-brand-pink">
            Ejercicios
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            {leccion.titulo}
          </h1>
          <p className="text-gray-600">
            Selección múltiple, práctica auditiva y editor MIDI evaluable.
          </p>
        </div>

        <div className="space-y-6">
          {avisoNavegacion && (
            <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              {avisoNavegacion}
            </p>
          )}
          {currentExercise ? (
            <article
              key={currentExercise.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              {/* Cabecera: contador de ejercicio + XP */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Ejercicio {activeIndex + 1} de {ejercicios.length} — {currentExercise.tipo}
                  </p>
                  <h2 className="text-2xl font-extrabold">{currentExercise.pregunta}</h2>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-bold">
                    +{currentExercise.puntos} XP
                  </span>
                  <button
                    type="button"
                    onClick={saltarEjercicio}
                    className="border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-100"
                  >
                    Saltar ejercicio
                  </button>
                </div>
              </div>

              {/* ── CRONÓMETRO ─────────────────────────────────────────── */}
              {/* Solo visible mientras el ejercicio está activo (sin resultado aún). */}
              {!resultadoActual && (
                <CronometroEjercicio
                  segundosRestantes={segundosRestantes}
                  porcentaje={porcentaje}
                  enAlerta={enAlerta}
                  tipo={currentExercise.tipo}
                />
              )}

              {/* ── ÁREA DE RESPUESTAS ────────────────────────────────── */}
              <div id="exercise-options">
                <EjercicioRenderer
                  key={`${currentExercise.id}-${attempt}`}
                  exercise={currentExercise}
                  disabled={avanzando || !!resultadoActual}
                  moduloSlug={leccion.modulo_slug}
                  resultado={resultadoActual}
                  onEvaluate={(payload) => evaluar(currentExercise, payload)}
                />
              </div>

              {/* ── PANEL DE RESULTADO ────────────────────────────────── */}
              {resultadoActual && (
                <div
                  className={`mt-5 rounded-xl p-4 ${
                    resultadoActual.errorEvaluacion
                      ? "bg-amber-50 text-amber-900"
                      : resultadoActual.correcta
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold">
                      {resultadoActual.errorEvaluacion
                        ? "No se pudo comprobar tu respuesta. Vuelve a intentarlo cuando haya conexión."
                        : resultadoActual.correcta
                        ? `Correcto +${resultadoActual.puntuacion} XP. Puedes continuar cuando estés listo.`
                        : resultadoActual.respuesta?.respuesta === "__tiempo_agotado__"
                        ? "⏱ Tiempo agotado. Revisa el concepto e inténtalo de nuevo."
                        : "Respuesta incorrecta. Revisa la retroalimentación y vuelve a intentarlo."}
                    </p>

                    <button
                      type="button"
                      onClick={toggleFeedbackSpeech}
                      disabled={!preferences.ttsEnabled}
                      className="inline-flex items-center gap-1 text-xs font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isFeedbackSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {isFeedbackSpeaking ? "Detener" : preferences.ttsEnabled ? "Escuchar" : "Texto a voz desactivado"}
                    </button>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-line mt-2">
                    {resultadoActual.feedback}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {resultadoActual.correcta ? (
                      <>
                        <button
                          type="button"
                          onClick={irAlSiguienteEjercicio}
                          className="bg-gray-950 text-white px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          {activeIndex >= ejercicios.length - 1
                            ? todosLosEjerciciosAprobados ? "Ver resultados" : "Revisar pendientes"
                            : "Siguiente ejercicio"}
                        </button>
                        <button
                          type="button"
                          onClick={saltarEjercicio}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          Saltar ejercicio
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            stopSpeech();
                            setIsFeedbackSpeaking(false);
                            setResultadoActual(null);
                            setAttempt((current) => current + 1);
                            reiniciar(); // ← reinicia el timer al volver a intentar
                          }}
                          className="bg-brand-pink text-white px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          {resultadoActual.errorEvaluacion ? "Reintentar validación" : "Intentar nuevamente"}
                        </button>
                        <button
                          type="button"
                          onClick={saltarEjercicio}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          Saltar ejercicio
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </article>
          ) : null}
        </div>
      </div>
      <TutorialContextual pagina="ejercicio" />
    </div>
  );
}
