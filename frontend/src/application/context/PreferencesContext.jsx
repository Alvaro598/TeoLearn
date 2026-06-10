import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { startBackgroundMusic, stopBackgroundMusic } from "../services/sound";

const defaultPreferences = {
  displayName: "",
  avatarUrl: "",
  theme: "clasico",
  ttsEnabled: true,
  soundEnabled: true,
  backgroundMusic: false,
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

function loadPreferences() {
  try {
    const storedPreferences = JSON.parse(localStorage.getItem("teolearn-preferences") || "{}");

    return {
      ...defaultPreferences,
      ...storedPreferences,
      theme: normalizeTheme(storedPreferences.theme),
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
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
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
