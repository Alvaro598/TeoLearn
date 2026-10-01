import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Lock } from "lucide-react";
import { useAuth } from "../../application/context/AuthContext";
import { apiUrl } from "../../application/config/apiBase";
import {
  getQuizFinalProgress,
  isQuizFinalCompleted,
  markQuizFinalCompleted,
} from "../../application/services/progress";
import { playSuccess, playError } from "../../application/services/sound";

function shuffleOptions(options = []) {
  if (!Array.isArray(options) || options.length < 2) return options;

  const next = [...options];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

// ─── Banco de preguntas por módulo ────────────────────────────────────────────
const PREGUNTAS_POR_MODULO = {
  ritmo: [
    { id: 1, pregunta: "¿Qué es el pulso musical?", opciones: ["Un tiempo constante e igual", "Una nota aguda", "Un acorde mayor", "Un cambio de volumen"], respuesta: "Un tiempo constante e igual" },
    { id: 2, pregunta: "En un compás de 4/4, ¿cuántos tiempos hay por compás?", opciones: ["4", "3", "2", "6"], respuesta: "4" },
    { id: 3, pregunta: "¿Cuánto vale una blanca en tiempos?", opciones: ["2 tiempos", "1 tiempo", "4 tiempos", "0.5 tiempos"], respuesta: "2 tiempos" },
    { id: 4, pregunta: "¿Cuántas corcheas equivalen a una negra?", opciones: ["2", "4", "1", "8"], respuesta: "2" },
    { id: 5, pregunta: "¿Qué indica el numerador de la indicación de compás?", opciones: ["Cantidad de tiempos por compás", "Duración de la figura base", "El tempo en BPM", "La tonalidad"], respuesta: "Cantidad de tiempos por compás" },
    { id: 6, pregunta: "Un compás de 3/4 tiene sensación de:", opciones: ["Vals", "Marcha", "Polka", "Blues"], respuesta: "Vals" },
    { id: 7, pregunta: "¿Qué es una síncopa?", opciones: ["Acento en tiempo débil que anticipa el siguiente", "Una figura de 4 tiempos", "Un silencio de redonda", "El primer tiempo del compás"], respuesta: "Acento en tiempo débil que anticipa el siguiente" },
    { id: 8, pregunta: "¿Qué ventaja tiene el AudioContext scheduling sobre setInterval para el metrónomo?", opciones: ["Elimina el drift acumulativo", "Usa menos CPU", "No necesita navegador", "Produce sonidos más fuertes"], respuesta: "Elimina el drift acumulativo" },
  ],
  melodia: [
    { id: 1, pregunta: "¿Cuál es el equivalente anglosajón de 'Sol'?", opciones: ["G", "A", "F", "E"], respuesta: "G" },
    { id: 2, pregunta: "¿Cuál es la fórmula de tonos y semitonos de la escala mayor?", opciones: ["T-T-S-T-T-T-S", "T-S-T-T-S-T-T", "S-T-T-T-S-T-T", "T-T-T-S-T-T-S"], respuesta: "T-T-S-T-T-T-S" },
    { id: 3, pregunta: "¿Qué intervalo hay entre C y G?", opciones: ["Quinta justa", "Tercera mayor", "Cuarta justa", "Sexta menor"], respuesta: "Quinta justa" },
    { id: 4, pregunta: "Las notas de las líneas del pentagrama en clave de Sol son:", opciones: ["E-G-B-D-F", "C-D-E-F-G", "A-B-C-D-E", "F-A-C-E-G"], respuesta: "E-G-B-D-F" },
    { id: 5, pregunta: "¿Cuál es la relativa menor de C mayor?", opciones: ["A menor", "E menor", "D menor", "G menor"], respuesta: "A menor" },
    { id: 6, pregunta: "C# y Db son enarmónicas porque:", opciones: ["Suenan igual pero se escriben diferente", "Son la misma nota escrita igual", "Tienen distinta altura", "Son de octavas distintas"], respuesta: "Suenan igual pero se escriben diferente" },
    { id: 7, pregunta: "¿Qué grado de la escala mayor se llama 'Dominante'?", opciones: ["5to", "3er", "7mo", "1ro"], respuesta: "5to" },
    { id: 8, pregunta: "Una frase melódica que termina en la tónica genera sensación de:", opciones: ["Reposo y conclusión", "Tensión sin resolver", "Inicio de sección nueva", "Cambio de tonalidad"], respuesta: "Reposo y conclusión" },
  ],
  armonia: [
    { id: 1, pregunta: "¿Qué notas forman la tríada de C mayor?", opciones: ["C-E-G", "C-D-E", "C-F-A", "C-G-B"], respuesta: "C-E-G" },
    { id: 2, pregunta: "¿Cuántos semitonos hay entre la tónica y la 3ª de un acorde menor?", opciones: ["3", "4", "5", "2"], respuesta: "3" },
    { id: 3, pregunta: "¿Qué función armónica da sensación de máxima tensión?", opciones: ["Dominante (V)", "Tónica (I)", "Subdominante (IV)", "Mediante (III)"], respuesta: "Dominante (V)" },
    { id: 4, pregunta: "¿Cómo se llama la cadencia V → I?", opciones: ["Auténtica", "Plagal", "Semicadencia", "Rota"], respuesta: "Auténtica" },
    { id: 5, pregunta: "¿Qué acorde es el 'vi' en C mayor?", opciones: ["A menor", "F mayor", "G mayor", "D menor"], respuesta: "A menor" },
    { id: 6, pregunta: "La progresión I-V-vi-IV es característica de:", opciones: ["Pop moderno", "Jazz bebop", "Flamenco", "Blues de 12 compases"], respuesta: "Pop moderno" },
    { id: 7, pregunta: "En la primera inversión de C mayor, ¿qué nota está en el bajo?", opciones: ["E", "C", "G", "B"], respuesta: "E" },
    { id: 8, pregunta: "El acorde VII° (disminuido) tiende a resolver hacia:", opciones: ["El acorde I (tónica)", "El acorde IV", "El acorde VI", "El acorde II"], respuesta: "El acorde I (tónica)" },
  ],
};

const NOMBRE_MODULO = { ritmo: "Ritmo", melodia: "Melodía", armonia: "Armonía" };


// ─── Componente principal ─────────────────────────────────────────────────────
export default function QuizModulo() {
  const { moduloSlug }  = useParams();
  const { usuarioDB }   = useAuth();
  const navigate = useNavigate();
  const quizFinalCompletado = !moduloSlug && isQuizFinalCompleted();

  const preguntas = useMemo(() => {
    if (moduloSlug) {
      return PREGUNTAS_POR_MODULO[moduloSlug] || [];
    }

    return Object.entries(PREGUNTAS_POR_MODULO).flatMap(([slug, moduloPreguntas]) =>
      moduloPreguntas.map((pregunta) => ({
        ...pregunta,
        id: `${slug}-${pregunta.id}`,
        moduloSlug: slug,
      }))
    );
  }, [moduloSlug]);

  const nombreModulo = moduloSlug ? NOMBRE_MODULO[moduloSlug] : "Evaluación final";

  const [respuestas, setResponder]       = useState({});
  const [acceso, setAcceso]              = useState(null); // null=cargando, true/false
  const [porcentaje, setPorcentaje]      = useState(0);

  // Verificar acceso del módulo o del quiz final según la ruta
  useEffect(() => {
    if (!usuarioDB?.id || quizFinalCompletado) {
      return;
    }

    if (moduloSlug) {
      fetch(apiUrl(`/progress/modulo/${usuarioDB.id}/${moduloSlug}`))
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
    () => preguntas.filter((p) => respuestas[p.id] === p.respuesta).length,
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
      sessionStorage.setItem(
        "teolearn-quiz-result",
        JSON.stringify({
          moduloSlug: moduloSlug || "Evaluación final",
          preguntas,
          respuestas: siguientesRespuestas,
          nombreUsuario: usuarioDB?.nombre,
        })
      );
      if (!moduloSlug) {
        markQuizFinalCompleted({
          moduloSlug: "Evaluación final",
          preguntas,
          respuestas: siguientesRespuestas,
          nombreUsuario: usuarioDB?.nombre,
        });
      }
      navigate("/resultado-quiz");
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
              {preguntas.length} preguntas · Descargable como PDF para pruebas de usabilidad.
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
                  Pregunta {pregunta.id}
                </p>
                <h2 className="text-lg font-extrabold mb-4">{pregunta.pregunta}</h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  {opcionesAleatorias.map((opcion) => {
                    const seleccionada = respuestas[pregunta.id] === opcion;
                    const correcta     = opcion === pregunta.respuesta;
                    const respondida   = !!respuestas[pregunta.id];

                    return (
                      <button
                        key={opcion}
                        onClick={() => responder(pregunta, opcion)}
                        disabled={respondida}
                        className={`p-4 rounded-xl text-left font-bold flex items-center gap-2 transition ${
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
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}