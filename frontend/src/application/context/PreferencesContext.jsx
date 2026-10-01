/**
 * PreferencesContext.jsx
 * Ruta: frontend/src/application/context/PreferencesContext.jsx (reemplaza al anterior)
 *
 * CAMBIOS:
 *  - backgroundMusic (boolean) sigue existiendo, pero ahora se acompaña de
 *    backgroundMusicTrack ("ambient" | "focus" | "lofi" | "piano") para
 *    elegir CUÁL pista precargada sonar.
 *  - Nuevo campo ttsVoiceURI: guarda la voz de speechSynthesis elegida por
 *    el usuario (vacío = usar la mejor voz en español disponible).
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { startBackgroundMusic, stopBackgroundMusic } from "../services/sound";

const defaultPreferences = {
  displayName: "",
  avatarUrl: "",
  theme: "clasico",
  ttsEnabled: false,
  ttsVoiceURI: "",
  soundEnabled: true,
  backgroundMusic: false,
  backgroundMusicTrack: "ambient",
  onboardingDone: false,
};

const defaultContextValue = {
  preferences: defaultPreferences,
  updatePreferences: () => {},
};

const PreferencesContext = createContext(defaultContextValue);

function normalizeTheme(theme) {
  if (theme === "oscuro" || theme === "clasico") {
    return theme;
  }
  return "clasico";
}

function normalizeTrack(track) {
  if (["ambient", "focus", "lofi", "piano"].includes(track)) return track;
  return "ambient";
}

function getPreferencesStorageKey(userKey = null) {
  const resolvedUserKey =
    userKey ||
    localStorage.getItem("teolearn-firebase-uid") ||
    localStorage.getItem("teolearn-user-email") ||
    localStorage.getItem("teolearn-user-id") ||
    "guest";

  return `teolearn-preferences:${String(resolvedUserKey)}`;
}

function loadPreferences(userKey = null) {
  try {
    const storageKey = getPreferencesStorageKey(userKey);
    const legacyRaw = localStorage.getItem("teolearn-preferences");
    const raw = localStorage.getItem(storageKey) || legacyRaw || "{}";

    if (!localStorage.getItem(storageKey) && legacyRaw) {
      localStorage.setItem(storageKey, legacyRaw);
      localStorage.removeItem("teolearn-preferences");
    }

    const storedPreferences = JSON.parse(raw);

    return {
      ...defaultPreferences,
      ...storedPreferences,
      theme: normalizeTheme(storedPreferences.theme),
      backgroundMusicTrack: normalizeTrack(storedPreferences.backgroundMusicTrack),
    };
  } catch {
    return defaultPreferences;
  }
}

export function PreferencesProvider({ children }) {
  const { usuarioDB, firebaseUser } = useAuth();
  const activeUserKey = firebaseUser?.uid
    ? String(firebaseUser.uid)
    : usuarioDB?.correo
      ? String(usuarioDB.correo)
      : usuarioDB?.id
        ? String(usuarioDB.id)
        : "guest";
  const [preferences, setPreferences] = useState(() => loadPreferences(activeUserKey));

  useEffect(() => {
    setPreferences(loadPreferences(activeUserKey));
  }, [activeUserKey]);

  useEffect(() => {
    const storageKey = getPreferencesStorageKey(activeUserKey);
    localStorage.setItem(storageKey, JSON.stringify(preferences));

    document.documentElement.dataset.theme = preferences.theme;

    if (preferences.backgroundMusic) {
      startBackgroundMusic(preferences.backgroundMusicTrack);
    } else {
      stopBackgroundMusic();
    }
    // Se re-ejecuta también cuando cambia backgroundMusicTrack para que el
    // cambio de pista sea inmediato mientras la música está activada.
  }, [activeUserKey, preferences.theme, preferences.backgroundMusic, preferences.backgroundMusicTrack]);

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences: (updates) =>
        setPreferences((current) => ({ ...current, ...updates })),
    }),
    [preferences]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext) || defaultContextValue;
}