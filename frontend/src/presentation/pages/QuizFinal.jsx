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
    { id: 1, pregunta: "Repites el mismo patrón de cuatro negras a 60 y luego a 100 BPM. ¿Qué debe cambiar?", opciones: ["El espacio en segundos entre pulsos", "El orden de los golpes", "La cantidad de pulsos del patrón", "La figura rítmica de cada golpe"], respuesta: "El espacio en segundos entre pulsos", explicacion: "El tempo modifica la velocidad del pulso. Si el patrón se conserva, también se conservan el orden y la cantidad de golpes." },
    { id: 2, pregunta: "Tocas un patrón en 3/4 y otro en 4/4. ¿Qué pista permite reconocer dónde termina cada compás?", opciones: ["El acento vuelve después de tres pulsos en 3/4 y de cuatro en 4/4", "El tempo siempre es mayor en 3/4", "El patrón de 3/4 debe tener más golpes", "El primer compás no lleva acento"], respuesta: "El acento vuelve después de tres pulsos en 3/4 y de cuatro en 4/4", explicacion: "El numerador indica cuántos pulsos agrupa el compás; el primer pulso ayuda a reconocer el inicio del grupo." },
    { id: 3, pregunta: "En un compás de 4/4 ya colocaste una blanca y dos corcheas. ¿Qué duración falta para completar el compás?", opciones: ["Una negra", "Una blanca", "Dos negras", "Dos corcheas"], respuesta: "Una negra", explicacion: "La blanca ocupa dos pulsos y las dos corcheas ocupan uno más: falta un pulso, equivalente a una negra." },
    { id: 4, pregunta: "Cuentas cuatro pulsos parejos y oyes ocho golpes repartidos por igual. ¿Cómo se organiza cada pulso?", opciones: ["En dos corcheas", "En una redonda", "En un silencio de blanca", "En cuatro negras"], respuesta: "En dos corcheas", explicacion: "Dos ataques por pulso dividen cada negra en dos partes iguales: dos corcheas." },
    { id: 5, pregunta: "En un patrón de cuatro pulsos falta el golpe del pulso 2. ¿Qué haces para conservar el ritmo?", opciones: ["Sigues contando el pulso 2 en silencio", "Acortas el compás a tres pulsos", "Aceleras para saltar el espacio", "Mueves el pulso 2 al final"], respuesta: "Sigues contando el pulso 2 en silencio", explicacion: "El silencio ocupa su duración dentro del compás. El pulso continúa aunque no haya un ataque audible." },
    { id: 6, pregunta: "El metrónomo marca cuatro clics y tus golpes caen justo antes de cada clic. ¿Qué debes corregir?", opciones: ["La sincronización: desplazar los golpes para hacerlos coincidir", "El número de pulsos del compás", "La duración de las negras", "La agrupación en corcheas"], respuesta: "La sincronización: desplazar los golpes para hacerlos coincidir", explicacion: "Si te adelantas, ajusta el momento de tus golpes hasta hacerlos coincidir con la referencia estable del metrónomo." },
  ],
  melodia: [
    { id: 1, pregunta: "Usando Do4 como referencia, ¿qué intervalo forma Sol4 por encima?", opciones: ["Quinta justa", "Tercera mayor", "Cuarta justa", "Segunda mayor"], respuesta: "Quinta justa", explicacion: "De Do a Sol hay cinco nombres de nota contando ambos extremos: Do-Re-Mi-Fa-Sol, una quinta." },
    { id: 2, pregunta: "En clave de Sol, una nota está en la segunda línea desde abajo. ¿Qué nota es?", opciones: ["Sol4", "Mi4", "Si4", "Re5"], respuesta: "Sol4", explicacion: "La clave de Sol fija la segunda línea del pentagrama como Sol4; las demás posiciones se leen desde esa referencia." },
    { id: 3, pregunta: "¿Por qué Do sostenido y Re bemol pueden sonar igual aunque se escriban distinto?", opciones: ["Son nombres enarmónicos de la misma altura", "Uno dura el doble que el otro", "Pertenecen a octavas distintas", "Uno siempre suena más fuerte"], respuesta: "Son nombres enarmónicos de la misma altura", explicacion: "El sostenido sube un semitono y el bemol baja un semitono; en este caso llegan a la misma tecla y altura." },
    { id: 4, pregunta: "Do mayor y La menor natural usan las mismas notas. ¿Qué cambia para que el centro se sienta distinto?", opciones: ["La nota que funciona como punto de reposo", "La cantidad de notas de la escala", "El orden de tonos y semitonos de La menor", "El número de pulsos por compás"], respuesta: "La nota que funciona como punto de reposo", explicacion: "Do mayor y La menor comparten notas, pero comienzan y descansan en tónicas diferentes, lo que cambia su organización y color." },
    { id: 5, pregunta: "Al subir por la escala de Do mayor, ¿entre qué pareja consecutiva hay un semitono?", opciones: ["Mi-Fa", "Do-Re", "Re-Mi", "Fa-Sol"], respuesta: "Mi-Fa", explicacion: "En Do mayor los semitonos están entre Mi-Fa y Si-Do; los demás pasos consecutivos de esa escala son tonos." },
    { id: 6, pregunta: "Una melodía avanza Do-Re-Mi-Fa, nota por nota. ¿Cómo se describe ese movimiento?", opciones: ["Por grado, mediante pasos cercanos", "Por saltos de quinta", "Como un acorde simultáneo", "Como una progresión de acordes"], respuesta: "Por grado, mediante pasos cercanos", explicacion: "Moverse entre notas vecinas de la escala es movimiento por grado; los saltos recorren distancias más amplias." },
  ],
  armonia: [
    { id: 1, pregunta: "¿Qué rasgo convierte C-E-G en una tríada?", opciones: ["Reúne tónica, tercera y quinta en tres notas", "Contiene cuatro notas separadas por tonos", "Es una escala tocada en orden", "Tiene dos notas repetidas en octavas"], respuesta: "Reúne tónica, tercera y quinta en tres notas", explicacion: "Una tríada reúne tres alturas: la tónica, una tercera y una quinta; puede sonar como acorde o arpegio." },
    { id: 2, pregunta: "Comparas Do mayor (C-E-G) con Do menor (C-E♭-G). ¿Qué cambio explica la cualidad menor?", opciones: ["La tercera baja un semitono", "La tónica sube un semitono", "La quinta baja dos tonos", "Se añade una cuarta nota"], respuesta: "La tercera baja un semitono", explicacion: "La raíz y la quinta se mantienen; la tercera Mi baja a Mi bemol, cambiando el acorde de mayor a menor." },
    { id: 3, pregunta: "En Do mayor, ¿qué función cumple Sol mayor (G-B-D) antes de volver a Do mayor?", opciones: ["Dominante: crea tensión y tiende a resolver en la tónica", "Tónica: representa el reposo", "Subdominante: prepara la salida", "Relativa menor: comparte todas las notas"], respuesta: "Dominante: crea tensión y tiende a resolver en la tónica", explicacion: "Sol mayor es V en Do mayor. Su función dominante crea expectativa de resolución hacia Do, el acorde I." },
    { id: 4, pregunta: "Una frase termina con Fa mayor seguido de Do mayor (IV-I). ¿Qué cadencia escuchas?", opciones: ["Plagal", "Auténtica", "Semicadencia", "Progresión que termina en V"], respuesta: "Plagal", explicacion: "La cadencia plagal va de IV a I. La auténtica va de V a I y la semicadencia termina en V." },
    { id: 5, pregunta: "En Do mayor, analizas la secuencia Do-Fa-Sol-Do. ¿Qué números romanos corresponden?", opciones: ["I-IV-V-I", "I-V-vi-IV", "ii-V-I", "IV-I-V-vi"], respuesta: "I-IV-V-I", explicacion: "Do es I, Fa es IV y Sol es V en Do mayor; volver a Do completa I-IV-V-I." },
    { id: 6, pregunta: "En Do mayor, una progresión Re menor-Sol mayor-Do mayor se escribe:", opciones: ["ii-V-I", "I-IV-V", "I-V-vi-IV", "IV-I-IV"], respuesta: "ii-V-I", explicacion: "Re menor es ii, Sol mayor es V y Do mayor es I. La secuencia lleva preparación y tensión hacia el reposo." },
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
              {preguntas.length} preguntas · {moduloSlug
                ? "Casos de aplicación del módulo."
                : "6 por categoría; integra conceptos de toda la ruta."}
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
