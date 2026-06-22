/**
 * useMetronomo.js
 * Ruta: frontend/src/application/hooks/useMetronomo.js
 *
 * Hook reutilizable del metrónomo. Usa AudioContext scheduling (Web Audio API)
 * en lugar de setInterval, lo que elimina el drift acumulativo que aparece con
 * setInterval en pestañas en segundo plano o bajo carga de CPU.
 *
 * PROBLEMA DEL CÓDIGO ANTERIOR:
 *   startMetronome() usaba setInterval((60/bpm)*1000). El problema es que
 *   setInterval no es de tiempo real: cada tick puede llegar tarde por el
 *   event loop de JS, y ese retraso se acumula → drift perceptible a los
 *   pocos segundos, sobre todo en BPM altos o bajo carga. Además,
 *   setMetronomeBpm() hacía stop()+start(), causando un "glitch" audible
 *   y una pausa en el pulso al cambiar el BPM con el slider.
 *
 * SOLUCIÓN — "lookahead scheduler" (técnica estándar del Web Audio API):
 *   Un setInterval corto (~25ms) actúa solo como "despertador", no como
 *   fuente de timing. El timing real lo controla AudioContext.currentTime
 *   (reloj de alta precisión en hilo separado). Cada tick del interval
 *   agenda con antelación los clicks que deben sonar en los próximos
 *   ~100ms, usando ctx.currentTime + offset exacto. Si el interval se
 *   retrasa 10ms, los clicks ya están agendados y suenan igual de
 *   perfectos. El drift es cero.
 *
 * CAMBIO DE BPM EN TIEMPO REAL (sin glitch):
 *   El nuevo BPM se aplica al calcular el SIGUIENTE intervalo entre beats,
 *   no reiniciando todo. El scheduler siempre calcula:
 *     nextBeatTime += 60 / bpmRef.current
 *   usando una ref (no state) para leer el BPM más reciente sin re-renders.
 *
 * USO:
 *   const { active, bpm, setBpm, toggle, beat } = useMetronomo();
 *
 *   - active  (boolean)  → si el metrónomo está corriendo
 *   - bpm     (number)   → BPM actual (40–200)
 *   - setBpm  (function) → cambia el BPM en tiempo real, sin parar
 *   - toggle  (function) → inicia o detiene
 *   - beat    (number)   → número de beat (incrementa en cada tick, para
 *                          que los consumidores puedan animar la UI)
 */

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY   = "teolearn_metronome_bpm";
const LOOKAHEAD_MS  = 25.0;   // intervalo del "despertador" (ms)
const SCHEDULE_AHEAD = 0.1;   // cuántos segundos hacia adelante agendar

function getStoredBpm() {
  const v = Number(localStorage.getItem(STORAGE_KEY));
  return !v || Number.isNaN(v) ? 80 : Math.min(200, Math.max(40, v));
}

function clampBpm(v) {
  return Math.min(200, Math.max(40, Number(v)));
}

function scheduleClick(ctx, time, accent) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type            = "square";
  osc.frequency.value = accent ? 1200 : 800;

  gain.gain.setValueAtTime(accent ? 0.12 : 0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}

export default function useMetronomo() {
  const [bpm, setBpmState]    = useState(getStoredBpm);
  const [active, setActive]   = useState(false);
  const [beat, setBeat]       = useState(0);

  // Refs: actualizables sin re-render, accesibles desde el scheduler
  const bpmRef         = useRef(bpm);
  const activeRef      = useRef(false);
  const ctxRef         = useRef(null);
  const nextBeatRef    = useRef(0);   // AudioContext time del próximo beat
  const beatCountRef   = useRef(0);   // contador de beat para acento
  const intervalRef    = useRef(null);

  // Sincroniza bpmRef con el estado React
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const scheduler = useCallback(() => {
    const ctx = getCtx();
    const secondsPerBeat = 60 / bpmRef.current;

    while (nextBeatRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      const isAccent = beatCountRef.current % 4 === 0;
      scheduleClick(ctx, nextBeatRef.current, isAccent);

      // Actualizar el beat state para la UI (con ref para evitar closure stale)
      const scheduledBeat = beatCountRef.current;
      const delay = (nextBeatRef.current - ctx.currentTime) * 1000;
      setTimeout(() => setBeat(scheduledBeat), Math.max(0, delay));

      nextBeatRef.current += secondsPerBeat;
      beatCountRef.current++;
    }
  }, [getCtx]);

  const start = useCallback(() => {
    if (activeRef.current) return;

    const ctx = getCtx();
    // Reanudar si el contexto fue suspendido por política del navegador
    if (ctx.state === "suspended") ctx.resume();

    activeRef.current   = true;
    beatCountRef.current = 0;
    nextBeatRef.current  = ctx.currentTime + 0.05; // pequeño offset de arranque

    setActive(true);
    scheduler(); // primera pasada inmediata
    intervalRef.current = setInterval(scheduler, LOOKAHEAD_MS);
  }, [getCtx, scheduler]);

  const stop = useCallback(() => {
    activeRef.current = false;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    beatCountRef.current = 0;
    setActive(false);
    setBeat(0);
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) stop(); else start();
  }, [start, stop]);

  /**
   * setBpm — cambia el BPM en tiempo real SIN interrumpir el pulso.
   * El cambio se aplica en el siguiente beat gracias a bpmRef.
   */
  const setBpm = useCallback((value) => {
    const next = clampBpm(value);
    bpmRef.current = next;
    setBpmState(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return { active, bpm, setBpm, toggle, beat };
}