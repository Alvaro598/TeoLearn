/**
 * EjercicioQuiz.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EjercicioQuiz.jsx
 *
 * Componente de selección múltiple extraído de Ejercicio.jsx.
 * Recibe el mismo contrato que EntrenamientoAuditivo y EjercicioMidi:
 *   - exercise   → objeto ejercicio de la BD
 *   - onEvaluate → callback(payload) con { respuesta, correcta, puntuacion }
 *   - disabled   → deshabilitar mientras avanza / hay resultado
 */

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function EjercicioQuiz({ exercise, onEvaluate, disabled }) {
  const [seleccionada, setSeleccionada] = useState(null);

  const opciones  = exercise.contenido?.opciones ?? [];
  const respuesta = exercise.respuesta_correcta?.respuesta;

  const responder = (opcion) => {
    if (disabled || seleccionada) return;
    setSeleccionada(opcion);

    const correcta = opcion === respuesta;
    onEvaluate({
      respuesta:  { respuesta: opcion },
      correcta,
      puntuacion: correcta ? exercise.puntos : 0,
    });
  };

  const colorBoton = (opcion) => {
    if (!seleccionada) return "bg-gray-100 hover:bg-gray-200 text-gray-900";
    if (opcion === respuesta) return "bg-green-100 border-2 border-green-500 text-green-800";
    if (opcion === seleccionada) return "bg-red-100 border-2 border-red-400 text-red-800";
    return "bg-gray-100 opacity-50 text-gray-500";
  };

  return (
    <div className="space-y-3">
      {opciones.map((opcion) => (
        <button
          key={opcion}
          type="button"
          onClick={() => responder(opcion)}
          disabled={disabled || !!seleccionada}
          className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl text-left font-bold transition ${colorBoton(opcion)} disabled:cursor-not-allowed`}
        >
          <span>{opcion}</span>

          {seleccionada && opcion === respuesta && (
            <CheckCircle size={18} className="text-green-600 shrink-0" />
          )}
          {seleccionada && opcion === seleccionada && opcion !== respuesta && (
            <XCircle size={18} className="text-red-500 shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}