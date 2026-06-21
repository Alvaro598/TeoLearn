import { useState } from "react";
import { usePreferences } from "../../../application/context/PreferencesContext";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Music,
  Headphones,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  Zap,
  BarChart2,
  MessageCircle,
} from "lucide-react";

// ─── Pasos del onboarding inicial ────────────────────────────────────────────
const ONBOARDING_STEPS = [
  {
    id: "bienvenida",
    icon: <Music size={40} className="text-brand-pink" />,
    titulo: "Bienvenido a TeoLearn",
    cuerpo:
      "Aprenderás teoría musical de forma progresiva: primero el ritmo que te sostiene, luego la melodía que te guía y finalmente la armonía que lo une todo.",
    imagen: null,
    accion: null,
  },
  {
    id: "estructura",
    icon: <BookOpen size={40} className="text-brand-blue" />,
    titulo: "Cómo está organizado",
    cuerpo:
      "El contenido tiene tres módulos (Ritmo, Melodía, Armonía), cada uno con 4 unidades temáticas. Cada unidad agrupa 3 lecciones con teoría, práctica auditiva y editor MIDI.",
    imagen: (
      <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm font-mono text-gray-600 dark:text-gray-300 leading-relaxed">
        <p>📦 Módulo → ⚡ Ritmo</p>
        <p className="pl-4">📗 Unidad 1 → Fundamentos temporales</p>
        <p className="pl-8">📝 Lección 1 → Pulso</p>
        <p className="pl-8">📝 Lección 2 → Tempo</p>
        <p className="pl-8">📝 Lección 3 → Metrónomo</p>
      </div>
    ),
    accion: null,
  },
  {
    id: "ejercicios",
    icon: <Headphones size={40} className="text-green-500" />,
    titulo: "Tipos de ejercicios",
    cuerpo:
      "Cada lección incluye tres tipos de práctica que van de la comprensión a la ejecución.",
    imagen: (
      <div className="mt-4 grid gap-2 text-sm">
        {[
          {
            emoji: "🔘",
            tipo: "Selección múltiple",
            desc: "Pon a prueba tu comprensión conceptual. Tienes entre 15 y 30 s.",
            color:
              "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
          },
          {
            emoji: "🎧",
            tipo: "Auditivo",
            desc: "Escucha e identifica notas o patrones. Tiempo: 15-30 s.",
            color:
              "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
          },
          {
            emoji: "🎹",
            tipo: "Editor MIDI",
            desc: "Construye el patrón con notas reales. Tienes hasta 1 min.",
            color:
              "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
          },
        ].map((e) => (
          <div
            key={e.tipo}
            className={`flex gap-3 items-start rounded-xl p-3 ${e.color}`}
          >
            <span className="text-xl">{e.emoji}</span>
            <div>
              <p className="font-bold">{e.tipo}</p>
              <p className="opacity-80">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
    accion: null,
  },
  {
    id: "progreso",
    icon: <BarChart2 size={40} className="text-brand-yellow" />,
    titulo: "Tu progreso y XP",
    cuerpo:
      "Cada ejercicio correcto suma XP. Al acumular 200 XP subes de nivel. Puedes ver tu avance por módulo en el Dashboard y mantener una racha de práctica diaria.",
    imagen: (
      <div className="mt-4 flex gap-4 text-center text-sm">
        {[
          {
            label: "Nivel",
            val: "1",
            bg: "bg-gray-100 dark:bg-gray-800",
          },
          {
            label: "XP",
            val: "0",
            bg: "bg-brand-yellow",
          },
          {
            label: "Racha",
            val: "0🔥",
            bg: "bg-brand-pink",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex-1 rounded-2xl p-4 ${s.bg}`}
          >
            <p className="text-2xl font-extrabold">{s.val}</p>
            <p className="text-xs opacity-70 uppercase mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    ),
    accion: null,
  },
  {
    id: "tutor",
    icon: <MessageCircle size={40} className="text-indigo-500" />,
    titulo: "Tutor IA disponible",
    cuerpo:
      "En cualquier momento puedes abrir el chat con el Tutor IA para resolver dudas, pedir explicaciones adicionales o repasar un concepto. No reemplaza la práctica, la complementa.",
    imagen: null,
    accion: {
      label: "¡Comenzar!",
      ruta: "/dashboard",
    },
  },
];

// ─── Tutoriales contextuales por página ──────────────────────────────────────
export const PAGE_TUTORIALS = {
  dashboard: [
    {
      target: "stats-nivel",
      texto:
        "Aquí ves tu nivel actual y cuánto XP te falta para el siguiente.",
      posicion: "bottom",
    },
    {
      target: "categorias",
      texto:
        "Elige un módulo para comenzar. Te recomendamos empezar por Ritmo.",
      posicion: "top",
    },
  ],

  ejercicio: [
    {
      target: "ejercicio-header",
      texto:
        "Cada ejercicio tiene un tiempo límite. Cuando el cronómetro llega a cero se registra como tiempo agotado.",
      posicion: "bottom",
    },
    {
      target: "exercise-options",
      texto:
        "Selecciona tu respuesta antes de que se acabe el tiempo.",
      posicion: "top",
    },
  ],

  unidades: [
    {
      target: "unidades-grid",
      texto:
        "Completa todas las lecciones de una unidad para desbloquear la siguiente.",
      posicion: "bottom",
    },
  ],
};

// ─── Componente principal ────────────────────────────────────────────────────
export default function OnboardingTutorial() {
  const { preferences, updatePreferences } = usePreferences();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(
    preferences.onboardingStep ?? 0
  );

  const [saliendo, setSaliendo] = useState(false);

  const total = ONBOARDING_STEPS.length;

  if (preferences.onboardingDone) return null;

  const step =
    ONBOARDING_STEPS[paso] ??
    ONBOARDING_STEPS[0];

  const esPrimero = paso === 0;
  const esUltimo = paso === total - 1;

  const cambiarPaso = (nuevoPaso) => {
    setPaso(nuevoPaso);

    updatePreferences({
      onboardingStep: nuevoPaso,
    });
  };

  const cerrar = (ruta = null) => {
    setSaliendo(true);

    setTimeout(() => {
      updatePreferences({
        onboardingDone: true,
        onboardingStep: 0,
      });

      if (ruta) {
        navigate(ruta);
      }
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-950/70 z-[80] flex items-center justify-center px-4 transition-opacity duration-300 ${
        saliendo ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial de bienvenida"
    >
      <div className="bg-white dark:bg-gray-900 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-1 bg-brand-pink transition-all duration-500"
            style={{
              width: `${((paso + 1) / total) * 100}%`,
            }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {paso + 1} / {total}
            </span>

            <button
              onClick={() => cerrar()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              aria-label="Saltar tutorial"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">{step.icon}</div>

            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {step.titulo}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {step.cuerpo}
            </p>

            {step.imagen}
          </div>

          <div className="flex gap-3 mt-6">
            {!esPrimero && (
              <button
                onClick={() => cambiarPaso(paso - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:border-gray-400 transition"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
            )}

            {esUltimo ? (
              <button
                onClick={() => cerrar(step.accion?.ruta)}
                className="flex-1 bg-brand-pink text-white py-3 rounded-xl font-extrabold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {step.accion?.label || "Comenzar"}
                <Zap size={16} />
              </button>
            ) : (
              <button
                onClick={() => cambiarPaso(paso + 1)}
                className="flex-1 bg-gray-950 dark:bg-white text-white dark:text-gray-950 py-3 rounded-xl font-extrabold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-5">
            {ONBOARDING_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => cambiarPaso(i)}
                aria-current={i === paso}
                aria-label={`Ir al paso ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === paso
                    ? "bg-brand-pink w-5"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Botón flotante de ayuda contextual ──────────────────────────────────────
export function TutorialContextual({ pagina }) {
  const [abierto, setAbierto] = useState(false);

  const tips = PAGE_TUTORIALS[pagina] || [];

  if (!tips.length) return null;

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="fixed bottom-6 right-6 z-50 bg-brand-blue text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Abrir ayuda"
        title="Ayuda rápida"
      >
        <HelpCircle size={22} />
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-gray-950/50 z-[70] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg dark:text-white">
                Guía rápida
              </h3>

              <button
                onClick={() => setAbierto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-blue-50 dark:bg-blue-950 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-200"
                >
                  <span className="mt-0.5 text-blue-400">💡</span>
                  <p>{tip.texto}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAbierto(false)}
              className="mt-5 w-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 py-3 rounded-xl font-bold text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}