/**
 * EjercicioRenderer.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EjercicioRenderer.jsx
 *
 * Componente "despachador": decide qué componente de ejercicio renderizar
 * según `tipo` (quiz | auditivo | midi) y, dentro de auditivo/midi, según
 * el MÓDULO de la lección (ritmo | melodia | armonia) o, si está presente,
 * según `exercise.contenido.categoria`.
 *
 * Esto saca toda la lógica de "qué componente usar" fuera de Ejercicio.jsx,
 * que ahora solo necesita renderizar <EjercicioRenderer ... /> una vez.
 *
 * Cómo se determina la categoría:
 *   1. exercise.contenido.categoria  ("ritmo" | "melodia" | "armonia") si existe
 *   2. moduloSlug prop pasado explícitamente desde la página (recomendado)
 *   3. fallback: "melodia" (componentes genéricos más simples)
 */

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