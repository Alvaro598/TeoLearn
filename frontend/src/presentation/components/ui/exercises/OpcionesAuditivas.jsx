import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

/** Renderiza las opciones de un ejercicio auditivo y deja visible la selección
 * mientras el servidor la evalúa. */
export default function OpcionesAuditivas({
  opciones = [],
  onEvaluate,
  disabled,
  resultado,
  gridClassName = "grid gap-3 sm:grid-cols-2",
  optionClassName = "p-4 rounded-xl text-left font-bold",
}) {
  const [seleccionada, setSeleccionada] = useState(null);

  const responder = (opcion) => {
    if (disabled || seleccionada !== null) return;
    setSeleccionada(opcion);
    onEvaluate({ respuesta: { respuesta: opcion } });
  };

  return (
    <div className={gridClassName}>
      {opciones.map((opcion, index) => {
        const esSeleccionada = seleccionada === opcion;
        const evaluado = Boolean(resultado) && !resultado.errorEvaluacion;
        const claseEstado = esSeleccionada
          ? resultado?.errorEvaluacion
            ? "audio-answer-option--error"
            : evaluado
              ? resultado.correcta
                ? "exercise-option--correct audio-answer-option--correct"
                : "exercise-option--incorrect audio-answer-option--incorrect"
              : "audio-answer-option--pending"
          : "";

        return (
          <button
            key={`${String(opcion)}-${index}`}
            type="button"
            disabled={disabled || seleccionada !== null}
            onClick={() => responder(opcion)}
            className={`audio-answer-option exercise-option bg-gray-100 hover:bg-gray-200 disabled:opacity-60 ${optionClassName} ${claseEstado}`}
            aria-pressed={esSeleccionada}
            aria-busy={esSeleccionada && !resultado}
          >
            <span>{opcion}</span>
            {evaluado && esSeleccionada && resultado.correcta && (
              <CheckCircle size={20} className="shrink-0 text-green-700" aria-label="Respuesta correcta" />
            )}
            {evaluado && esSeleccionada && !resultado.correcta && (
              <XCircle size={20} className="shrink-0 text-red-500" aria-label="Respuesta incorrecta" />
            )}
          </button>
        );
      })}
    </div>
  );
}
