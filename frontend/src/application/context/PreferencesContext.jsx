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
import { startBackgroundMusic, stopBackgroundMusic } from "../services/sound";

const defaultPreferences = {
  displayName: "",
  avatarUrl: "",
  theme: "clasico",
  ttsEnabled: true,
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

function loadPreferences() {
  try {
    const storedPreferences = JSON.parse(localStorage.getItem("teolearn-preferences") || "{}");

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
  const [preferences, setPreferences] = useState(loadPreferences);

  useEffect(() => {
    localStorage.setItem("teolearn-preferences", JSON.stringify(preferences));

    document.documentElement.dataset.theme = preferences.theme;

    if (preferences.backgroundMusic) {
      startBackgroundMusic(preferences.backgroundMusicTrack);
    } else {
      stopBackgroundMusic();
    }
    // Se re-ejecuta también cuando cambia backgroundMusicTrack para que el
    // cambio de pista sea inmediato mientras la música está activada.
  }, [preferences.theme, preferences.backgroundMusic, preferences.backgroundMusicTrack]);

  // Persistir el resto de cambios (nombre, avatar, tts...) sin reiniciar audio
  useEffect(() => {
    localStorage.setItem("teolearn-preferences", JSON.stringify(preferences));
  }, [preferences]);

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