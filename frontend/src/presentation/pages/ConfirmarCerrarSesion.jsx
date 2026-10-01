import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../application/context/AuthContext";

export default function ConfirmarCerrarSesion() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-rose-50 px-6 py-12 flex items-center justify-center">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-pink/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-brand-blue/10 blur-3xl" />

      <div className="relative w-full max-w-lg animate-fade-in rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-500 shadow-inner">
          <LogOut size={32} strokeWidth={2.2} />
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-brand-pink">
          TeoLearn
        </p>

        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
          ¿Quieres cerrar sesión?
        </h1>

        <p className="mx-auto max-w-sm text-base leading-relaxed text-gray-600">
          Puedes volver cuando quieras. Tu progreso y tus preferencias seguirán guardados.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/30"
          >
            <LogOut size={18} />
            Cerrar sesión
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
