import { createContext } from "react";

export const defaultPreferences = {
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

export const defaultContextValue = {
  preferences: defaultPreferences,
  updatePreferences: () => {},
};

export const PreferencesContext = createContext(defaultContextValue);