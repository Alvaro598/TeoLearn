import { Play } from "lucide-react";
import { playNote } from "../../../../application/services/sound";

export default function EntrenamientoAuditivo({ exercise, onEvaluate, disabled }) {
  const options = exercise.contenido?.opciones || ["C4", "D4", "E4", "G4"];
  const target = exercise.respuesta_correcta?.respuesta || exercise.contenido?.nota;

  const answer = (option) => {
    const correct = option === target;

    onEvaluate({
      respuesta: { respuesta: option },
      correcta: correct,
      puntuacion: correct ? exercise.puntos : 0,
    });
  };

  return (
    <div className="space-y-4">
      <button
      id="escuchar-ejemplo"
        type="button"
        onClick={() => playNote(target)}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar ejemplo
      </button>

      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => answer(option)}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-4 rounded-xl text-left font-bold"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
