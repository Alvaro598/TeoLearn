import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { startBackgroundMusic, stopBackgroundMusic } from "../services/sound";
import { defaultPreferences, PreferencesContext } from "./preferences-context";

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
  return (
    <PreferencesState key={activeUserKey} activeUserKey={activeUserKey}>
      {children}
    </PreferencesState>
  );
}

function PreferencesState({ children, activeUserKey }) {
  const [preferences, setPreferences] = useState(() => loadPreferences(activeUserKey));

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
  }, [activeUserKey, preferences]);

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
