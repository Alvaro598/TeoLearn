

import { useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

function shuffleOptions(options = []) {
  if (!Array.isArray(options) || options.length < 2) return options;

  const next = [...options];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

export default function EjercicioQuiz({ exercise, onEvaluate, disabled, resultado }) {
  const [seleccionada, setSeleccionada] = useState(null);

  const opciones  = useMemo(
    () => shuffleOptions(exercise.contenido?.opciones ?? []),
    [exercise.contenido?.opciones]
  );
  const responder = (opcion) => {
    if (disabled || seleccionada) return;
    setSeleccionada(opcion);
    onEvaluate({ respuesta: { respuesta: opcion } });
  };

  return (
    <div className="space-y-3">
      {opciones.map((opcion) => (
        (() => {
          const esSeleccionada = seleccionada === opcion;
          const evaluado = Boolean(resultado);
          const estadoError = resultado?.errorEvaluacion;
          const claseResultado = evaluado && !estadoError
            ? resultado.correcta
              ? "exercise-option--correct"
              : "exercise-option--incorrect"
            : "";
          const claseEstado = !evaluado
            ? esSeleccionada
              ? "bg-blue-100 text-blue-900"
              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            : estadoError
              ? esSeleccionada
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-gray-100 text-gray-500"
              : esSeleccionada
                ? resultado.correcta
                  ? "bg-green-100 text-green-900 border border-green-300"
                  : "bg-red-100 text-red-900 border border-red-300"
                : "bg-gray-100 text-gray-500";

          return (
            <button
              key={opcion}
              type="button"
              onClick={() => responder(opcion)}
              disabled={disabled || !!seleccionada}
              className={`exercise-option w-full flex items-center justify-between gap-3 p-4 rounded-xl text-left font-bold transition ${claseEstado} ${claseResultado} disabled:cursor-not-allowed`}
            >
              <span>{opcion}</span>
              {evaluado && esSeleccionada && !estadoError && resultado.correcta && (
                <CheckCircle size={20} className="shrink-0 text-green-700" aria-label="Respuesta correcta" />
              )}
              {evaluado && esSeleccionada && !estadoError && !resultado.correcta && (
                <XCircle size={20} className="shrink-0 text-red-700" aria-label="Respuesta incorrecta" />
              )}
            </button>
          );
        })()
      ))}
    </div>
  );
}
