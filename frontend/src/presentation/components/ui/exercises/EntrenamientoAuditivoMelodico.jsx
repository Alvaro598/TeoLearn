/**
 * EntrenamientoAuditivoMelodico.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EntrenamientoAuditivoMelodico.jsx
 *
 * Ejercicio auditivo de MELODÍA. Soporta cinco sub-tipos vía contenido.subtipo:
 *
 *  1. "nota-individual"   → identificar el nombre de una nota suelta.
 *  2. "direccion-melodica" → escuchar dos o más notas y decir si sube, baja
 *                            o se mantiene igual.
 *  3. "grado-tonal"        → dictado de grados: se da la tónica (pedal) y
 *                            luego una nota; el alumno identifica el grado
 *                            (1-7) respecto a la tónica.
 *  4. "pedal-tonica"       → se sostiene la tónica de fondo y el alumno
 *                            debe "cantar"/seleccionar la tónica entre
 *                            varias opciones después de un fragmento.
 *  5. "resolucion-tension" → se escucha una nota de tensión (ej. 7° grado/
 *                            sensible) y el alumno elige hacia qué nota
 *                            resuelve naturalmente (ej. tónica).
 *
 * Contrato de contenido:
 * {
 *   subtipo: "...",
 *   tonica: "C4",             // para grado-tonal / pedal-tonica / resolucion-tension
 *   notas: ["C4","E4","G4"],  // secuencia a reproducir (direccion-melodica)
 *   nota: "D4",                // nota objetivo (nota-individual / grado-tonal)
 *   opciones: [...]
 * }
 */

import { useState } from "react";
import { Play, Pin } from "lucide-react";
import { playNote, playSequence, playInterval } from "../../../../application/services/sound";

export default function EntrenamientoAuditivoMelodico({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const subtipo    = contenido.subtipo || "nota-individual";

  switch (subtipo) {
    case "direccion-melodica":
      return <DireccionMelodica exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
    case "grado-tonal":
      return <GradoTonal exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
    case "pedal-tonica":
      return <PedalTonica exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
    case "resolucion-tension":
      return <ResolucionTension exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
    case "nota-individual":
    default:
      return <NotaIndividual exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }
}

// ── 1. Nota individual ───────────────────────────────────────────────────────
function NotaIndividual({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const opciones  = contenido.opciones || ["C4", "D4", "E4", "G4"];
  const objetivo   = exercise.respuesta_correcta?.respuesta || contenido.nota;

  const responder = (opcion) => {
    const correcta = opcion === objetivo;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => playNote(objetivo)}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar nota
      </button>
      <div className="grid sm:grid-cols-2 gap-3">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => responder(opcion)}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-4 rounded-xl text-left font-bold"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 2. Dirección melódica ────────────────────────────────────────────────────
function DireccionMelodica({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const notas      = contenido.notas || ["C4", "G4"];
  const opciones    = contenido.opciones || ["Sube", "Baja", "Se mantiene igual"];
  const objetivo     = exercise.respuesta_correcta?.respuesta;

  const reproducir = () => playSequence(notas, 0.5);

  const responder = (opcion) => {
    const correcta = opcion === objetivo;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar fragmento
      </button>
      <div className="grid sm:grid-cols-3 gap-3">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => responder(opcion)}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-4 rounded-xl text-center font-bold"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 3. Dictado de grado tonal ────────────────────────────────────────────────
function GradoTonal({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const tonica     = contenido.tonica || "C4";
  const notaObjetivo = exercise.respuesta_correcta?.nota || contenido.nota;
  const opciones      = contenido.opciones || ["1", "2", "3", "4", "5", "6", "7"];
  const gradoCorrecto  = exercise.respuesta_correcta?.respuesta;

  const reproducirTonica = () => playNote(tonica, 0.9);
  const reproducirNota   = () => playNote(notaObjetivo, 0.7);

  const responder = (opcion) => {
    const correcta = opcion === gradoCorrecto;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reproducirTonica}
          className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-extrabold"
        >
          <Pin size={16} />
          Tónica (referencia)
        </button>
        <button
          type="button"
          onClick={reproducirNota}
          className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-3 rounded-xl font-extrabold"
        >
          <Play size={16} fill="currentColor" />
          Nota a identificar
        </button>
      </div>
      <p className="text-xs text-gray-500">¿Qué grado de la escala es la nota respecto a la tónica?</p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => responder(opcion)}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-3 rounded-xl text-center font-extrabold"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 4. Pedal (canto de la fundamental / tónica) ──────────────────────────────
function PedalTonica({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const fragmento  = contenido.notas || ["C4", "E4", "G4", "E4", "D4"];
  const opciones    = contenido.opciones || ["C4", "D4", "E4", "F4"];
  const tonicaCorrecta = exercise.respuesta_correcta?.respuesta;

  const reproducir = () => playSequence(fragmento, 0.35);

  const responder = (opcion) => {
    const correcta = opcion === tonicaCorrecta;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar fragmento
      </button>
      <p className="text-xs text-gray-500">¿Cuál es la tónica (nota fundamental / pedal) de este fragmento?</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => responder(opcion)}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-4 rounded-xl text-left font-bold"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 5. Resolución de tensión (ej. sensible → tónica) ─────────────────────────
function ResolucionTension({ exercise, onEvaluate, disabled }) {
  const contenido   = exercise.contenido || {};
  const notaTension   = contenido.nota || "B4";
  const opciones        = contenido.opciones || ["C5", "A4", "G4", "B4"];
  const resolucionCorrecta = exercise.respuesta_correcta?.respuesta;

  const reproducirTension = () => playNote(notaTension, 0.8);
  const reproducirOpcion  = (opcion) => playInterval(notaTension, opcion, "melodico", 0.5);

  const responder = (opcion) => {
    const correcta = opcion === resolucionCorrecta;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={reproducirTension}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar nota de tensión
      </button>
      <p className="text-xs text-gray-500">¿Hacia qué nota resuelve naturalmente esta tensión?</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => { reproducirOpcion(opcion); responder(opcion); }}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-4 rounded-xl text-left font-bold"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}