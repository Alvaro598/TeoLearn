/**
 * Metronomo.jsx
 * Ruta: frontend/src/presentation/components/ui/Metronomo.jsx
 *
 * Componente visual del metrónomo, ahora respaldado por useMetronomo()
 * en lugar de las funciones sueltas startMetronome/stopMetronome de sound.js.
 *
 * Cambios respecto a la versión anterior:
 *  - Usa el hook useMetronomo(), que internamente usa AudioContext scheduling
 *    (cero drift), en vez de setInterval como fuente de timing.
 *  - El BPM cambia en tiempo real al mover el slider: ningún "glitch" ni
 *    pausa en el pulso, porque el nuevo BPM se aplica al siguiente beat
 *    sin reiniciar el scheduler.
 *  - El indicador visual de beat pulsa en sincronía con cada click usando
 *    el valor `beat` que expone el hook.
 *  - Props opcionales para controlar visibilidad o estilo desde el padre
 *    (ej. EjercicioMidiMelodico puede pasarle className).
 */

import useMetronomo from "../../../application/hooks/useMetronomo";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * @param {string}  className   — clases extras para el contenedor
 * @param {boolean} compacto    — si es true muestra versión reducida (sin label BPM grande)
 */
export default function Metronomo({ className = "", compacto = false }) {
  const { active, bpm, setBpm, toggle, beat } = useMetronomo();

  // Ref para el indicador visual: lo animamos directamente en el DOM
  // sin pasar por setState para no causar re-renders en cada beat.
  const dotRef = useRef(null);

  useEffect(() => {
    if (!dotRef.current || !active) return;
    dotRef.current.classList.remove("scale-125", "opacity-100");
    // Forzar reflow para reiniciar la animación en cada beat
    void dotRef.current.offsetWidth;
    dotRef.current.classList.add("scale-125", "opacity-100");
    const t = setTimeout(() => {
      dotRef.current?.classList.remove("scale-125", "opacity-100");
    }, 80);
    return () => clearTimeout(t);
  }, [beat, active]);

  return (
    <div
      className={`bg-white border-2 border-gray-200 rounded-xl p-4 ${className}`}
    >
      {!compacto && (
        <p className="font-extrabold text-sm uppercase tracking-widest mb-3 text-gray-700">
          Metrónomo
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {/* Indicador visual de beat */}
        <div
          ref={dotRef}
          className={`w-4 h-4 rounded-full shrink-0 transition-transform duration-75 opacity-40 ${
            active
              ? beat % 4 === 0
                ? "bg-brand-pink"   // tiempo fuerte
                : "bg-blue-400"     // tiempos débiles
              : "bg-gray-300"
          }`}
        />

        {/* BPM actual */}
        <span className="font-extrabold text-gray-900 w-16 text-sm tabular-nums">
          {bpm} BPM
        </span>

        {/* Slider */}
        <input
          type="range"
          min="40"
          max="200"
          step="1"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          className="flex-1 min-w-[80px] accent-brand-pink"
          aria-label="Velocidad del metrónomo en BPM"
        />

        {/* Botón iniciar / detener */}
        <button
          type="button"
          onClick={toggle}
          aria-label={active ? "Detener metrónomo" : "Iniciar metrónomo"}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-white text-sm transition ${
            active ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {active ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          {active ? "Detener" : "Iniciar"}
        </button>
      </div>

      {/* Tempo label */}
      {!compacto && (
        <p className="text-xs text-gray-400 mt-2">
          {bpm < 66  && "Largo — muy lento"}
          {bpm >= 66  && bpm < 76  && "Larghetto"}
          {bpm >= 76  && bpm < 108 && "Andante — moderado"}
          {bpm >= 108 && bpm < 120 && "Moderato"}
          {bpm >= 120 && bpm < 156 && "Allegro — rápido"}
          {bpm >= 156 && bpm < 176 && "Vivace"}
          {bpm >= 176 && "Presto — muy rápido"}
        </p>
      )}
    </div>
  );
}