/**
 * EjercicioMidiMelodico.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EjercicioMidiMelodico.jsx
 *
 * Editor MIDI para ejercicios MELÓDICOS: pregunta-respuesta, motivo-variación,
 * arpegios, punto focal y técnicas de articulación (legato, staccato,
 * pizzicato, glissando, tenuto).
 *
 * Contrato del ejercicio esperado en la BD (contenido):
 * {
 *   tecnica: "pregunta-respuesta" | "motivo-variacion" | "arpegio" | "punto-focal" | "articulacion",
 *   articulacion: "legato" | "staccato" | "pizzicato" | "glissando" | "tenuto" | null,
 *   notasDisponibles: ["C4","D4","E4","F4","G4","A4","B4","C5"],
 *   columnas: 8,
 *   pista: [   // opcional: motivo o pregunta ya dada que el alumno debe completar/variar
 *     { note: "C4", step: 1 },
 *     { note: "E4", step: 2 },
 *   ],
 *   instrucciones: "Completa la 'respuesta' a esta 'pregunta' melódica."
 * }
 * respuesta_correcta: { notas: ["G4","E4","C4"] }  // o { notas: [...], stepwise: true } según el ejercicio
 */

import { useMemo, useState } from "react";
import { Play, Eraser, Info } from "lucide-react";
import { playSequence } from "../../../../application/services/sound";
import { TECNICA_LABEL } from "../../../../application/services/musicTheoryHelpers";
import Metronomo from "../Metronomo";

const NOTAS_DEFECTO = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"];

const TECNICA_TITULOS = {
  "pregunta-respuesta": "Pregunta y respuesta",
  "motivo-variacion":   "Motivo y variación",
  "arpegio":            "Arpegio",
  "punto-focal":        "Punto focal de la frase",
  "articulacion":       "Articulación",
};

export default function EjercicioMidiMelodico({ exercise, onEvaluate, disabled }) {
  const contenido    = exercise.contenido || {};
  const noteRows      = contenido.notasDisponibles?.slice().reverse() || NOTAS_DEFECTO;
  const columns        = contenido.columnas || 8;
  const tecnica         = contenido.tecnica || "motivo-variacion";
  const articulacion    = contenido.articulacion;
  const pistaDada       = contenido.pista || [];   // motivo/pregunta ya colocada (no editable)
  const targetNotes     = exercise.respuesta_correcta?.notas || [];

  const [selected, setSelected] = useState([]);

  const orderedSelection = useMemo(
    () => [...selected].sort((a, b) => a.step - b.step).map((i) => ({ note: i.note, step: i.step })),
    [selected]
  );

  const pasoOcupadoPorPista = (step) => pistaDada.some((p) => p.step === step);

  const toggleCell = (note, step) => {
    if (disabled || pasoOcupadoPorPista(step)) return;
    setSelected((current) => {
      const exists = current.some((i) => i.note === note && i.step === step);
      if (exists) return current.filter((i) => !(i.note === note && i.step === step));
      // Solo una nota por columna (melodía monofónica)
      const sinColumna = current.filter((i) => i.step !== step);
      return [...sinColumna, { note, step }];
    });
  };

  const isSelected = (note, step) => selected.some((i) => i.note === note && i.step === step);

  const reproducirTodo = () => {
    const completo = [...pistaDada, ...orderedSelection].sort((a, b) => a.step - b.step);
    playSequence(completo, articulacion === "staccato" ? 0.18 : 0.3);
  };

  const submit = () => {
    const received = orderedSelection.map((i) => i.note);
    const correct   = JSON.stringify(targetNotes) === JSON.stringify(received);

    onEvaluate({
      respuesta:  { notas: received },
      correcta:   correct,
      puntuacion: correct ? exercise.puntos : 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            {TECNICA_TITULOS[tecnica] || tecnica}
          </span>
          {articulacion && (
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              {articulacion}
            </span>
          )}
        </div>
        <p className="font-bold text-gray-950">{contenido.instrucciones}</p>

        {articulacion && TECNICA_LABEL[articulacion] && (
          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
            <Info size={13} className="mt-0.5 shrink-0" />
            {TECNICA_LABEL[articulacion]}
          </p>
        )}
      </div>

      <Metronomo />

      <div className="bg-white border-2 border-gray-950 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="font-extrabold text-sm uppercase tracking-widest">Editor melódico</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reproducirTodo}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold"
            >
              <Play size={15} fill="currentColor" />
              Reproducir
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              disabled={disabled}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              <Eraser size={15} />
              Limpiar
            </button>
          </div>
        </div>

        <div
          className="grid gap-1 min-w-[560px]"
          style={{ gridTemplateColumns: `56px repeat(${columns}, minmax(36px, 1fr))` }}
        >
          <div />
          {Array.from({ length: columns }, (_, index) => {
            const step = index + 1;
            const esPista = pasoOcupadoPorPista(step);
            return (
              <div
                key={step}
                className={`text-center text-[10px] font-bold ${esPista ? "text-indigo-500" : "text-brand-pink"}`}
              >
                {step}{esPista ? " 🎵" : ""}
              </div>
            );
          })}

          {noteRows.map((note) => (
            <div key={note} className="contents">
              <div className="text-xs font-bold text-gray-700 flex items-center">{note}</div>
              {Array.from({ length: columns }, (_, index) => {
                const step    = index + 1;
                const dePista = pistaDada.find((p) => p.step === step && p.note === note);
                const propia  = isSelected(note, step);
                return (
                  <button
                    key={`${note}-${step}`}
                    type="button"
                    onClick={() => toggleCell(note, step)}
                    disabled={pasoOcupadoPorPista(step) && !dePista}
                    className={`h-7 border rounded-sm transition ${
                      dePista
                        ? "bg-indigo-400 border-indigo-500 cursor-not-allowed"
                        : propia
                        ? "bg-brand-pink border-brand-pink"
                        : "bg-gray-50 border-gray-300 hover:bg-blue-50"
                    }`}
                    aria-label={`${note} paso ${step}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {pistaDada.length > 0 && (
          <p className="text-[11px] text-indigo-500 mt-3 flex items-center gap-1">
            🎵 Las celdas en índigo son la frase dada (pregunta / motivo). Completa el resto.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={disabled || selected.length === 0}
        className="bg-brand-pink text-white px-5 py-3 rounded-xl font-extrabold disabled:bg-gray-400"
      >
        Enviar respuesta
      </button>
    </div>
  );
}