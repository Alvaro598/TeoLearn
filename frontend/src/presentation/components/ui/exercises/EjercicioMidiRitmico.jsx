/**
 * EjercicioMidiRitmico.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EjercicioMidiRitmico.jsx
 *
 * Editor de patrones rítmicos: el usuario coloca golpes (kick/snare/hi-hat,
 * representados como notas fijas) en una grilla de pasos y selecciona la
 * FIGURA de cada paso. Pensado para ejercicios como:
 *   "Kick en tiempo 1 y 3, Snare en tiempo 2 y 4"
 *
 * Contrato del ejercicio esperado en la BD (contenido):
 * {
 *   compas: 4,                          // pasos totales (4, 8, 16...)
 *   figuraBase: "negra",                // duración de cada paso/columna
 *   instrumentos: [
 *     { id: "kick",  nota: "C3", label: "Bombo (Kick)" },
 *     { id: "snare", nota: "D3", label: "Caja (Snare)" },
 *     { id: "hihat", nota: "F#3", label: "Hi-Hat" }
 *   ],
 *   tiemposFuertes: [1, 3],              // para resaltar visualmente
 *   instrucciones: "Coloca el kick en 1 y 3, snare en 2 y 4."
 * }
 * respuesta_correcta: {
 *   patron: { kick: [1,3], snare: [2,4], hihat: [] }
 * }
 */

import { useState } from "react";
import { Play, Eraser, Circle } from "lucide-react";
import { playRhythm } from "../../../../application/services/sound";

export default function EjercicioMidiRitmico({ exercise, onEvaluate, disabled }) {
  const contenido      = exercise.contenido || {};
  const compas         = contenido.compas || 4;
  const figuraBase      = contenido.figuraBase || "negra";
  const instrumentos    = contenido.instrumentos || [
    { id: "kick",  nota: "C3", label: "Bombo (Kick)" },
    { id: "snare", nota: "D3", label: "Caja (Snare)" },
  ];
  const tiemposFuertes  = contenido.tiemposFuertes || [1];
  const objetivo        = exercise.respuesta_correcta?.patron || {};

  // estado: { kick: Set([1,3]), snare: Set([2,4]) }
  const [patron, setPatron] = useState(() =>
    Object.fromEntries(instrumentos.map((i) => [i.id, new Set()]))
  );

  const toggle = (instrumentoId, paso) => {
    if (disabled) return;
    setPatron((prev) => {
      const next = { ...prev, [instrumentoId]: new Set(prev[instrumentoId]) };
      if (next[instrumentoId].has(paso)) {
        next[instrumentoId].delete(paso);
      } else {
        next[instrumentoId].add(paso);
      }
      return next;
    });
  };

  const reproducir = () => {
    // Combinar todos los instrumentos en una sola pista de patrón rítmico,
    // priorizando un instrumento por paso para mantener legibilidad sonora.
    const pista = Array.from({ length: compas }, (_, i) => {
      const paso = i + 1;
      const sonando = instrumentos.find((inst) => patron[inst.id]?.has(paso));
      return { figura: figuraBase, nota: sonando ? sonando.nota : null };
    });
    playRhythm(pista, 80);
  };

  const limpiar = () => {
    if (disabled) return;
    setPatron(Object.fromEntries(instrumentos.map((i) => [i.id, new Set()])));
  };

  const enviar = () => {
    const patronPlano = Object.fromEntries(
      instrumentos.map((i) => [i.id, [...(patron[i.id] || [])].sort((a, b) => a - b)])
    );

    const correcta = instrumentos.every((inst) => {
      const esperado = (objetivo[inst.id] || []).slice().sort((a, b) => a - b);
      const recibido = patronPlano[inst.id];
      return JSON.stringify(esperado) === JSON.stringify(recibido);
    });

    onEvaluate({
      respuesta:  { patron: patronPlano },
      correcta,
      puntuacion: correcta ? exercise.puntos : 0,
    });
  };

  const algunaCelda = instrumentos.some((i) => (patron[i.id]?.size || 0) > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
        <p className="font-bold text-gray-950">{contenido.instrucciones}</p>
        <p className="text-xs text-gray-500 mt-2">
          Toca cada celda para colocar el golpe del instrumento en ese tiempo. Los tiempos fuertes están resaltados.
        </p>
      </div>

      <div className="bg-white border-2 border-gray-950 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="font-extrabold text-sm uppercase tracking-widest">Patrón rítmico</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reproducir}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold"
            >
              <Play size={15} fill="currentColor" />
              Reproducir
            </button>
            <button
              type="button"
              onClick={limpiar}
              disabled={disabled}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              <Eraser size={15} />
              Limpiar
            </button>
          </div>
        </div>

        <div
          className="grid gap-1 min-w-[480px]"
          style={{ gridTemplateColumns: `120px repeat(${compas}, minmax(36px, 1fr))` }}
        >
          {/* Encabezado de tiempos */}
          <div />
          {Array.from({ length: compas }, (_, i) => {
            const tiempo = i + 1;
            const fuerte = tiemposFuertes.includes(tiempo);
            return (
              <div
                key={tiempo}
                className={`text-center text-[11px] font-extrabold pb-1 ${fuerte ? "text-brand-pink" : "text-gray-400"}`}
              >
                {tiempo}{fuerte ? " ●" : ""}
              </div>
            );
          })}

          {/* Filas por instrumento */}
          {instrumentos.map((inst) => (
            <div key={inst.id} className="contents">
              <div className="text-xs font-bold text-gray-700 flex items-center">{inst.label}</div>
              {Array.from({ length: compas }, (_, i) => {
                const tiempo  = i + 1;
                const activo  = patron[inst.id]?.has(tiempo);
                const fuerte  = tiemposFuertes.includes(tiempo);
                return (
                  <button
                    key={`${inst.id}-${tiempo}`}
                    type="button"
                    onClick={() => toggle(inst.id, tiempo)}
                    className={`h-10 rounded-md border flex items-center justify-center transition ${
                      activo
                        ? "bg-brand-pink border-brand-pink"
                        : fuerte
                        ? "bg-pink-50 border-pink-200 hover:bg-pink-100"
                        : "bg-gray-50 border-gray-200 hover:bg-blue-50"
                    }`}
                    aria-label={`${inst.label} tiempo ${tiempo}`}
                  >
                    {activo && <Circle size={14} className="text-white fill-white" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={enviar}
        disabled={disabled || !algunaCelda}
        className="bg-brand-pink text-white px-5 py-3 rounded-xl font-extrabold disabled:bg-gray-400"
      >
        Enviar patrón
      </button>
    </div>
  );
}