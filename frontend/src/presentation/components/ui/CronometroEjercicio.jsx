/**
 * MEJORA 2 — Archivo B
 * Ruta: frontend/src/presentation/components/ui/exercises/CronometroEjercicio.jsx
 *
 * Barra visual de tiempo con arco SVG y número central.
 * Se coloca ENCIMA del área de respuestas en Ejercicio.jsx.
 */

import { Timer } from "lucide-react";

const RADIO  = 22;
const CIRCUM = 2 * Math.PI * RADIO;  // ≈ 138.2

const ETIQUETAS = {
  quiz:     "Selección múltiple",
  auditivo: "Ejercicio auditivo",
  midi:     "Editor MIDI",
};

/**
 * @param {number}  segundosRestantes
 * @param {number}  porcentaje        — 0-100, decrece con el tiempo
 * @param {boolean} enAlerta          — true cuando el tiempo está a punto de agotarse
 * @param {string}  tipo              — "quiz" | "auditivo" | "midi"
 */
export default function CronometroEjercicio({ segundosRestantes, porcentaje, enAlerta, tipo }) {
  const offset = CIRCUM * (1 - porcentaje / 100);

  // Color del arco según tiempo restante
  const colorArco = enAlerta
    ? "#ef4444"   // rojo
    : porcentaje > 50
    ? "#22c55e"   // verde
    : "#f59e0b";  // amarillo

  return (
    <div
      className={`flex items-center gap-4 rounded-xl px-4 py-3 mb-5 transition-colors duration-300 ${
        enAlerta
          ? "bg-red-50 border border-red-200"
          : "bg-gray-100 border border-gray-200"
      }`}
      style={{
        // Soporte modo oscuro sin depender de clases Tailwind dark:
        // el index.css ya mapea .bg-gray-100 en oscuro → se hereda automáticamente
      }}
      role="timer"
      aria-live="polite"
      aria-label={`Tiempo restante: ${segundosRestantes} segundos`}
    >
      {/* Arco SVG */}
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        {/* Track gris de fondo */}
        <circle
          cx="28" cy="28" r={RADIO}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        {/* Arco de progreso */}
        <circle
          cx="28" cy="28" r={RADIO}
          fill="none"
          stroke={colorArco}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUM}
          strokeDashoffset={offset}
          transform="rotate(-90 28 28)"
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
          }}
        />
        {/* Número central */}
        <text
          x="28" y="33"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill={colorArco}
        >
          {segundosRestantes}
        </text>
      </svg>

      {/* Texto informativo */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-extrabold text-sm truncate ${
            enAlerta ? "text-red-600 animate-pulse" : "text-gray-800"
          }`}
        >
          {enAlerta ? "¡Tiempo casi agotado!" : "Tiempo restante"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {ETIQUETAS[tipo] || tipo}
        </p>
      </div>

      {/* Icono de reloj */}
      <Timer
        size={20}
        className={`shrink-0 ${enAlerta ? "text-red-400 animate-spin" : "text-gray-300"}`}
        style={enAlerta ? { animationDuration: "2s" } : {}}
      />
    </div>
  );
}