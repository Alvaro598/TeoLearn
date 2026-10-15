/**
 * progress.js
 *
 * Servicio de progreso para TeoLearn.
 *
 * Fuente de verdad: PostgreSQL (vía backend REST).
 * localStorage se usa únicamente como caché local de respaldo
 * para las funciones síncronas que aún consumen otros módulos
 * (getCompletedExerciseIds, isExerciseCompleted).
 * La escritura persistente siempre va a la BD.
 */

import { apiUrl } from "../config/apiBase";
import { authFetch } from "./api";

const STORAGE_KEY_PREFIX = "teolearn-progress";
const LEGACY_STORAGE_KEY = "teolearn-progress";
const PROGRESO_BASE = apiUrl("/progreso");

export const REQUIRED_QUIZ_MODULES = ["ritmo", "melodia", "armonia"];
const FINAL_QUIZ_RESULT_PREFIX = "teolearn-final-quiz";

const EMPTY_PROGRESS = { lessons: {}, units: {}, modules: {} };

// ─── helpers de caché local ────────────────────────────────────────────────

function getProgressStorageKey() {
  const userId = localStorage.getItem("teolearn-user-id") || localStorage.getItem("teolearn-firebase-uid") || "guest";
  return `${STORAGE_KEY_PREFIX}:${String(userId)}`;
}

function getFinalQuizStorageKey() {
  const userId = localStorage.getItem("teolearn-user-id") || localStorage.getItem("teolearn-firebase-uid") || "guest";
  return `${FINAL_QUIZ_RESULT_PREFIX}:${String(userId)}`;
}

export function getQuizFinalResult() {
  try {
    const raw = localStorage.getItem(getFinalQuizStorageKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isQuizFinalCompleted() {
  return Boolean(getQuizFinalResult());
}

export function markQuizFinalCompleted(result) {
  localStorage.setItem(getFinalQuizStorageKey(), JSON.stringify(result));
}

export async function guardarResultadoQuizFinal(result) {
  markQuizFinalCompleted(result);
  const { actualizarEstadoUsuario } = await import("./userState");
  await actualizarEstadoUsuario({ resultado_quiz_final: result });
}

function parseProgress(raw) {
  const parsed = JSON.parse(raw);
  return {
    lessons: parsed.lessons || {},
    units: parsed.units || {},
    modules: parsed.modules || {},
  };
}

function readProgress() {
  try {
    const storageKey = getProgressStorageKey();
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        localStorage.setItem(storageKey, legacyRaw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return parseProgress(legacyRaw);
      }

      return EMPTY_PROGRESS;
    }

    return parseProgress(raw);
  } catch {
    return EMPTY_PROGRESS;
  }
}

function saveProgress(progress) {
  localStorage.setItem(getProgressStorageKey(), JSON.stringify(progress));
}

function getLessonProgress(progress, lessonId) {
  return (
    progress.lessons[String(lessonId)] || {
      exercises: [],
      completed: false,
      moduleSlug: "",
      result: {
        aciertos: 0,
        errores: 0,
        puntuacion: 0,
      },
    }
  );
}

function getUnitProgress(progress, unitId) {
  return (
    progress.units[String(unitId)] || { completed: false, moduleSlug: "" }
  );
}

// ─── consultas síncronas (caché local) ─────────────────────────────────────

export function getCompletedExerciseIds(lessonId) {
  return getLessonProgress(readProgress(), lessonId).exercises;
}

export function isExerciseCompleted(lessonId, exerciseId) {
  return getCompletedExerciseIds(lessonId).includes(String(exerciseId));
}

// ─── escritura en caché local (para reflejar estado inmediato en UI) ───────

export function markExerciseCompletedLocal(lessonId, exerciseId) {
  const progress = readProgress();
  const lessonKey = String(lessonId);
  const currentLesson = getLessonProgress(progress, lessonKey);
  const exercises = Array.from(
    new Set([...currentLesson.exercises, String(exerciseId)])
  );

  progress.lessons[lessonKey] = { ...currentLesson, exercises };
  saveProgress(progress);

  return progress.lessons[lessonKey];
}

// Alias mantenido para retrocompatibilidad con cualquier módulo que ya lo importe
export const markExerciseCompleted = markExerciseCompletedLocal;

export function markLessonCompletedLocal(lessonId, moduleSlug = "") {
  const progress = readProgress();
  const lessonKey = String(lessonId);
  const currentLesson = getLessonProgress(progress, lessonKey);

  progress.lessons[lessonKey] = {
    ...currentLesson,
    completed: true,
    moduleSlug: moduleSlug || currentLesson.moduleSlug || "",
  };

  saveProgress(progress);
  return progress.lessons[lessonKey];
}

// Alias mantenido para retrocompatibilidad
export const markLessonCompleted = markLessonCompletedLocal;

export function getLessonResultLocal(lessonId) {
  const lesson = getLessonProgress(readProgress(), lessonId);

  return lesson.result || {
    aciertos: 0,
    errores: 0,
    puntuacion: 0,
  };
}

export function registerLessonAttemptLocal(lessonId, correcta, puntuacion = 0) {
  const progress = readProgress();
  const lessonKey = String(lessonId);
  const currentLesson = getLessonProgress(progress, lessonKey);
  const currentResult = currentLesson.result || {
    aciertos: 0,
    errores: 0,
    puntuacion: 0,
  };

  const nextResult = {
    aciertos: currentResult.aciertos + (correcta ? 1 : 0),
    errores: currentResult.errores + (correcta ? 0 : 1),
    puntuacion: currentResult.puntuacion + (puntuacion ?? 0),
  };

  progress.lessons[lessonKey] = {
    ...currentLesson,
    result: nextResult,
  };

  saveProgress(progress);

  return nextResult;
}

export function getCompletedUnitIds() {
  return Object.entries(readProgress().units)
    .filter(([, unit]) => unit.completed)
    .map(([unitId]) => unitId);
}

export function markUnitCompleted(unitId, moduleSlug = "") {
  const progress = readProgress();
  const unitKey = String(unitId);
  const currentUnit = getUnitProgress(progress, unitKey);

  progress.units[unitKey] = {
    ...currentUnit,
    completed: true,
    moduleSlug: moduleSlug || currentUnit.moduleSlug || "",
  };

  saveProgress(progress);
  return progress.units[unitKey];
}

export function getCompletedLessonIds() {
  return Object.entries(readProgress().lessons)
    .filter(([, lesson]) => lesson.completed)
    .map(([lessonId]) => lessonId);
}

export function markModuleCompleted(moduleSlug) {
  const progress = readProgress();
  progress.modules[String(moduleSlug)] = true;
  saveProgress(progress);
  return progress.modules;
}

export function getCompletedModuleSlugs() {
  return Object.entries(readProgress().modules)
    .filter(([, completed]) => completed)
    .map(([moduleSlug]) => moduleSlug);
}

export function isQuizFinalUnlocked() {
  const completedModules = new Set(getCompletedModuleSlugs());
  return REQUIRED_QUIZ_MODULES.every((slug) => completedModules.has(slug));
}

// ─── helpers de fetch ──────────────────────────────────────────────────────

async function fetchJson(path) {
  const response = await fetch(apiUrl(path));
  if (!response.ok) throw new Error(`Request failed for ${path}`);
  return response.json();
}

// ─── operaciones contra la BD ──────────────────────────────────────────────

/**
 * Registra un intento de ejercicio en la BD.
 * No afecta progreso_usuario ni XP; solo guarda el intento.
 *
 * @param {object} params
 * @param {number} params.usuarioId       — id de la tabla usuarios (NO firebase uid)
 * @param {number} params.ejercicioId
 * @param {any}    params.respuestaUsuario
 * @param {boolean} params.correcta
 * @param {number}  params.puntuacion
 */
export async function evaluarRespuesta(ejercicioId, respuestaUsuario) {
  const response = await authFetch(apiUrl(`/ejercicios/${ejercicioId}/evaluar`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      respuesta_usuario: respuestaUsuario,
    }),
  });

  if (!response.ok) throw new Error("No se pudo evaluar la respuesta");
  return response.json();
}

export async function obtenerEjerciciosCompletados(usuarioId, leccionId) {
  const response = await authFetch(
    `${PROGRESO_BASE}/ejercicios/${usuarioId}/${leccionId}`
  );
  if (!response.ok) throw new Error("Error obteniendo ejercicios completados");
  const data = await response.json();
  return data.ejercicios_completados_ids || [];
}

/**
 * Marca una lección como completada en la BD.
 * Evita duplicados, suma XP al usuario y recalcula nivel.
 * Actualiza también la caché local.
 *
 * @param {number} usuarioId   — id de la tabla usuarios (NO firebase uid)
 * @param {number} leccionId
 * @param {number} puntuacion
 * @param {string} moduleSlug  — opcional, para caché local
 * @returns {object}           — { success, ya_completada, xp_ganada, usuario }
 */
export async function guardarLeccionCompletada(
  usuarioId,
  leccionId,
  puntuacion = 0,
  moduleSlug = ""
) {
  const response = await authFetch(`${PROGRESO_BASE}/completar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_id: usuarioId,
      leccion_id: leccionId,
      puntuacion,
    }),
  });

  if (!response.ok) throw new Error("Error guardando progreso");

  const data = await response.json();

  // Actualizar caché local para que funciones síncronas queden consistentes
  markLessonCompletedLocal(leccionId, moduleSlug);

  return data;
}

/**
 * Obtiene el progreso básico de un usuario desde la BD.
 *
 * @param {number} usuarioId
 */
export async function obtenerProgresoUsuario(usuarioId) {
  const response = await authFetch(`${PROGRESO_BASE}/${usuarioId}`);
  if (!response.ok) throw new Error("Error obteniendo progreso");
  return response.json();
}

/**
 * Obtiene el resumen completo del Dashboard desde la BD.
 *
 * @param {number} usuarioId
 * @returns {{ xp, nivel, xp_nivel, lecciones_completadas, total_lecciones, modulos }}
 */
export async function obtenerDashboard(usuarioId) {
  const response = await authFetch(`${PROGRESO_BASE}/dashboard/${usuarioId}`);
  if (!response.ok) throw new Error("Error obteniendo dashboard");
  return response.json();
}

// ─── Quiz Final (usa el dashboard del servidor para desbloquear el acceso) ───────────────────────────────────

export async function getQuizFinalProgress() {
  const userId = localStorage.getItem("teolearn-user-id");

  const modules = await fetchJson("/modulos");
  const dashboard = userId
    ? await obtenerDashboard(Number(userId)).catch(() => null)
    : null;

  const moduleProgressBySlug = new Map(
    (dashboard?.modulos || []).map((module) => [module.slug, module])
  );

  const moduleStates = modules.map((module) => {
    const progress = moduleProgressBySlug.get(module.slug);
    const totalLessons = Number(progress?.total_lecciones || 0);
    const completedLessons = Number(progress?.lecciones_completadas || 0);

    return {
      ...module,
      totalLessons,
      completedLessons,
      unlocked: totalLessons > 0 && completedLessons === totalLessons,
    };
  });

  const requiredModules = REQUIRED_QUIZ_MODULES.map(
    (moduleSlug) =>
      moduleStates.find((m) => m.slug === moduleSlug) || {
        slug: moduleSlug,
        titulo: moduleSlug,
        unlocked: false,
        totalLessons: 0,
        completedLessons: 0,
      }
  );

  return {
    unlocked: requiredModules.every((m) => m.unlocked),
    completed: isQuizFinalCompleted(),
    modules: moduleStates,
    requiredModules,
  };
}
