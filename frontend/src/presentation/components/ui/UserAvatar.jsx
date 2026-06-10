import { useAuth } from "../../../application/context/AuthContext";
import { usePreferences } from "../../../application/context/PreferencesContext";

export default function UserAvatar({ size = "md" }) {
  const { usuario } = useAuth();
  const { preferences } = usePreferences();

  const label =
    preferences.displayName ||
    usuario?.displayName ||
    usuario?.email ||
    "Usuario";

  const initial = label.trim().charAt(0).toUpperCase() || "U";

  const dimensions = size === "lg" ? "w-24 h-24 text-4xl" : "w-10 h-10 text-base";

  if (preferences.avatarUrl) {
    return (
      <img
        src={preferences.avatarUrl}
        alt={label}
        className={`${dimensions} rounded-full object-cover border-2 border-white shadow`}
      />
    );
  }

  return (
    <div className={`${dimensions} rounded-full bg-brand-pink text-white font-extrabold inline-flex items-center justify-center shadow`}>
      {initial}
    </div>
  );
}
