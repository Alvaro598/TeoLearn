import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { BACKGROUND_TRACKS, startBackgroundMusic, stopBackgroundMusic } from "../services/sound";
import { actualizarEstadoUsuario, obtenerEstadoUsuario } from "../services/userState";
import { defaultPreferences, PreferencesContext } from "./preferences-context";

function normalizeTheme(theme) {
  if (theme === "oscuro" || theme === "clasico") {
    return theme;
  }
  return "clasico";
}

function normalizeTrack(track) {
  return BACKGROUND_TRACKS.some((item) => item.id === track) ? track : "chiptune";
}

function normalizePreferences(source = {}) {
  return {
    ...defaultPreferences,
    ...source,
    theme: normalizeTheme(source.theme),
    backgroundMusicTrack: normalizeTrack(source.backgroundMusicTrack),
  };
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

    return normalizePreferences(storedPreferences);
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

  const [preferenceState, setPreferenceState] = useState(() => ({
    userKey: activeUserKey,
    preferences: loadPreferences(activeUserKey),
  }));
  const [loadedRemoteUserKey, setLoadedRemoteUserKey] = useState(null);

  // Keep the router and its current page mounted when Firebase changes user.
  // Prefer the current user's preferences immediately, without synchronizing
  // state in an effect, to avoid cascading renders on user switches.
  const preferences =
    preferenceState.userKey === activeUserKey
      ? preferenceState.preferences
      : loadPreferences(activeUserKey);

  useEffect(() => {
    if (activeUserKey === "guest") return undefined;
    let cancelled = false;

    obtenerEstadoUsuario()
      .then((state) => {
        if (cancelled) return;
        const remotePreferences = state.preferencias || {};
        if (Object.keys(remotePreferences).length > 0) {
          setPreferenceState({
            userKey: activeUserKey,
            preferences: normalizePreferences(remotePreferences),
          });
        }
        setLoadedRemoteUserKey(activeUserKey);
      })
      .catch((error) => {
        console.error("No se pudieron cargar las preferencias del servidor:", error);
        if (!cancelled) setLoadedRemoteUserKey(activeUserKey);
      });

    return () => {
      cancelled = true;
    };
  }, [activeUserKey]);

  useEffect(() => {
    const storageKey = getPreferencesStorageKey(activeUserKey);
    localStorage.setItem(storageKey, JSON.stringify(preferences));

    document.documentElement.dataset.theme = preferences.theme;
  }, [activeUserKey, preferenceState, preferences]);

  useEffect(() => {
    if (preferences.backgroundMusic) {
      startBackgroundMusic(preferences.backgroundMusicTrack);
    } else {
      stopBackgroundMusic();
    }
  }, [preferences.backgroundMusic, preferences.backgroundMusicTrack]);

  useEffect(() => {
    if (activeUserKey === "guest" || loadedRemoteUserKey !== activeUserKey) return undefined;
    const timeoutId = window.setTimeout(() => {
      actualizarEstadoUsuario({ preferencias: preferences }).catch((error) => {
        console.error("No se pudieron guardar las preferencias:", error);
      });
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [activeUserKey, loadedRemoteUserKey, preferences]);

  const updatePreferences = useCallback((updates) => {
    const currentPreferences = preferenceState.userKey === activeUserKey
      ? preferenceState.preferences
      : preferences;
    const nextPreferences = { ...currentPreferences, ...updates };

    // Iniciar aquí conserva la activación del clic requerida por el navegador
    // para permitir audio; el efecto mantiene la reproducción al cargar preferencias.
    if (Object.hasOwn(updates, "backgroundMusic")) {
      if (nextPreferences.backgroundMusic) {
        startBackgroundMusic(nextPreferences.backgroundMusicTrack);
      } else {
        stopBackgroundMusic();
      }
    } else if (Object.hasOwn(updates, "backgroundMusicTrack") && nextPreferences.backgroundMusic) {
      startBackgroundMusic(nextPreferences.backgroundMusicTrack);
    }

    setPreferenceState({ userKey: activeUserKey, preferences: nextPreferences });
  }, [activeUserKey, preferenceState, preferences]);

  const value = useMemo(
    () => ({ preferences, updatePreferences }),
    [preferences, updatePreferences]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
