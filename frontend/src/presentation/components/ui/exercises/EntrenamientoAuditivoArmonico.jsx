/**
 * EntrenamientoAuditivoArmonico.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EntrenamientoAuditivoArmonico.jsx
 *
 * Ejercicio auditivo de ARMONÍA. Soporta tres sub-tipos vía contenido.subtipo:
 *
 *  1. "intervalo-parejas"     → escuchar dos notas (armónicas o melódicas) e
 *                               identificar el intervalo (2ª, 3ª, 5ª, etc.)
 *  2. "fundamental-cancion"   → escuchar un fragmento de acorde/canción
 *                               conocida y cantar/seleccionar la nota
 *                               fundamental del acorde.
 *  3. "progresion-comun"      → escuchar una progresión de acordes y
 *                               reconocerla entre opciones comunes
 *                               (I-IV-V-I, I-V-vi-IV, ii-V-I, etc.)
 *
 * Contrato de contenido:
 * {
 *   subtipo: "...",
 *   notas: ["C4","G4"],              // intervalo-parejas
 *   modo: "armonico" | "melodico",
 *   acorde: ["C4","E4","G4"],        // fundamental-cancion
 *   cancionReferencia: "Cumpleaños feliz",
 *   progresion: [["C4","E4","G4"], ["F4","A4","C5"], ["G4","B4","D5"], ["C4","E4","G4"]],
 *   opciones: [...]
 * }
 */

import { playChord, playInterval, playProgression, playNote } from "../../../../application/services/sound";

export default function EntrenamientoAuditivoArmonico({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const subtipo    = contenido.subtipo || "intervalo-parejas";

  switch (subtipo) {
    case "fundamental-cancion":
      return <FundamentalCancion exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
    case "progresion-comun":
      return <ProgresionComun exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
    case "intervalo-parejas":
    default:
      return <IntervaloParejas exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }
}

// ── 1. Intervalos por parejas ────────────────────────────────────────────────
function IntervaloParejas({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const [n1, n2]   = contenido.notas || ["C4", "G4"];
  const modo        = contenido.modo || "armonico";
  const opciones      = contenido.opciones || ["2ª", "3ª", "4ª", "5ª", "6ª", "8ª"];
  const respuesta       = exercise.respuesta_correcta?.respuesta;

  const reproducir = () => playInterval(n1, n2, modo, 0.9);

  const responder = (opcion) => {
    const correcta = opcion === respuesta;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        🎧 Escuchar intervalo ({modo === "armonico" ? "simultáneo" : "sucesivo"})
      </button>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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

// ── 2. Fundamental de acorde en canción conocida ─────────────────────────────
function FundamentalCancion({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const acorde     = contenido.acorde || ["C4", "E4", "G4"];
  const referencia  = contenido.cancionReferencia;
  const opciones      = contenido.opciones || acorde;
  const respuesta       = exercise.respuesta_correcta?.respuesta;

  const reproducir = () => playChord(acorde, 1.4);

  const responder = (opcion) => {
    const correcta = opcion === respuesta;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      {referencia && (
        <p className="text-xs text-gray-500 italic">Inspirado en: "{referencia}"</p>
      )}
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        🎧 Escuchar acorde
      </button>
      <p className="text-xs text-gray-500">Identifica (o canta) la nota fundamental del acorde.</p>
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

// ── 3. Reconocimiento de progresión común ────────────────────────────────────
function ProgresionComun({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const progresion = contenido.progresion || [];
  const opciones      = contenido.opciones || ["I-IV-V-I", "I-V-vi-IV", "ii-V-I"];
  const respuesta       = exercise.respuesta_correcta?.respuesta;

  const reproducir = () => playProgression(progresion, 0.9, 0.1);

  const responder = (opcion) => {
    const correcta = opcion === respuesta;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        🎧 Escuchar progresión
      </button>
      <p className="text-xs text-gray-500">¿Qué progresión armónica común reconoces?</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => responder(opcion)}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 p-4 rounded-xl text-center font-bold font-mono"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}