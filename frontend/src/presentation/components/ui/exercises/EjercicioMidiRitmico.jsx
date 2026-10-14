
import { useCallback, useEffect, useMemo, useState } from "react";
import { Play, Eraser, Circle, Repeat, Timer } from "lucide-react";
import { playDrumPattern, playTone } from "../../../../application/services/sound";
import useMetronomo from "../../../../application/hooks/useMetronomo";

export default function EjercicioMidiRitmico({ exercise, onEvaluate, disabled }) {
  const contenido      = exercise.contenido || {};
  const compas         = contenido.compas || 4;
  const instrumentos = useMemo(() => contenido.instrumentos || [
    { id: "kick",  nota: "C3", label: "Bombo (Kick)" },
    { id: "snare", nota: "D3", label: "Caja (Snare)" },
  ], [contenido.instrumentos]);
  const tiemposFuertes  = contenido.tiemposFuertes || [1];
  const objetivo        = exercise.respuesta_correcta?.patron || {};
  const { bpm, setBpm } = useMetronomo();
  const divisionPulso = contenido.divisionPulso || 1;
  const totalBeats = compas * divisionPulso;

  useEffect(() => {
    if (contenido.bpm) setBpm(contenido.bpm);
  }, [exercise.id, contenido.bpm, setBpm]);

  // estado: { kick: Set([1,3]), snare: Set([2,4]) }
  const [patron, setPatron] = useState(() =>
    Object.fromEntries(instrumentos.map((i) => [i.id, new Set()]))
  );
  const [duracionGolpe, setDuracionGolpe] = useState(contenido.divisionPulso || 1);
  const [loop, setLoop] = useState(false);
  const [metronomoSincronizado, setMetronomoSincronizado] = useState(Boolean(contenido.usarMetronomo));

  const golpes = useMemo(
    () => instrumentos.flatMap((instrumento) =>
      [...(patron[instrumento.id] || [])].map((paso) => ({
        instrumento: instrumento.id,
        paso,
        duracionBeats: duracionGolpe,
      }))
    ),
    [instrumentos, patron, duracionGolpe]
  );

  const toggle = (instrumentoId, paso) => {
    if (disabled) return;
    setPatron((prev) => {
      const next = { ...prev, [instrumentoId]: new Set(prev[instrumentoId]) };
      if (next[instrumentoId].has(paso)) {
        next[instrumentoId].delete(paso);
      } else {
        next[instrumentoId].add(paso);
      }
      return next;
    });
  };

  const reproducir = () => {
    playDrumPattern(golpes, bpm, divisionPulso, {
      metronome: metronomoSincronizado,
      totalBeats,
    });
  };

  useEffect(() => {
    if (!loop || disabled) return undefined;

    const duracionCompasMs = (totalBeats * 60000) / bpm;
    let timeoutId;
    const reproducirLoop = () => {
      playDrumPattern(golpes, bpm, divisionPulso, {
        metronome: metronomoSincronizado,
        totalBeats,
      });
      timeoutId = window.setTimeout(reproducirLoop, duracionCompasMs);
    };

    reproducirLoop();
    return () => window.clearTimeout(timeoutId);
  }, [loop, disabled, golpes, bpm, divisionPulso, metronomoSincronizado, totalBeats]);

  const limpiar = () => {
    if (disabled) return;
    setPatron(Object.fromEntries(instrumentos.map((i) => [i.id, new Set()])));
  };

  const enviar = () => {
    const patronPlano = Object.fromEntries(
      instrumentos.map((i) => [i.id, [...(patron[i.id] || [])].sort((a, b) => a - b)])
    );

    const correcta = instrumentos.every((inst) => {
      const esperado = (objetivo[inst.id] || []).slice().sort((a, b) => a - b);
      const recibido = patronPlano[inst.id];
      return JSON.stringify(esperado) === JSON.stringify(recibido);
    });

    onEvaluate({
      respuesta:  { patron: patronPlano, duracionGolpe },
      correcta,
      puntuacion: correcta ? exercise.puntos : 0,
    });
  };

  const algunaCelda = instrumentos.some((i) => (patron[i.id]?.size || 0) > 0);

  if (contenido.subtipo === "duracion") {
    return <EditorDuracionMidi
      key={exercise.id || exercise.orden}
      contenido={contenido}
      bpm={bpm}
      setBpm={setBpm}
      onEvaluate={onEvaluate}
      respuestaCorrecta={exercise.respuesta_correcta?.duracion}
      puntos={exercise.puntos}
      disabled={disabled}
    />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
        <p className="font-bold text-gray-950">{contenido.instrucciones}</p>
        <p className="text-xs text-gray-500 mt-2">
          Toca cada celda para colocar el golpe del instrumento en ese tiempo. Los tiempos fuertes están resaltados.
        </p>
      </div>

      <div className="bg-white border-2 border-gray-950 rounded-xl p-4 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-extrabold text-sm uppercase tracking-widest">Patrón rítmico</p>
          <label className="flex items-center gap-2 text-xs font-bold whitespace-nowrap">
            Tempo {bpm} BPM
            <input type="range" min="40" max="200" step="1" value={bpm} onChange={(event) => setBpm(event.target.value)} aria-label="Tempo del ejercicio MIDI" />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold whitespace-nowrap">
            Duración del golpe: {duracionGolpe} pulsos
            <input
              type="range"
              min="0.125"
              max="2"
              step="0.125"
              value={duracionGolpe}
              disabled={disabled}
              onChange={(event) => setDuracionGolpe(Number(event.target.value))}
              aria-label="Duración de las notas MIDI"
            />
          </label>
          <button
            type="button"
            aria-pressed={metronomoSincronizado}
            onClick={() => setMetronomoSincronizado((activo) => !activo)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${metronomoSincronizado ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
          >
            <Timer size={15} />
            Metrónomo
          </button>
          <button
            type="button"
            aria-pressed={loop}
            onClick={() => setLoop((activo) => !activo)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${loop ? "bg-pink-100 text-pink-800" : "bg-gray-100 text-gray-700"}`}
          >
            <Repeat size={15} />
            Loop
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reproducir}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold"
            >
              <Play size={15} fill="currentColor" />
              Reproducir
            </button>
            <button
              type="button"
              onClick={limpiar}
              disabled={disabled}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              <Eraser size={15} />
              Limpiar
            </button>
          </div>
        </div>

        <div
          className="grid gap-1 min-w-[480px]"
          style={{ gridTemplateColumns: `120px repeat(${compas}, minmax(36px, 1fr))` }}
        >
          {/* Encabezado de tiempos */}
          <div />
          {Array.from({ length: compas }, (_, i) => {
            const tiempo = i + 1;
            const fuerte = tiemposFuertes.includes(tiempo);
            return (
              <div
                key={tiempo}
                className={`text-center text-[11px] font-extrabold pb-1 ${fuerte ? "text-brand-pink" : "text-gray-400"}`}
              >
                {tiempo}{fuerte ? " ●" : ""}
              </div>
            );
          })}

          {/* Filas por instrumento */}
          {instrumentos.map((inst) => (
            <div key={inst.id} className="contents">
              <div className="text-xs font-bold text-gray-700 flex items-center">{inst.label}</div>
              {Array.from({ length: compas }, (_, i) => {
                const tiempo  = i + 1;
                const activo  = patron[inst.id]?.has(tiempo);
                const fuerte  = tiemposFuertes.includes(tiempo);
                return (
                  <button
                    key={`${inst.id}-${tiempo}`}
                    type="button"
                    onClick={() => toggle(inst.id, tiempo)}
                    className={`h-10 rounded-md border flex items-center justify-center transition ${
                      activo
                        ? "bg-brand-pink border-brand-pink"
                        : fuerte
                        ? "bg-pink-50 border-pink-200 hover:bg-pink-100"
                        : "bg-gray-50 border-gray-200 hover:bg-blue-50"
                    }`}
                    aria-label={`${inst.label} tiempo ${tiempo}`}
                  >
                    {activo && <Circle size={14} className="text-white fill-white" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={enviar}
        disabled={disabled || !algunaCelda}
        className="bg-brand-pink text-white px-5 py-3 rounded-xl font-extrabold disabled:bg-gray-400"
      >
        Enviar patrón
      </button>
    </div>
  );
}

function EditorDuracionMidi({ contenido, bpm, setBpm, onEvaluate, respuestaCorrecta, puntos, disabled }) {
  const [duracion, setDuracion] = useState(contenido.opciones?.[0] || "1 pulso");
  const [loop, setLoop] = useState(false);
  const [metronomoSincronizado, setMetronomoSincronizado] = useState(false);
  const opciones = contenido.opciones || ["1 pulso", "2 pulsos", "4 pulsos"];
  const beats = Number.parseInt(duracion, 10) || 1;
  const indiceDuracion = Math.max(0, opciones.indexOf(duracion));
  const duracionSegundos = (60 / bpm) * beats;
  const reproducir = useCallback(() => playTone(261.63, duracionSegundos, "sine", 0.08, {
    metronome: metronomoSincronizado,
    bpm,
  }), [duracionSegundos, metronomoSincronizado, bpm]);
  const enviar = () => {
    const correcta = duracion === respuestaCorrecta;
    onEvaluate({ respuesta: { duracion }, correcta, puntuacion: correcta ? puntos : 0 });
  };

  useEffect(() => {
    if (!loop || disabled) return undefined;

    let timeoutId;
    const reproducirLoop = () => {
      reproducir();
      timeoutId = window.setTimeout(reproducirLoop, duracionSegundos * 1000);
    };
    reproducirLoop();
    return () => window.clearTimeout(timeoutId);
  }, [loop, disabled, reproducir, duracionSegundos]);

  return <div className="space-y-4">
    <div className="rounded-xl border-2 border-gray-950 bg-white p-4">
      <p className="font-bold">{contenido.instrucciones}</p>
      <p className="mt-2 text-sm text-gray-600">{contenido.referencia}</p>
    </div>
    <label className="flex items-center gap-3 text-sm font-bold">Tempo {bpm} BPM
      <input type="range" min="40" max="200" value={bpm} onChange={(event) => setBpm(event.target.value)} aria-label="Tempo del ejercicio MIDI" />
    </label>
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest">Nota MIDI · {duracion}</p>
      <div className="relative grid h-16 grid-cols-4 border border-gray-300 bg-gray-50" aria-label={`Nota de ${beats} pulsos en una línea de cuatro pulsos`}>
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="border-r border-gray-300 px-2 pt-1 text-[10px] font-bold text-gray-500">{index + 1}</div>)}
        <div className="absolute bottom-2 left-1 top-6 flex items-center overflow-hidden rounded-sm bg-brand-blue px-2 text-xs font-bold text-white transition-[width]" style={{ width: `${(Math.min(beats, 4) / 4) * 100}%` }}>
          Do4
        </div>
      </div>
      <label className="mt-4 block text-sm font-bold">
        Duración de la nota: {duracion}
        <input
          type="range"
          min="0"
          max={opciones.length - 1}
          step="1"
          value={indiceDuracion}
          disabled={disabled}
          onChange={(event) => setDuracion(opciones[Number(event.target.value)])}
          aria-label="Duración de la nota MIDI"
          className="mt-2 block w-full"
        />
      </label>
      <div className="flex justify-between text-xs text-gray-500">
        {opciones.map((opcion) => <span key={opcion}>{opcion}</span>)}
      </div>
    </div>
    <div className="flex gap-2">
      <button type="button" onClick={reproducir} className="rounded-xl bg-blue-100 px-4 py-3 font-bold text-blue-800">Escuchar duración</button>
      <button
        type="button"
        aria-pressed={metronomoSincronizado}
        onClick={() => setMetronomoSincronizado((activo) => !activo)}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold ${metronomoSincronizado ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
      >
        <Timer size={15} /> Metrónomo
      </button>
      <button
        type="button"
        aria-pressed={loop}
        onClick={() => setLoop((activo) => !activo)}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold ${loop ? "bg-pink-100 text-pink-800" : "bg-gray-100 text-gray-700"}`}
      >
        <Repeat size={15} /> Loop
      </button>
      <button type="button" disabled={disabled} onClick={enviar} className="rounded-xl bg-brand-pink px-4 py-3 font-bold text-white disabled:opacity-50">Comprobar</button>
    </div>
  </div>;
}
