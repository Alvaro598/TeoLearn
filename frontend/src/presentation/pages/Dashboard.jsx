import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../application/context/AuthContext";
import { usePreferences } from "../../application/context/PreferencesContext";
import { obtenerDashboard } from "../../application/services/progress";
import OnboardingTutorial from "../components/ui/OnboardingTutorial";

const MODULO_CONFIG = {
  ritmo: {
    path: "/modulos/ritmo/unidades",
    icon: "⚡",
    color: "bg-ritmo",
  },
  melodia: {
    path: "/modulos/melodia/unidades",
    icon: "♪",
    color: "bg-melodia",
  },
  armonia: {
    path: "/modulos/armonia/unidades",
    icon: "🎹",
    color: "bg-armonia",
  },
};



export default function Dashboard() {
  const { usuario, usuarioDB } = useAuth();
  const { preferences, updatePreferences } = usePreferences();

  const nombre =
    preferences.displayName ||
    usuarioDB?.nombre ||
    usuario?.displayName ||
    usuario?.email?.split("@")[0] ||
    "Estudiante";

  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {

      if (!usuarioDB?.id) {
        setLoadingDashboard(false);
        return;
      }

      try {
        const data = await obtenerDashboard(usuarioDB.id);
        setDashboardData(data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    cargarDashboard();
  }, [usuarioDB?.id]);


  const xpTotal = dashboardData?.xp ?? usuarioDB?.xp ?? 0;
  const nivel = dashboardData?.nivel ?? usuarioDB?.nivel ?? 1;
  const xpNivel = dashboardData?.xp_nivel ?? xpTotal % 200;
  const leccionesOk = dashboardData?.lecciones_completadas ?? 0;
  const leccionesTotal = dashboardData?.total_lecciones ?? 0;
  const modulosBD = dashboardData?.modulos ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingTutorial />

      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
        {/* Bienvenida */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">
            HOLA
          </p>
          <h1
            className="text-4xl font-extrabold"
            style={{ fontFamily: "Syne,sans-serif" }}
          >
            {nombre} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Sigue construyendo tu identidad musical paso a paso.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Nivel */}
          <div className="bg-white rounded-2xl p-5 shadow-card col-span-2 md:col-span-1">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-1">
              NIVEL
            </p>
            <p
              className="text-5xl font-extrabold"
              style={{ fontFamily: "Syne,sans-serif" }}
            >
              {nivel}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-brand-pink h-2 rounded-full transition-all"
                style={{ width: `${Math.min((xpNivel / 200) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {xpNivel} / 200 XP al siguiente nivel
            </p>
          </div>

          {/* XP */}
          <div className="bg-brand-yellow rounded-2xl p-5 shadow-card">
            <p className="text-xs font-bold uppercase mb-1 text-yellow-800 opacity-70">
              XP TOTAL
            </p>
            <p
              className="text-4xl font-extrabold text-brand-dark"
              style={{ fontFamily: "Syne,sans-serif" }}
            >
              {loadingDashboard ? "…" : xpTotal}
            </p>
          </div>


          <div className="bg-brand-pink rounded-2xl p-5 shadow-card">
            <p className="text-xs font-bold uppercase mb-1 text-white opacity-70">
              RACHA
            </p>
            <p
              className="text-4xl font-extrabold text-white"
              style={{ fontFamily: "Syne,sans-serif" }}
            >
              0
            </p>
          </div>

          {/* Lecciones */}
          <div className="bg-brand-blue rounded-2xl p-5 shadow-card">
            <p className="text-xs font-bold uppercase mb-1 text-white opacity-70">
              LECCIONES
            </p>
            <p
              className="text-4xl font-extrabold text-white"
              style={{ fontFamily: "Syne,sans-serif" }}
            >
              {loadingDashboard ? (
                "…"
              ) : (
                <>
                  {leccionesOk}
                  <span className="text-xl opacity-70">/{leccionesTotal}</span>
                </>
              )}
            </p>
          </div>
        </div>



        {/* Categorías con progreso real */}
        <p
          className="text-xl font-bold mb-4"
          style={{ fontFamily: "Syne,sans-serif" }}
        >
          Categorías
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {loadingDashboard
            ? // Skeleton mientras carga
            [1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-gray-200 rounded-3xl p-7 animate-pulse h-36"
              />
            ))
            : modulosBD.map((modulo) => {
              const config = MODULO_CONFIG[modulo.slug] || {
                path: `/modulos/${modulo.slug}/unidades`,
                icon: "🎵",
                color: "bg-gray-700",
              };

              return (
                <Link
                  id="modulos-dashboard"
                  key={modulo.id}
                  to={config.path}
                  className={`${config.color}  rounded-3xl p-7 text-white hover:opacity-95 transition block`}
                >
                  <div className="text-3xl mb-3">{config.icon}</div>
                  <h3
                    className="font-extrabold text-xl"
                    style={{ fontFamily: "Syne,sans-serif" }}
                  >
                    {modulo.titulo}
                  </h3>
                  <p className="text-sm opacity-70 mt-1">
                    {modulo.lecciones_completadas} / {modulo.total_lecciones}{" "}
                    completadas
                  </p>
                  {/* Barra de progreso del módulo */}
                  <div className="w-full bg-white/30 rounded-full h-1.5 mt-3">
                    <div
                      id="progress-bar"
                      className="bg-white h-1.5 rounded-full transition-all"
                      style={{ width: `${modulo.porcentaje}%` }}
                    />
                  </div>
                  <p className="text-xs opacity-60 mt-1">{modulo.porcentaje}%</p>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
