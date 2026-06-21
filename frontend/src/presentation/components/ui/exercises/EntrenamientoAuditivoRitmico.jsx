/**
 * EntrenamientoAuditivoRitmico.jsx
 * Ruta: frontend/src/presentation/components/ui/exercises/EntrenamientoAuditivoRitmico.jsx
 *
 * Ejercicio auditivo de RITMO. Soporta tres sub-tipos vía contenido.subtipo:
 *
 *  1. "identificar-figura"   → escucha un golpe y elige qué figura sonó
 *                              (redonda/blanca/negra/corchea).
 *  2. "tiempo-fuerte"        → escucha un compás con acentos y señala en
 *                              qué tiempo cayó el acento (tiempo fuerte).
 *  3. "reloj-interno"        → suena un click guía un compás, luego se
 *                              detiene; el alumno debe indicar tocando
 *                              "tap" en el momento en que debería sonar
 *                              el siguiente pulso (prueba de sincronización).
 *
 * Contrato de contenido:
 * {
 *   subtipo: "identificar-figura" | "tiempo-fuerte" | "reloj-interno",
 *   patron: [{ figura: "negra", nota: "C4" }, ...],   // para reproducir
 *   bpm: 80,
 *   opciones: ["Negra","Corchea","Blanca"]            // según subtipo
 * }
 * respuesta_correcta: { respuesta: "Negra" } | { respuesta: 3 } | { toleranciaMs: 150 }
 */

import { useEffect, useRef, useState } from "react";
import { Play, Timer as TimerIcon, Hand } from "lucide-react";
import { playRhythm, playTone } from "../../../../application/services/sound";

export default function EntrenamientoAuditivoRitmico({ exercise, onEvaluate, disabled }) {
  const contenido = exercise.contenido || {};
  const subtipo    = contenido.subtipo || "identificar-figura";
  const patron      = contenido.patron || [];
  const bpm          = contenido.bpm || 80;

  if (subtipo === "reloj-interno") {
    return <PruebaRelojInterno exercise={exercise} onEvaluate={onEvaluate} disabled={disabled} />;
  }

  // ── identificar-figura / tiempo-fuerte comparten la misma UI base ──────────
  const opciones  = contenido.opciones || [];
  const respuesta = exercise.respuesta_correcta?.respuesta;
  const [reproducido, setReproducido] = useState(false);

  const reproducir = () => {
    playRhythm(patron, bpm);
    setReproducido(true);
  };

  const responder = (opcion) => {
    const correcta = opcion === respuesta;
    onEvaluate({
      respuesta:  { respuesta: opcion },
      correcta,
      puntuacion: correcta ? exercise.puntos : 0,
    });
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

// ── Sub-componente: prueba de reloj interno / sincronización ────────────────
function PruebaRelojInterno({ exercise, onEvaluate, disabled }) {
  const contenido     = exercise.contenido || {};
  const bpm             = contenido.bpm || 80;
  const pulsosGuia       = contenido.pulsosGuia || 4;   // cuántos clicks suenan antes de detenerse
  const toleranciaMs     = exercise.respuesta_correcta?.toleranciaMs || 150;

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

    setTimeout(() => setFase("esperando-tap"), pulsosGuia * beatMs - 50);
  };

  const tap = () => {
    if (fase !== "esperando-tap" || disabled) return;
    const ahora = performance.now();
    const diferencia = Math.abs(ahora - tiempoEsperadoRef.current);
    setResultadoMs(Math.round(diferencia));
    setFase("resultado");

    const correcta = diferencia <= toleranciaMs;
    onEvaluate({
      respuesta:  { diferenciaMs: Math.round(diferencia) },
      correcta,
      puntuacion: correcta ? exercise.puntos : 0,
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
          Escucharás {pulsosGuia} pulsos a {bpm} BPM. Cuando se detengan, presiona el botón exactamente cuando creas que debería sonar el siguiente pulso.
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

      {fase === "esperando-tap" && (
        <button
          type="button"
          onClick={tap}
          className="w-full bg-brand-pink text-white py-8 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 animate-pulse"
        >
          <Hand size={28} />
          ¡TAP AHORA!
        </button>
      )}

      {fase === "resultado" && resultadoMs !== null && (
        <div className={`rounded-xl p-4 font-bold ${resultadoMs <= toleranciaMs ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          Desviación: {resultadoMs} ms {resultadoMs <= toleranciaMs ? "(dentro de la tolerancia)" : "(fuera de la tolerancia)"}
        </div>
      )}
    </div>
  );
}