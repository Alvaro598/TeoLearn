/**
 * MEJORA 2 — Archivo A
 * Ruta: frontend/src/application/services/useEjercicioTimer.js
 *
 * Hook que gestiona el cronómetro regresivo por tipo de ejercicio.
 *
 * TIEMPOS:
 *   quiz     → 20 s (ajustable; rango recomendado 15-30 s)
 *   auditivo → 25 s (ajustable; rango recomendado 15-30 s)
 *   midi     → 50 s (ajustable; rango recomendado 40-60 s)
 */

import { useState, useEffect, useCallback, useRef } from "react";

/** Configuración centralizada de tiempos por tipo de ejercicio */
export const TIMER_CONFIG = {
  quiz:     { segundos: 20, alerta: 8  },   // aviso cuando quedan ≤ 8 s
  auditivo: { segundos: 25, alerta: 10 },   // aviso cuando quedan ≤ 10 s
  midi:     { segundos: 50, alerta: 15 },   // aviso cuando quedan ≤ 15 s
};

/**
 * useEjercicioTimer
 *
 * @param {string}   tipo      — "quiz" | "auditivo" | "midi"
 * @param {boolean}  activo    — true mientras el ejercicio está en curso (no hay resultado, no avanzando)
 * @param {Function} onAgotado — callback disparado UNA SOLA VEZ cuando el tiempo llega a 0
 *
 * @returns {{
 *   segundosRestantes: number,
 *   porcentaje: number,       // 0-100, decrece con el tiempo
 *   enAlerta: boolean,        // true cuando quedan ≤ config.alerta segundos
 *   reiniciar: Function       // resetea el timer al valor inicial del tipo actual
 * }}
 */
export function useEjercicioTimer(tipo, activo, onAgotado) {
  const config  = TIMER_CONFIG[tipo] || TIMER_CONFIG.quiz;
  const total   = config.segundos;

  const [restante, setRestante] = useState(total);
  const agotadoRef  = useRef(false);   // evita disparar onAgotado más de una vez
  const intervalRef = useRef(null);

  /** Reinicia el estado a los segundos del tipo actual */
  const reiniciar = useCallback(() => {
    clearInterval(intervalRef.current);
    agotadoRef.current = false;
    setRestante(total);
  }, [total]);

  // Reiniciar automáticamente cuando cambia el tipo
  useEffect(() => {
    reiniciar();
  }, [tipo, reiniciar]);

  // Arrancar o pausar el intervalo según `activo`
  useEffect(() => {
    if (!activo) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!agotadoRef.current) {
            agotadoRef.current = true;
            // Llamar fuera del setState para no causar efectos secundarios en render
            setTimeout(() => onAgotado?.(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);

    return () => clearInterval(intervalRef.current);
  }, [activo, onAgotado]);

  const porcentaje = Math.round((restante / total) * 100);
  const enAlerta   = restante <= config.alerta && restante > 0;

  return { segundosRestantes: restante, porcentaje, enAlerta, reiniciar };
}