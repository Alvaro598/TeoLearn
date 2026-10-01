
import EjercicioQuiz                    from "./EjercicioQuiz";
import EntrenamientoAuditivoRitmico      from "./EntrenamientoAuditivoRitmico";
import EntrenamientoAuditivoMelodico     from "./EntrenamientoAuditivoMelodico";
import EntrenamientoAuditivoArmonico     from "./EntrenamientoAuditivoArmonico";
import EjercicioMidiRitmico              from "./EjercicioMidiRitmico";
import EjercicioMidiMelodico             from "./EjercicioMidiMelodico";
import EjercicioMidiArmonico             from "./EjercicioMidiArmonico";

const AUDITIVO_POR_CATEGORIA = {
  ritmo:   EntrenamientoAuditivoRitmico,
  melodia: EntrenamientoAuditivoMelodico,
  armonia: EntrenamientoAuditivoArmonico,
};

const MIDI_POR_CATEGORIA = {
  ritmo:   EjercicioMidiRitmico,
  melodia: EjercicioMidiMelodico,
  armonia: EjercicioMidiArmonico,
};

/**
 * @param {object}   exercise    — objeto ejercicio de la BD
 * @param {Function} onEvaluate  — callback(payload)
 * @param {boolean}  disabled
 * @param {string}   moduloSlug  — "ritmo" | "melodia" | "armonia" (opcional si
 *                                 exercise.contenido.categoria ya lo trae)
 */
export default function EjercicioRenderer({ exercise, onEvaluate, disabled, moduloSlug }) {
  if (exercise.tipo === "quiz") {
    return <EjercicioQuiz exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }

  const categoria = exercise.contenido?.categoria || moduloSlug || "melodia";

  if (exercise.tipo === "auditivo") {
    const Componente = AUDITIVO_POR_CATEGORIA[categoria] || EntrenamientoAuditivoMelodico;
    return <Componente exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }

  if (exercise.tipo === "midi") {
    const Componente = MIDI_POR_CATEGORIA[categoria] || EjercicioMidiMelodico;
    return <Componente exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }

  return (
    <p className="text-sm text-red-500 font-bold">
      Tipo de ejercicio no reconocido: {exercise.tipo}
    </p>
  );
}