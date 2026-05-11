import { useParams, useNavigate } from "react-router-dom";
import { unidadesData } from "../../data/unidadesData";

// Contenido de ejemplo por lección
const LECCION_CONTENT = {
  1: {
    modulo: "RITMO",
    titulo: "¿Qué es el pulso?",
    subtitulo: "El latido de la música",
    teoria: [
      { head: "¿Qué es el pulso?", body: "El pulso es la unidad básica de tiempo en la música. Es constante, regular y sirve como base sobre la que se construye todo lo demás. Piensa en el tic-tac de un reloj o en los latidos de tu corazón." },
      { head: "Pulso vs Ritmo", body: "El pulso es constante (como un metrónomo), mientras que el ritmo puede variar, acelerarse o desacelerarse sobre esa base. El ritmo es la organización de los sonidos en el tiempo." },
    ],
    tip: "Marca el pulso dando palmadas mientras escuchas cualquier canción. Notarás que siempre es regular.",
    color: "bg-ritmo",
    colorText: "text-ritmo",
  },
  2: {
    modulo: "RITMO",
    titulo: "Compás musical",
    subtitulo: "Organiza los pulsos en grupos",
    teoria: [
      { head: "¿Qué es el compás?", body: "El compás es la agrupación regular de pulsos. El compás de 4/4 (cuatro cuartos) es el más común: agrupa 4 pulsos por cada compás y es la base del pop, rock y la mayoría de música occidental." },
      { head: "Tipos de compás", body: "2/4: marcha y polka. 3/4: vals. 4/4: pop y rock. 6/8: baladas e himnos. El numerador indica cuántos tiempos hay, el denominador qué figura vale un tiempo." },
    ],
    tip: "La indicación de compás aparece al inicio de una partitura como una fracción. ¡Es la firma rítmica de la pieza!",
    color: "bg-ritmo",
    colorText: "text-ritmo",
  },
};

const FALLBACK = {
  modulo: "LECCIÓN",
  titulo: "Contenido de la lección",
  subtitulo: "Teoría musical interactiva",
  teoria: [
    { head: "Concepto principal", body: "Este es el contenido teórico de la lección. Incluye texto explicativo, ejemplos y notas de estudio." },
  ],
  tip: "Revisa el material, luego practica con el ejercicio y el quiz.",
  color: "bg-brand-pink",
  colorText: "text-brand-pink",
};

export default function DetalleLeccion() {
  const { leccionId, unidadId } = useParams();
  const navigate = useNavigate();

  const data = LECCION_CONTENT[leccionId] || FALLBACK;

  // Detectar moduloId para volver
  let moduloId = null;
  for (const [mod, unidades] of Object.entries(unidadesData)) {
    for (const u of unidades) {
      if (u.id === Number(unidadId)) { moduloId = mod; break; }
    }
    if (moduloId) break;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">

        {/* Volver */}
        <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition">
          ← Volver a lecciones
        </button>

        {/* Badge módulo */}
        <p className={`text-xs font-bold ${data.colorText} tracking-widest uppercase mb-2`}>{data.modulo}</p>

        {/* Título */}
        <h1 className="text-4xl font-extrabold mb-1" style={{fontFamily:'Syne,sans-serif'}}>{data.titulo}</h1>
        <p className="text-gray-500 mb-8">{data.subtitulo}</p>

        {/* Teoría */}
        {data.teoria.map((t, i)=>(
          <div key={i} className="mb-6">
            <h2 className="text-xl font-bold mb-2" style={{fontFamily:'Syne,sans-serif'}}>{t.head}</h2>
            <p className="text-gray-600 leading-relaxed">{t.body}</p>
          </div>
        ))}

        {/* Tip destacado */}
        <div className="bg-brand-yellow/20 border-l-4 border-brand-yellow rounded-xl p-4 mb-10 flex gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-gray-700">{data.tip}</p>
        </div>

        {/* Acciones estilo SonAI */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={()=>navigate(`/ejercicio/${leccionId}`)}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-card-hover transition text-left"
          >
            <div className="bg-brand-pink w-10 h-10 rounded-xl flex items-center justify-center text-white">🤖</div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">PRÁCTICA</p>
              <p className="font-semibold text-sm">Ejercicio con IA</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </button>

          <button
            onClick={()=>navigate(`/quiz/${leccionId}`)}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-card-hover transition text-left"
          >
            <div className="bg-brand-blue w-10 h-10 rounded-xl flex items-center justify-center text-white">❓</div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">EVALUACIÓN</p>
              <p className="font-semibold text-sm">Quiz auto-corregido</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </button>
        </div>

        {/* Marcar completada */}
        <button
          onClick={()=>navigate(-1)}
          className="w-full bg-brand-dark text-white font-semibold py-4 rounded-2xl hover:bg-opacity-90 transition flex items-center justify-center gap-2"
        >
          ✅ Lección completada
        </button>

      </div>
    </div>
  );
}