
import { useMemo } from "react";
import { playChord, playInterval, playProgression, playSequence } from "../../../../application/services/sound";

function shuffleOptions(options = []) {
  if (!Array.isArray(options) || options.length < 2) return options;

  const next = [...options];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

export default function EntrenamientoAuditivoArmonico({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const subtipo    = contenido.subtipo || "intervalo-parejas";

  switch (subtipo) {
    case "comparar-acordes":
    case "comparar-progresiones":
    case "textura-acorde":
    case "contar-notas":
      return <CompararArmonia exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
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
  const modo        = contenido.subtipo === "intervalo" ? "melodico" : contenido.modo || "armonico";
  const opciones      = useMemo(
    () => shuffleOptions(contenido.opciones || ["2ª", "3ª", "4ª", "5ª", "6ª", "8ª"]),
    [exercise.id, contenido.opciones]
  );
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

function CompararArmonia({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const ejemplos = contenido.ejemplos || [];
  const opciones = useMemo(
    () => shuffleOptions(contenido.opciones || []),
    [contenido.opciones]
  );
  const respuesta = exercise.respuesta_correcta?.respuesta;

  const reproducir = (ejemplo) => {
    if (contenido.subtipo === "comparar-progresiones") {
      playProgression(ejemplo.acordes || [], 0.9, 0.12);
    } else if (contenido.subtipo === "textura-acorde") {
      if (ejemplo.modo === "arpegio") playSequence(ejemplo.notas || [], 0.45);
      else playChord(ejemplo.notas || [], 1.2);
    } else if (ejemplo.notas) {
      playChord(ejemplo.notas, 1.2);
    }
  };

  const responder = (opcion) => {
    const correcta = opcion === respuesta;
    onEvaluate({ respuesta: { respuesta: opcion }, correcta, puntuacion: correcta ? exercise.puntos : 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {ejemplos.map((ejemplo) => (
          <button
            key={ejemplo.id}
            type="button"
            onClick={() => reproducir(ejemplo)}
            className="inline-flex items-center gap-3 bg-brand-blue px-5 py-3 font-extrabold text-white"
          >
            🎧 Escuchar {ejemplo.id}
            {ejemplo.modo ? ` (${ejemplo.modo})` : ""}
          </button>
        ))}
        {!ejemplos.length && contenido.notas && (
          <button
            type="button"
            onClick={() => playSequence(contenido.notas, 0.45)}
            className="inline-flex items-center gap-3 bg-brand-blue px-5 py-3 font-extrabold text-white"
          >
            🎧 Escuchar secuencia
          </button>
        )}
      </div>
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            disabled={disabled}
            onClick={() => responder(opcion)}
            className="bg-gray-100 p-4 text-left font-bold hover:bg-gray-200 disabled:opacity-60"
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
  const opciones      = useMemo(
    () => shuffleOptions(contenido.opciones || acorde),
    [exercise.id, contenido.opciones]
  );
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
  const opciones      = useMemo(
    () => shuffleOptions(contenido.opciones || ["I-IV-V-I", "I-V-vi-IV", "ii-V-I"]),
    [exercise.id, contenido.opciones]
  );
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