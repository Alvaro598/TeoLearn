/**
 * EjercicioMidiArmonico.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EjercicioMidiArmonico.jsx
 *
 * Editor MIDI para ejercicios ARMÓNICOS: el alumno construye un STACK de
 * acordes (varias notas verticales por columna) siguiendo una progresión
 * dada en grados romanos, ej. "I - IV - V - I" o "III - VII - V - I".
 *
 * Contrato del ejercicio esperado en la BD (contenido):
 * {
 *   tonalidad: "C4",                       // tónica de referencia
 *   progresion: ["I","IV","V","I"],        // grados a construir, una columna por grado
 *   notasDisponibles: ["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"],
 *   instrucciones: "Construye la progresión I-IV-V-I en C mayor."
 * }
 * respuesta_correcta: {
 *   stack: [["C4","E4","G4"], ["F4","A4","C5"], ["G4","B4","D5"], ["C4","E4","G4"]]
 * }
 * (el stack también puede derivarse en el backend con construirProgresionDesdeGrados)
 */

import { useMemo, useState } from "react";
import { Play, Eraser } from "lucide-react";
import { playProgression } from "../../../../application/services/sound";

const NOTAS_DEFECTO = [
  "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4",
];

export default function EjercicioMidiArmonico({ exercise, onEvaluate, disabled }) {
  const contenido    = exercise.contenido || {};
  const progresion    = contenido.progresion || ["I", "IV", "V", "I"];
  const noteRows       = contenido.notasDisponibles?.slice().reverse() || NOTAS_DEFECTO;
  const columnas        = progresion.length;
  const stackObjetivo   = exercise.respuesta_correcta?.stack || [];

  // selected[columnIndex] = Set de notas en ese acorde
  const [selected, setSelected] = useState(() =>
    Array.from({ length: columnas }, () => new Set())
  );

  const toggle = (columnIndex, note) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = prev.map((set) => new Set(set));
      if (next[columnIndex].has(note)) {
        next[columnIndex].delete(note);
      } else {
        next[columnIndex].add(note);
      }
      return next;
    });
  };

  const stackActual = useMemo(
    () => selected.map((set) => [...set]),
    [selected]
  );

  const reproducir = () => {
    playProgression(stackActual.map((acorde) => (acorde.length ? acorde : ["C4"])), 1.0, 0.12);
  };

  const limpiar = () => {
    if (disabled) return;
    setSelected(Array.from({ length: columnas }, () => new Set()));
  };

  const enviar = () => {
    const recibido = stackActual.map((acorde) => [...acorde].sort());
    const esperado  = stackObjetivo.map((acorde) => [...acorde].sort());
    const correcta  = JSON.stringify(recibido) === JSON.stringify(esperado);

    onEvaluate({
      respuesta:  { stack: stackActual },
      correcta,
      puntuacion: correcta ? exercise.puntos : 0,
    });
  };

  const algunaCelda = stackActual.some((a) => a.length > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
        <p className="font-bold text-gray-950">{contenido.instrucciones}</p>
        <p className="text-xs text-gray-500 mt-2">
          Cada columna es un grado de la progresión. Selecciona las notas que forman el acorde correspondiente.
        </p>
      </div>

      <div className="bg-white border-2 border-gray-950 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="font-extrabold text-sm uppercase tracking-widest">Stack de acordes</p>
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
          className="grid gap-1 min-w-[420px]"
          style={{ gridTemplateColumns: `56px repeat(${columnas}, minmax(72px, 1fr))` }}
        >
          {/* Encabezado: grados romanos */}
          <div />
          {progresion.map((grado, i) => (
            <div key={i} className="text-center text-sm font-extrabold text-brand-pink pb-1">
              {grado}
            </div>
          ))}

          {/* Filas por nota */}
          {noteRows.map((note) => (
            <div key={note} className="contents">
              <div className="text-xs font-bold text-gray-700 flex items-center">{note}</div>
              {progresion.map((_, columnIndex) => {
                const activo = selected[columnIndex]?.has(note);
                return (
                  <button
                    key={`${note}-${columnIndex}`}
                    type="button"
                    onClick={() => toggle(columnIndex, note)}
                    className={`h-8 border rounded-sm transition ${
                      activo
                        ? "bg-brand-pink border-brand-pink"
                        : "bg-gray-50 border-gray-300 hover:bg-blue-50"
                    }`}
                    aria-label={`${note} en grado ${progresion[columnIndex]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Resumen visual del stack por columna */}
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `56px repeat(${columnas}, minmax(72px, 1fr))` }}>
          <div />
          {stackActual.map((acorde, i) => (
            <div key={i} className="text-center text-[11px] text-gray-500 font-mono">
              {acorde.length ? acorde.join("+") : "—"}
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
        Enviar progresión
      </button>
    </div>
  );
}