import { useMemo } from "react";
import { Play, Pin } from "lucide-react";
import { playNote, playSequence, playInterval } from "../../../../application/services/sound";
import OpcionesAuditivas from "./OpcionesAuditivas";

function shuffleOptions(options = []) {
  if (!Array.isArray(options) || options.length < 2) return options;

  const next = [...options];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

export default function EntrenamientoAuditivoMelodico({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const subtipo    = contenido.subtipo || "nota-individual";

  switch (subtipo) {
    case "comparar-alturas":
      return <CompararAlturas exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "comparar-escalas":
      return <CompararEscalas exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "intervalo":
      return <Intervalo exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "direccion-melodica":
      return <DireccionMelodica exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "grado-tonal":
      return <GradoTonal exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "pedal-tonica":
      return <PedalTonica exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "resolucion-tension":
      return <ResolucionTension exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
    case "nota-individual":
    default:
      return <NotaIndividual exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
  }
}

function CompararAlturas({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const notas = contenido.notas || ["C4", "G4"];
  const opciones = useMemo(
    () => shuffleOptions(contenido.opciones || ["El primero", "El segundo"]),
    [contenido.opciones]
  );
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => playSequence(notas, 0.65)}
        className="inline-flex items-center gap-3 bg-brand-blue px-5 py-3 font-extrabold text-white"
      >
        <Play size={18} fill="currentColor" />
        Escuchar sonidos
      </button>
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid gap-3 sm:grid-cols-2" optionClassName="p-4 text-left font-bold" />
    </div>
  );
}

function CompararEscalas({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const ejemplos = contenido.ejemplos || [];
  const opciones = useMemo(
    () => shuffleOptions(contenido.opciones || []),
    [contenido.opciones]
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {ejemplos.map((ejemplo) => (
          <button
            key={ejemplo.id}
            type="button"
            onClick={() => playSequence(ejemplo.notas || [], 0.45)}
            className="inline-flex items-center gap-2 bg-brand-blue px-5 py-3 font-extrabold text-white"
          >
            <Play size={18} fill="currentColor" />
            Escuchar {ejemplo.id}
          </button>
        ))}
      </div>
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid gap-3 sm:grid-cols-2" optionClassName="p-4 text-left font-bold" />
    </div>
  );
}

function Intervalo({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const notas = contenido.notas || ["C4", "G4"];
  const opciones = useMemo(
    () => shuffleOptions(contenido.opciones || []),
    [contenido.opciones]
  );
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => playSequence(notas, 0.65)}
        className="inline-flex items-center gap-3 bg-brand-blue px-5 py-3 font-extrabold text-white"
      >
        <Play size={18} fill="currentColor" />
        Escuchar intervalo
      </button>
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-4" optionClassName="p-4 text-left font-bold" />
    </div>
  );
}

// ── 1. Nota individual ───────────────────────────────────────────────────────
function NotaIndividual({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const opciones  = useMemo(
    () => shuffleOptions(contenido.opciones || ["C4", "D4", "E4", "G4"]),
    [contenido.opciones]
  );
  const objetivo   = contenido.nota;

  return (
    <div className="space-y-4">
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <button
        type="button"
        onClick={() => playNote(objetivo)}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar nota
      </button>
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid sm:grid-cols-2 gap-3" />
    </div>
  );
}

// ── 2. Dirección melódica ────────────────────────────────────────────────────
function DireccionMelodica({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const notas      = contenido.notas || ["C4", "G4"];
  const opciones    = useMemo(
    () => shuffleOptions(contenido.opciones || ["Sube", "Baja", "Se mantiene igual"]),
    [contenido.opciones]
  );
  const reproducir = () => playSequence(notas, 0.5);

  return (
    <div className="space-y-4">
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        Escuchar fragmento
      </button>
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid sm:grid-cols-3 gap-3" optionClassName="p-4 rounded-xl text-center font-bold" />
    </div>
  );
}

// ── 3. Dictado de grado tonal ────────────────────────────────────────────────
function GradoTonal({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const tonica     = contenido.tonica || "C4";
  const notaObjetivo = contenido.nota;
  const opciones      = useMemo(
    () => shuffleOptions(contenido.opciones || ["1", "2", "3", "4", "5", "6", "7"]),
    [contenido.opciones]
  );

  const reproducirTonica = () => playNote(tonica, 0.9);
  const reproducirNota   = () => playNote(notaObjetivo, 0.7);

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
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid grid-cols-4 sm:grid-cols-7 gap-2" optionClassName="p-3 rounded-xl text-center font-extrabold" />
    </div>
  );
}

// ── 4. Pedal (canto de la fundamental / tónica) ──────────────────────────────
function PedalTonica({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const fragmento  = contenido.notas || ["C4", "E4", "G4", "E4", "D4"];
  const opciones    = useMemo(
    () => shuffleOptions(contenido.opciones || ["C4", "D4", "E4", "F4"]),
    [contenido.opciones]
  );

  const reproducir = () => playSequence(fragmento, 0.35);

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
      <OpcionesAuditivas opciones={opciones} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} gridClassName="grid sm:grid-cols-2 gap-3" />
    </div>
  );
}

// ── 5. Resolución de tensión (ej. sensible → tónica) ─────────────────────────
function ResolucionTension({ exercise, onEvaluate, disabled, resultado }) {
  const contenido   = exercise.contenido || {};
  const notaTension   = contenido.nota || "B4";
  const opciones        = useMemo(
    () => shuffleOptions(contenido.opciones || ["C5", "A4", "G4", "B4"]),
    [contenido.opciones]
  );

  const reproducirTension = () => playNote(notaTension, 0.8);
  const reproducirOpcion  = (opcion) => playInterval(notaTension, opcion, "melodico", 0.5);

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
      <OpcionesAuditivas
        opciones={opciones}
        onEvaluate={(payload) => {
          reproducirOpcion(payload.respuesta.respuesta);
          onEvaluate(payload);
        }}
        disabled={disabled}
        resultado={resultado}
        gridClassName="grid sm:grid-cols-2 gap-3"
      />
    </div>
  );
}
