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

const STORAGE_KEY = "teolearn-progress";
const API_BASE = "http://localhost:3000/api";
const PROGRESO_BASE = `${API_BASE}/progreso`;

export const REQUIRED_QUIZ_MODULES = ["ritmo", "melodia", "armonia"];

// ─── helpers de caché local ────────────────────────────────────────────────

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {}, units: {}, modules: {} };
    const parsed = JSON.parse(raw);
    return {
      lessons: parsed.lessons || {},
      units: parsed.units || {},
      modules: parsed.modules || {},
    };
  } catch {
    return { lessons: {}, units: {}, modules: {} };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getLessonProgress(progress, lessonId) {
  return (
    progress.lessons[String(lessonId)] || {
      exercises: [],
      completed: false,
      moduleSlug: "",
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
  const response = await fetch(`${API_BASE}${path}`);
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
export async function guardarIntento({
  usuarioId,
  ejercicioId,
  respuestaUsuario,
  correcta,
  puntuacion,
}) {
  const response = await fetch(`${PROGRESO_BASE}/intento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_id: usuarioId,
      ejercicio_id: ejercicioId,
      respuesta_usuario: respuestaUsuario,
      correcta,
      puntuacion,
    }),
  });

  if (!response.ok) throw new Error("Error guardando intento");
  return response.json();
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
  const response = await fetch(`${PROGRESO_BASE}/completar`, {
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
  const response = await fetch(`${PROGRESO_BASE}/${usuarioId}`);
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
  const response = await fetch(`${PROGRESO_BASE}/dashboard/${usuarioId}`);
  if (!response.ok) throw new Error("Error obteniendo dashboard");
  return response.json();
}

// ─── Quiz Final (mantiene lógica previa) ───────────────────────────────────

export async function getQuizFinalProgress() {
  const [modules, completedLessonIds] = await Promise.all([
    fetchJson("/modulos"),
    Promise.resolve(new Set(getCompletedLessonIds())),
  ]);

  const moduleStates = await Promise.all(
    modules.map(async (module) => {
      const units = await fetchJson(`/unidades/modulo/${module.slug}`);

      const lessonGroups = await Promise.all(
        units.map(async (unit) => {
          const unitDetail = await fetchJson(`/unidades/${unit.id}/lecciones`);
          return unitDetail.lecciones || [];
        })
      );

      const lessons = lessonGroups.flat();
      const completedLessons = lessons.filter((lesson) =>
        completedLessonIds.has(String(lesson.id))
      ).length;

      return {
        ...module,
        totalLessons: lessons.length,
        completedLessons,
        unlocked: lessons.length > 0 && completedLessons === lessons.length,
      };
    })
  );

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
    modules: moduleStates,
    requiredModules,
  };
}
