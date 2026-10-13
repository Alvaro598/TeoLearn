import { useContext } from "react";
import { defaultContextValue, PreferencesContext } from "./preferences-context";

export function usePreferences() {
  return useContext(PreferencesContext) || defaultContextValue;
}