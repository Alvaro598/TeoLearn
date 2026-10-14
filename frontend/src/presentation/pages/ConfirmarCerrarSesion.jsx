import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../application/context/useAuth";

export default function ConfirmarCerrarSesion() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setError("");

    try {
      await logout();
      navigate("/", { replace: true });
    } catch {
      setError("No se pudo cerrar la sesión. Comprueba tu conexión e inténtalo de nuevo.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-6 py-12">
      <div aria-busy={isLoggingOut} className="w-full max-w-lg animate-fade-in rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <LogOut size={32} strokeWidth={2.2} />
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-pink">
          TeoLearn
        </p>

        <h1 className="mb-4 text-3xl font-extrabold text-gray-950 sm:text-4xl">
          ¿Quieres cerrar sesión?
        </h1>

        <p className="mx-auto max-w-sm text-base leading-relaxed text-gray-600">
          Puedes volver cuando quieras. Tu progreso y tus preferencias seguirán guardados.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={18} />
            {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>

        <div className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-gray-500">
          <ShieldCheck size={16} className="text-brand-blue" />
          Tu cuenta queda protegida
        </div>
      </div>
    </div>
  );
}
