import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Timer as TimerIcon, Hand } from "lucide-react";
import { playDrumPattern, playRhythm, playTone } from "../../../../application/services/sound";
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

export default function EntrenamientoAuditivoRitmico({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const subtipo    = contenido.subtipo || "identificar-figura";

  if (subtipo === "reloj-interno") {
    return <PruebaRelojInterno exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }
  if (subtipo === "secuencia-rítmica") {
    return <SecuenciaRitmica exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
  }
  if (subtipo === "duracion-auditiva" || subtipo === "duracion-comparar") {
    return <PracticaDuracionAuditiva exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
  }

  return <PracticaPatron exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} resultado={resultado} />;
}

function PracticaPatron({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const subtipo = contenido.subtipo || "identificar-figura";
  const patron = contenido.patron || [];
  const bpm = contenido.bpm || 80;
  const opciones  = useMemo(
    () => shuffleOptions(contenido.opciones || []),
    [contenido.opciones]
  );
  const [reproducido, setReproducido] = useState(false);

  const reproducir = () => {
    playRhythm(patron, bpm);
    setReproducido(true);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={reproducir}
        className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
      >
        <Play size={18} fill="currentColor" />
        {subtipo === "tiempo-fuerte" ? "Escuchar compás" : "Escuchar patrón"}
      </button>

      {!reproducido && (
        <p className="text-xs text-gray-400">Escucha al menos una vez antes de responder.</p>
      )}

      <OpcionesAuditivas
        opciones={opciones}
        onEvaluate={onEvaluate}
        disabled={disabled}
        resultado={resultado}
        gridClassName="grid sm:grid-cols-2 gap-3"
      />
    </div>
  );
}

function SecuenciaRitmica({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const ejemplos = contenido.ejemplos || [];
  const opciones = useMemo(
    () => shuffleOptions(contenido.opciones || []),
    [contenido.opciones]
  );
  const [reproducido, setReproducido] = useState(false);

  const reproducir = (ejemplo) => {
    const golpes = (ejemplo.golpes || []).map(({ beat, instrumento }) => ({
      beatOffset: beat,
      instrumento,
    }));
    playDrumPattern(golpes, ejemplo.bpm || contenido.bpm || 80);
    setReproducido(true);
  };

  return (
    <div className="space-y-4">
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <div className="flex flex-wrap gap-2">
        {ejemplos.map((ejemplo, index) => (
          <button
            key={ejemplo.id || index}
            type="button"
            onClick={() => reproducir(ejemplo)}
            className="inline-flex items-center gap-2 bg-brand-blue px-4 py-3 font-extrabold text-white"
            aria-label={`Escuchar ejemplo ${ejemplo.id || index + 1}`}
          >
            <Play size={16} fill="currentColor" />
            {ejemplos.length > 1 ? `Ejemplo ${ejemplo.id || index + 1}` : "Escuchar patrón"}
          </button>
        ))}
      </div>
      {!reproducido && <p className="text-xs text-gray-400">Escucha al menos un ejemplo antes de responder.</p>}
      <OpcionesAuditivas
        opciones={opciones}
        onEvaluate={onEvaluate}
        disabled={disabled || !reproducido}
        resultado={resultado}
        gridClassName="grid gap-3 sm:grid-cols-2"
        optionClassName="p-4 text-left font-bold"
      />
    </div>
  );
}

function PracticaDuracionAuditiva({ exercise, onEvaluate, disabled, resultado }) {
  const contenido = exercise.contenido || {};
  const comparar = contenido.subtipo === "duracion-comparar";
  const ejemplos = comparar
    ? contenido.ejemplos || []
    : [{ id: "objetivo", duracionPulsos: contenido.duracionPulsos || 1 }];
  const opciones = useMemo(
    () => shuffleOptions(contenido.opciones || []),
    [contenido.opciones]
  );
  const bpm = contenido.bpm || 80;
  const [reproducido, setReproducido] = useState(false);

  const reproducir = (ejemplo) => {
    playTone(261.63, (60 / bpm) * ejemplo.duracionPulsos, "square", 0.08);
    setReproducido(true);
  };

  return (
    <div className="space-y-4">
      {contenido.referencia && <p className="text-sm text-gray-600">{contenido.referencia}</p>}
      <div className="flex flex-wrap gap-2">
        {ejemplos.map((ejemplo, index) => (
          <button
            key={ejemplo.id || index}
            type="button"
            onClick={() => reproducir(ejemplo)}
            className="inline-flex items-center gap-2 bg-brand-blue px-4 py-3 font-extrabold text-white"
          >
            <Play size={16} fill="currentColor" />
            {comparar ? `Ejemplo ${ejemplo.id || index + 1}` : "Escuchar duración"}
          </button>
        ))}
      </div>
      {!reproducido && <p className="text-xs text-gray-400">Escucha el sonido antes de responder.</p>}
      <OpcionesAuditivas
        opciones={opciones}
        onEvaluate={onEvaluate}
        disabled={disabled || !reproducido}
        resultado={resultado}
        gridClassName="grid gap-3 sm:grid-cols-2"
        optionClassName="p-4 text-left font-bold"
      />
    </div>
  );
}

// ── Sub-componente: prueba de reloj interno / sincronización ────────────────
function PruebaRelojInterno({ exercise, onEvaluate, disabled }) {
  const contenido     = exercise.contenido || {};
  const bpm             = contenido.bpm || 80;
  const pulsosGuia       = contenido.pulsosGuia || 4;   // cuántos clicks suenan antes de detenerse

  const [fase, setFase]   = useState("inicio");  // inicio → reproduciendo → esperando-tap → resultado
  const [resultadoMs, setResultadoMs] = useState(null);
  const tiempoEsperadoRef = useRef(null);

  const beatMs = (60 / bpm) * 1000;

  const iniciar = () => {
    setFase("reproduciendo");
    const ctxStart = performance.now();

    for (let i = 0; i < pulsosGuia; i++) {
      setTimeout(() => playTone(i === 0 ? 1200 : 800, 0.05, "square", i === 0 ? 0.12 : 0.08), i * beatMs);
    }

    // El "pulso fantasma" que el usuario debe predecir es el siguiente (pulsosGuia + 1)
    tiempoEsperadoRef.current = ctxStart + pulsosGuia * beatMs;

  };

  const tap = () => {
    if (fase !== "reproduciendo" || disabled) return;
    const ahora = performance.now();
    const diferencia = Math.abs(ahora - tiempoEsperadoRef.current);
    setResultadoMs(Math.round(diferencia));
    setFase("resultado");

    onEvaluate({
      respuesta:  { diferenciaMs: Math.round(diferencia) },
    });
  };

  useEffect(() => () => { tiempoEsperadoRef.current = null; }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
        <p className="font-bold text-gray-950 flex items-center gap-2">
          <TimerIcon size={16} /> Prueba de reloj interno
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Escucharás {pulsosGuia} pulsos a {bpm} BPM. El botón queda disponible desde el inicio; presiónalo cuando debería sonar el siguiente pulso.
        </p>
      </div>

      {fase === "inicio" && (
        <button
          type="button"
          onClick={iniciar}
          className="inline-flex items-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
        >
          <Play size={18} fill="currentColor" />
          Iniciar prueba
        </button>
      )}

      {fase === "reproduciendo" && (
        <p className="text-sm font-bold text-gray-500 animate-pulse">Escuchando el pulso guía…</p>
      )}

      {fase === "reproduciendo" && (
        <button
          type="button"
          onClick={tap}
          disabled={disabled}
          className="w-full bg-brand-pink text-white py-8 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 animate-pulse"
        >
          <Hand size={28} />
          Marcar siguiente pulso
        </button>
      )}

      {fase === "resultado" && resultadoMs !== null && (
        <div className="rounded-xl bg-gray-100 p-4 font-bold text-gray-700">
          Desviación medida: {resultadoMs} ms
        </div>
      )}
    </div>
  );
}
