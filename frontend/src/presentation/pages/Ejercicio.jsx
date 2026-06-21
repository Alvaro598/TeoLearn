
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../../application/config/apiBase";
import { useAuth } from "../../application/context/AuthContext";
import { usePreferences } from "../../application/context/PreferencesContext";
import { solicitarFeedbackIA } from "../../application/services/feedbackIA";
import { playError, playSuccess, playPerfectStreak } from "../../application/services/sound";
import { speakText, stopSpeech } from "../../application/services/speech";
import {
  getCompletedExerciseIds,
  markExerciseCompletedLocal,
  guardarIntento,
  guardarLeccionCompletada,
  registerLessonAttemptLocal,
} from "../../application/services/progress";
import EjercicioRenderer from "../components/ui/exercises/EjercicioRenderer";

export default function Ejercicio() {
  const { leccionId } = useParams();
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const { usuarioDB, refrescarUsuarioDB } = useAuth();

  const [leccion, setLeccion] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [resultadoActual, setResultadoActual] = useState(null);
  const [avanzando, setAvanzando] = useState(false);
  const [isFeedbackSpeaking, setIsFeedbackSpeaking] = useState(false);
  const [rachaAciertos, setRachaAciertos] = useState(0);

  useEffect(() => () => stopSpeech(), []);
  useEffect(() => { obtenerDatos(); }, []);

  const obtenerDatos = async () => {
    try {
      const leccionResponse = await fetch(apiUrl(`/lecciones/${leccionId}`));
      const leccionData = await leccionResponse.json();
      setLeccion(leccionData);

      const ejerciciosResponse = await fetch(apiUrl(`/ejercicios/leccion/${leccionId}`));
      const ejerciciosData = await ejerciciosResponse.json();
      setEjercicios(ejerciciosData);

      const completados = new Set(getCompletedExerciseIds(leccionId));
      const siguientePendiente = ejerciciosData.findIndex(
        (ex) => !completados.has(String(ex.id))
      );

      if (siguientePendiente === -1 && ejerciciosData.length > 0) {
        navigate(`/resultado/${leccionId}`);
        return;
      }

      setActiveIndex(siguientePendiente === -1 ? 0 : siguientePendiente);
    } catch (error) {
      console.error("Error obteniendo ejercicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const evaluar = async (exercise, payload) => {
    setAvanzando(true);
    setResultadoActual({ ...payload, feedback: "Generando retroalimentación..." });

    if (preferences.soundEnabled) {
      if (payload.correcta) {
        setRachaAciertos((racha) => {
          const nuevaRacha = racha + 1;
          if (nuevaRacha >= 3) {
            playPerfectStreak();
          } else {
            playSuccess();
          }
          return nuevaRacha;
        });
      } else {
        setRachaAciertos(0);
        playError();
      }
    }

    if (usuarioDB?.id) {
      try {
        await guardarIntento({
          usuarioId: usuarioDB.id,
          ejercicioId: exercise.id,
          respuestaUsuario: payload.respuesta,
          correcta: payload.correcta,
          puntuacion: payload.puntuacion,
        });
      } catch (err) {
        console.error("No se pudo guardar el intento en la BD:", err);
      }
    }

    registerLessonAttemptLocal(leccionId, payload.correcta, payload.puntuacion);

    try {
      const feedback = await solicitarFeedbackIA({
        ejercicio: exercise,
        respuestaUsuario: payload.respuesta,
        correcta: payload.correcta,
        puntuacion: payload.puntuacion,
      });

      setResultadoActual((cur) => ({ ...cur, feedback }));

      if (preferences.ttsEnabled) {
        speakText(feedback, {
          onStart: () => setIsFeedbackSpeaking(true),
          onEnd: () => setIsFeedbackSpeaking(false),
          onError: () => setIsFeedbackSpeaking(false),
        });
      }

      if (payload.correcta) markExerciseCompletedLocal(leccionId, exercise.id);
      setAvanzando(false);
    } catch (error) {
      console.error("Error generando feedback:", error);
      const fallback = payload.correcta
        ? "Correcto. Repite el ejercicio para consolidar el aprendizaje."
        : "Respuesta por mejorar. Revisa el concepto y vuelve a intentarlo con calma.";
      setResultadoActual((cur) => ({ ...cur, feedback: fallback }));
      if (payload.correcta) markExerciseCompletedLocal(leccionId, exercise.id);
      setAvanzando(false);
    }
  };

  const toggleFeedbackSpeech = () => {
    if (!resultadoActual?.feedback) return;
    if (isFeedbackSpeaking) {
      stopSpeech();
      setIsFeedbackSpeaking(false);
      return;
    }
    speakText(resultadoActual.feedback, {
      onStart: () => setIsFeedbackSpeaking(true),
      onEnd: () => setIsFeedbackSpeaking(false),
      onError: () => setIsFeedbackSpeaking(false),
    });
  };

  const irAlSiguienteEjercicio = async () => {
    stopSpeech();
    setIsFeedbackSpeaking(false);

    const esUltimo = activeIndex >= ejercicios.length - 1;

    if (esUltimo) {
      const puntuacionTotal = ejercicios.reduce((s, ex) => s + (ex.puntos || 0), 0);

      if (usuarioDB?.id) {
        try {
          await guardarLeccionCompletada(usuarioDB.id, Number(leccionId), puntuacionTotal);
          await refrescarUsuarioDB();
        } catch (err) {
          console.error("No se pudo guardar la lección completada:", err);
        }
      }

      navigate(`/resultado/${leccionId}`);
      return;
    }

    setResultadoActual(null);
    setActiveIndex((cur) => cur + 1);
  };

  const currentExercise = ejercicios[activeIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Cargando ejercicios...
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

        <div className="mb-10">
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
          {currentExercise ? (
            <article
              key={currentExercise.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Ejercicio {activeIndex + 1} de {ejercicios.length} — {currentExercise.tipo}
                  </p>
                  <h2 className="text-2xl font-extrabold">{currentExercise.pregunta}</h2>
                </div>

                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-bold self-start">
                  +{currentExercise.puntos} XP
                </span>
              </div>

              {/* Toda la lógica de "qué tipo de ejercicio renderizar" vive aquí ahora */}
              <EjercicioRenderer
                exercise={currentExercise}
                disabled={avanzando || !!resultadoActual}
                moduloSlug={leccion.modulo_slug}
                onEvaluate={(payload) => evaluar(currentExercise, payload)}
              />

              {resultadoActual && (
                <div
                  className={`mt-5 rounded-xl p-4 ${resultadoActual.correcta ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold">
                      {resultadoActual.correcta
                        ? `Correcto +${resultadoActual.puntuacion} XP. Puedes continuar cuando estés listo.`
                        : "Respuesta incorrecta. Revisa la retroalimentación y vuelve a intentarlo."}
                    </p>

                    <button
                      type="button"
                      onClick={toggleFeedbackSpeech}
                      className="inline-flex items-center gap-1 text-xs font-bold shrink-0"
                    >
                      {isFeedbackSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {isFeedbackSpeaking ? "Detener" : "Escuchar"}
                    </button>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-line mt-2">
                    {resultadoActual.feedback}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {resultadoActual.correcta ? (
                      <button
                        type="button"
                        onClick={irAlSiguienteEjercicio}
                        className="bg-gray-950 text-white px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        {activeIndex >= ejercicios.length - 1 ? "Finalizar ejercicio" : "Siguiente ejercicio"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeech();
                          setIsFeedbackSpeaking(false);
                          setResultadoActual(null);
                        }}
                        className="bg-brand-pink text-white px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        Intentar nuevamente
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}