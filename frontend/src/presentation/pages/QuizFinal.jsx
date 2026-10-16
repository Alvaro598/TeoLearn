import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Lock } from "lucide-react";
import { useAuth } from "../../application/context/useAuth";
import { apiUrl } from "../../application/config/apiBase";
import { authFetch } from "../../application/services/api";
import {
  getQuizFinalProgress,
  isQuizFinalCompleted,
  guardarResultadoQuizFinal,
} from "../../application/services/progress";
import { obtenerEstadoUsuario } from "../../application/services/userState";
import { playSuccess, playError } from "../../application/services/sound";
import {
  PREGUNTAS_POR_MODULO,
  PREGUNTAS_EVALUACION_FINAL,
  calcularAciertos,
} from "../../../../shared/quizQuestions.js";

function shuffleOptions(options = []) {
  if (!Array.isArray(options) || options.length < 2) return options;

  const next = [...options];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

const NOMBRE_MODULO = { ritmo: "Ritmo", melodia: "Melodía", armonia: "Armonía" };


// ─── Componente principal ─────────────────────────────────────────────────────
export default function QuizFinal({ mode = "final" }) {
  const { moduloSlug: routeModuloSlug } = useParams();
  const moduloSlug = mode === "module" ? routeModuloSlug : null;
  const { usuarioDB }   = useAuth();
  const navigate = useNavigate();
  const [quizFinalCompletado, setQuizFinalCompletado] = useState(
    () => !moduloSlug && isQuizFinalCompleted()
  );

  const preguntas = useMemo(() => {
    if (moduloSlug) {
      return PREGUNTAS_POR_MODULO[moduloSlug] || [];
    }
    return PREGUNTAS_EVALUACION_FINAL;
  }, [moduloSlug]);

  const nombreModulo = moduloSlug ? NOMBRE_MODULO[moduloSlug] : "Evaluación final";

  const [respuestas, setResponder]       = useState({});
  const [acceso, setAcceso]              = useState(null); // null=cargando, true/false
  const [porcentaje, setPorcentaje]      = useState(0);

  useEffect(() => {
    if (moduloSlug || !usuarioDB?.id) return;
    let cancelled = false;
    obtenerEstadoUsuario()
      .then((state) => {
        if (!cancelled && state.resultado_quiz_final) {
          setQuizFinalCompletado(true);
        }
      })
      .catch((error) => console.error("No se pudo consultar el quiz guardado:", error));
    return () => {
      cancelled = true;
    };
  }, [moduloSlug, usuarioDB?.id]);

  // Verificar acceso del módulo o del quiz final según la ruta
  useEffect(() => {
    if (!usuarioDB?.id || quizFinalCompletado) {
      return;
    }

    if (moduloSlug) {
      authFetch(apiUrl(`/progreso/modulo/${usuarioDB.id}/${moduloSlug}`))
        .then((r) => r.json())
        .then((data) => {
          setPorcentaje(data.porcentaje || 0);
          setAcceso(data.completado === true);
        })
        .catch(() => setAcceso(false));
      return;
    }

    // Ruta /quiz-final: confirmar que el acceso del usuario al examen final
    // esté desbloqueado con el mismo cálculo del navbar.
    getQuizFinalProgress()
      .then((state) => {
        setAcceso(Boolean(state.unlocked));
        setPorcentaje(state.requiredModules.length
          ? Math.round(
              (state.requiredModules.filter((m) => m.unlocked).length /
                state.requiredModules.length) *
                100
            )
          : 0);
      })
      .catch(() => {
        setAcceso(false);
        setPorcentaje(0);
      });
  }, [usuarioDB?.id, moduloSlug, quizFinalCompletado]);

  const aciertos = useMemo(
    () => calcularAciertos(preguntas, respuestas),
    [preguntas, respuestas]
  );

  const opcionesAleatoriasPorPregunta = useMemo(() => {
    const porPregunta = {};
    preguntas.forEach((pregunta) => {
      porPregunta[pregunta.id] = shuffleOptions(pregunta.opciones ?? []);
    });
    return porPregunta;
  }, [preguntas]);

  const responder = (pregunta, opcion) => {
    if (respuestas[pregunta.id]) return; // no revertir
    const siguientesRespuestas = { ...respuestas, [pregunta.id]: opcion };
    setResponder(siguientesRespuestas);
    opcion === pregunta.respuesta ? playSuccess() : playError();

    if (preguntas.every((item) => siguientesRespuestas[item.id])) {
      const resultado = {
        moduloSlug: moduloSlug || "Evaluación final",
        preguntas,
        respuestas: siguientesRespuestas,
        nombreUsuario: usuarioDB?.nombre,
      };
      sessionStorage.setItem("teolearn-quiz-result", JSON.stringify(resultado));

      if (!moduloSlug) {
        guardarResultadoQuizFinal(resultado)
          .then(() => setQuizFinalCompletado(true))
          .catch((error) => console.error("No se pudo guardar el resultado final:", error));
      }
      navigate("/resultado-quiz", {
        state: { tipo: moduloSlug ? "modulo" : "final", resultado },
      });
    }
  };

  const todasRespondidas = preguntas.every((p) => respuestas[p.id]);

  if (quizFinalCompletado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-pink">
            Evaluación final completada
          </p>
          <h1 className="mb-3 text-2xl font-extrabold text-gray-950">
            Ya realizaste este quiz
          </h1>
          <p className="mb-6 text-gray-600">
            No puedes responderlo nuevamente, pero puedes consultar y descargar tus resultados.
          </p>
          <Link
            to="/resultado-quiz"
            state={{ tipo: "final" }}
            className="inline-flex rounded-xl bg-brand-blue px-5 py-3 font-extrabold text-white"
          >
            Ver resultados
          </Link>
        </div>
      </div>
    );
  }

  if (acceso === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-semibold">Verificando acceso...</p>
      </div>
    );
  }

  if (!acceso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <Lock size={40} className="mx-auto text-gray-400 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-brand-pink mb-2">
            Quiz bloqueado
          </p>
          <h1 className="text-2xl font-extrabold text-gray-950 mb-3">
            Completa el módulo para desbloquear el quiz
          </h1>
          <p className="text-gray-600 mb-6">
            Progreso actual: <strong>{porcentaje}%</strong>. Necesitas 100% para acceder.
          </p>
          <Link
            to={`/modulos/${moduloSlug}/unidades`}
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
          >
            Continuar lecciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/modulos"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-bold mb-6"
        >
          <ArrowLeft size={16} />
          Volver a módulos
        </Link>

        <p className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-2">
          Evaluación · {nombreModulo}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-950 mb-2">
              Quiz de {nombreModulo}
            </h1>
            <p className="text-gray-500">
              {preguntas.length} preguntas · {moduloSlug
                ? "Casos de aplicación del módulo."
                : "18 retos de aplicación nuevos; preguntas distintas a los quizzes de módulo."}
            </p>
          </div>

          <p className="text-sm font-semibold text-gray-500">
            {todasRespondidas ? "Preparando tus resultados..." : "Responde todas las preguntas"}
          </p>
        </div>

        {/* Barra de puntaje */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-extrabold text-lg">
              Puntaje: {aciertos} / {preguntas.length}
            </p>
            <p className="text-sm text-gray-500">
              {Math.round((aciertos / preguntas.length) * 100)}%
            </p>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full">
            <div
              className="h-3 rounded-full bg-brand-pink transition-all"
              style={{ width: `${(aciertos / preguntas.length) * 100}%` }}
            />
          </div>
          {!todasRespondidas && (
            <p className="text-xs text-gray-400 mt-2">
              Responde todas las preguntas para habilitar la descarga del PDF.
            </p>
          )}
        </div>

        {/* Preguntas */}
        <div className="space-y-5">
          {preguntas.map((pregunta) => {
            const opcionesAleatorias = opcionesAleatoriasPorPregunta[pregunta.id] ?? [];

            return (
              <article
                key={pregunta.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-2">
                  {pregunta.moduloSlug && `${NOMBRE_MODULO[pregunta.moduloSlug]} · `}
                  Pregunta {String(pregunta.id).split("-").at(-1)} de {preguntas.length}
                </p>
                <h2 className="text-lg font-extrabold mb-4">{pregunta.pregunta}</h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  {opcionesAleatorias.map((opcion) => {
                    const seleccionada = respuestas[pregunta.id] === opcion;
                    const correcta     = opcion === pregunta.respuesta;
                    const respondida   = !!respuestas[pregunta.id];
                    const claseEstado = !respondida
                      ? "quiz-answer--idle"
                      : seleccionada
                        ? correcta
                          ? "quiz-answer--correct"
                          : "quiz-answer--incorrect"
                        : correcta
                          ? "quiz-answer--revealed-correct"
                          : "quiz-answer--muted";

                    return (
                      <button
                        key={opcion}
                        onClick={() => responder(pregunta, opcion)}
                        disabled={respondida}
                        className={`quiz-answer p-4 rounded-xl text-left font-bold flex items-center gap-2 transition ${claseEstado} ${
                          respondida
                            ? seleccionada
                              ? correcta
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              : correcta
                              ? "bg-green-50 text-green-700 border border-green-300"
                              : "bg-gray-100 text-gray-500 opacity-60"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                      >
                        {respondida && seleccionada && correcta && (
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                        )}
                        {respondida && seleccionada && !correcta && (
                          <XCircle size={16} className="text-red-500 shrink-0" />
                        )}
                        {opcion}
                      </button>
                    );
                  })}
                </div>
                {respuestas[pregunta.id] && pregunta.explicacion && (
                  <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                    <strong>Por qué:</strong> {pregunta.explicacion}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
