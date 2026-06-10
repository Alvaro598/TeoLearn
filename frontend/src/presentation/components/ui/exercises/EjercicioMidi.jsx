import { Eraser, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { playSequence } from "../../../../application/services/sound";

const noteRows = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"];

export default function EjercicioMidi({ exercise, onEvaluate, disabled }) {
  const targetNotes = exercise.respuesta_correcta?.notas || exercise.contenido?.notas_objetivo || [];
  const columns = exercise.contenido?.columnas || 16;
  const [selected, setSelected] = useState([]);

  const orderedSelection = useMemo(
    () =>
      [...selected]
        .sort((a, b) => a.step - b.step)
        .map((item) => ({
          note: item.note,
          step: item.step,
        })),
    [selected]

  );

  const toggleCell = (note, step) => {
    if (disabled) return;

    setSelected((current) => {
      const exists = current.some((item) => item.note === note && item.step === step);
      if (exists) {
        return current.filter((item) => !(item.note === note && item.step === step));
      }

      return [...current, { note, step }];
    });
  };

  const isSelected = (note, step) =>
    selected.some((item) => item.note === note && item.step === step);

  const submit = () => {
    const expected = targetNotes;

    const received = orderedSelection.map((item) => item.note);

    
    const correct =
      JSON.stringify(expected) ===
      JSON.stringify(received);

    onEvaluate({
      respuesta: { notas: received },
      correcta: correct,
      puntuacion: correct ? exercise.puntos : 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
        <p className="font-bold text-gray-950">{exercise.contenido?.instrucciones}</p>
        <p className="text-xs text-gray-500 mt-2">
          Selecciona las notas objetivo en cualquier columna. Usa reproducir para escuchar tu respuesta.
        </p>
      </div>

      <div className="bg-white border-2 border-gray-950 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="font-extrabold text-sm uppercase tracking-widest">Editor MIDI</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => playSequence(orderedSelection)}
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
          className="grid gap-1 min-w-[720px]"
          style={{ gridTemplateColumns: `56px repeat(${columns}, minmax(28px, 1fr))` }}
        >
          <div />
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className="text-center text-[10px] font-bold text-brand-pink">
              {index + 1}
            </div>
          ))}

          {noteRows.map((note) => (
            <div key={note} className="contents">
              <div className="text-xs font-bold text-gray-700 flex items-center">{note}</div>
              {Array.from({ length: columns }, (_, index) => (
                <button
                  key={`${note}-${index}`}
                  type="button"
                  onClick={() => toggleCell(note, index + 1)}
                  className={`h-7 border border-gray-300 rounded-sm ${isSelected(note, index + 1)
                    ? "bg-brand-pink border-brand-pink"
                    : "bg-gray-50 hover:bg-blue-50"
                    }`}
                  aria-label={`${note} paso ${index + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
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
