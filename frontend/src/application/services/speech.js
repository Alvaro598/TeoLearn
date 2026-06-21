/**
 * speech.js — Servicio de texto a voz extendido
 * Ruta: frontend/src/application/services/speech.js (reemplaza al anterior)
 *
 * NUEVO: soporte para SELECCIONAR LA VOZ entre las disponibles en el
 * navegador del usuario (window.speechSynthesis.getVoices()), en vez de
 * usar siempre la voz por defecto del sistema.
 *
 * Las voces disponibles dependen del navegador/SO del usuario; por eso
 * exponemos getAvailableVoices() para poblar un <select> dinámicamente,
 * y guardamos la preferencia (voiceURI) para reutilizarla.
 */

const VOICE_STORAGE_KEY = "teolearn_tts_voice_uri";

/**
 * Devuelve la lista de voces disponibles en el navegador, priorizando
 * español. Si las voces aún no cargaron (común en Chrome la primera vez),
 * dispara la carga y devuelve lo que haya hasta el momento.
 */
export function getAvailableVoices() {
  if (!("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();

  // Orden: español primero, luego el resto, alfabético dentro de cada grupo
  return [...voices].sort((a, b) => {
    const aEs = a.lang?.startsWith("es") ? 0 : 1;
    const bEs = b.lang?.startsWith("es") ? 0 : 1;
    if (aEs !== bEs) return aEs - bEs;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Algunos navegadores cargan las voces de forma asíncrona. Este helper
 * se suscribe al evento `voiceschanged` y llama a callback cuando hay voces.
 * Devuelve una función para desuscribirse.
 */
export function onVoicesReady(callback) {
  if (!("speechSynthesis" in window)) return () => {};

  const existentes = window.speechSynthesis.getVoices();
  if (existentes.length > 0) {
    callback(getAvailableVoices());
  }

  const handler = () => callback(getAvailableVoices());
  window.speechSynthesis.addEventListener("voiceschanged", handler);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
}

export function getSavedVoiceURI() {
  return localStorage.getItem(VOICE_STORAGE_KEY) || "";
}

export function setSavedVoiceURI(voiceURI) {
  if (voiceURI) {
    localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
  } else {
    localStorage.removeItem(VOICE_STORAGE_KEY);
  }
}

function resolveVoice(explicitVoiceURI) {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  const targetURI = explicitVoiceURI ?? getSavedVoiceURI();
  if (targetURI) {
    const found = voices.find((v) => v.voiceURI === targetURI);
    if (found) return found;
  }

  // Fallback: primera voz en español disponible
  return voices.find((v) => v.lang?.startsWith("es")) || voices[0] || null;
}

/**
 * speakText(text, options)
 * options.voiceURI — si se pasa, usa esa voz puntualmente (sin guardar).
 *                     Si se omite, usa la voz guardada en preferencias.
 */
export function speakText(
  text,
  { lang = "es-ES", rate = 0.95, voiceURI, onStart, onEnd, onError } = {}
) {
  if (!("speechSynthesis" in window) || !text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    String(text).replace(/\s+/g, " ").trim()
  );

  const voice = resolveVoice(voiceURI);
  if (voice) {
    utterance.voice = voice;
    utterance.lang  = voice.lang;
  } else {
    utterance.lang = lang;
  }

  utterance.rate  = rate;
  utterance.pitch = 1;

  utterance.onstart = () => onStart?.();
  utterance.onend   = () => onEnd?.();
  utterance.onerror = () => onError?.();

  window.speechSynthesis.speak(utterance);
}

/**
 * Reproduce una frase corta de muestra con la voz indicada, para que el
 * usuario pueda "probar antes de elegir" en el selector de Perfil.
 */
export function previewVoice(voiceURI) {
  speakText("Hola, así sonará la retroalimentación de Teo.", { voiceURI });
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}