import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";
import { apiUrl } from "../../application/config/apiBase";
import { useAuth } from "../../application/context/AuthContext";
import {
  obtenerDashboard,
} from "../../application/services/progress";

const MOD_CONFIG = {

  generalidades: {
    color: 'bg-brand-blue',
    label: 'Generalidades',
    sub: 'Sonido, notas, pentagrama y uso de la plataforma',
    icon: '🎵'
  },

  ritmo: {
    color: 'bg-ritmo',
    label: 'Ritmo',
    sub: 'Pulso, compás y figuras',
    icon: '⚡'
  },

  melodia: {
    color: 'bg-melodia',
    label: 'Melodía',
    sub: 'Notas, escalas e intervalos',
    icon: '♪'
  },

  armonia: {
    color: 'bg-armonia',
    label: 'Armonía',
    sub: 'Acordes y progresiones',
    icon: '🎹'
  },

};

export default function Unidades() {

  const { moduloId } = useParams();

  const navigate = useNavigate();
  const { usuarioDB } = useAuth();

  const cfg =
    MOD_CONFIG[moduloId] || {
      color: 'bg-gray-400',
      label: moduloId,
      icon: '🎵',
      sub: ''
    };

  /*
    ESTADO
    Guarda las unidades
    que llegan del backend
  */

  const [unidades, setUnidades] =
    useState([]);

  const [savingUnitId, setSavingUnitId] =
    useState(null);

  /*
    Estado de carga
  */

  const [loading, setLoading] =
    useState(true);

  /*
    useEffect
    Se ejecuta automáticamente
    cuando abre la pantalla
  */

  useEffect(() => {

    obtenerUnidades();

  }, [moduloId, usuarioDB?.id]);

  /*
    Consulta al backend
  */

  const obtenerUnidades = async () => {

    try {

      const [respuesta, dashboardData] = await Promise.all([
        fetch(apiUrl(`/unidades/modulo/${moduloId}`)),
        usuarioDB?.id
          ? obtenerDashboard(usuarioDB.id).catch(() => null)
          : Promise.resolve(null),
      ]);

      const data = await respuesta.json();
      const completedLessons = new Set(
        dashboardData?.lecciones_completadas_ids || []
      );

      const unidadesConProgreso = await Promise.all(
        data.map(async (unidad) => {
          const detalleResponse = await fetch(
            apiUrl(`/unidades/${unidad.id}/lecciones`)
          );
          const detalle = await detalleResponse.json();
          const lecciones = detalle.lecciones || [];
          const leccionesCompletadas = lecciones.filter((leccion) =>
            completedLessons.has(String(leccion.id))
          ).length;
          const finalizada =
            lecciones.length > 0 && leccionesCompletadas === lecciones.length;

          return {
            ...unidad,
            totalLecciones: lecciones.length,
            leccionesCompletadas,
            finalizada,
          };
        })
      );

      setUnidades(unidadesConProgreso);

    } catch (error) {

      console.error(
        "Error obteniendo unidades:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  const finalizarUnidad = (unidad) => {
    if (unidad.finalizada) {
      return;
    }

    if (unidad.totalLecciones === 0 || unidad.leccionesCompletadas < unidad.totalLecciones) {
      return;
    }

    setSavingUnitId(unidad.id);

    setUnidades((current) =>
      current.map((item) =>
        item.id === unidad.id ? { ...item, finalizada: true } : item
      )
    );

    setSavingUnitId(null);
  };

  /*
    Pantalla mientras carga
  */

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p className="text-gray-500">
          Cargando unidades...
        </p>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

        {/* BOTÓN VOLVER */}

        <button
          onClick={() => navigate('/modulos')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition"
        >
          ← Volver
        </button>

        {/* HEADER */}

        <div className={`${cfg.color} rounded-3xl p-8 text-white mb-10`}>

          <p className="text-sm font-bold uppercase opacity-70 mb-1">
            Unidad
          </p>

          <h1
            className="text-4xl font-extrabold mb-1"
            style={{
              fontFamily: 'Syne,sans-serif'
            }}
          >
            {cfg.label}
          </h1>

          <p className="opacity-80">
            {cfg.sub}
          </p>

          {/* TAGS */}

          <div className="flex gap-2 mt-5 flex-wrap">

            <span className="bg-white text-brand-dark text-xs font-bold px-4 py-1.5 rounded-full">
              Todas
            </span>

            {unidades.map((u) => (

              <span
                key={u.id}
                className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-white/30 cursor-pointer transition"
              >
                {u.titulo}
              </span>

            ))}

          </div>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {unidades.map((unidad, idx) => {

            return (

              <div
                key={unidad.id}
                className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition p-6 flex flex-col"
              >

                {/* HEADER CARD */}

                <div className="flex items-start justify-between mb-4">

                  <div
                    className={`${cfg.color} w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {cfg.icon}
                  </div>

                </div>

                {/* TÍTULO */}

                <h2
                  className="font-bold text-lg mb-1"
                  style={{
                    fontFamily: 'Syne,sans-serif'
                  }}
                >
                  {unidad.titulo}
                </h2>

                {/* DESCRIPCIÓN */}

                <p className="text-gray-500 text-sm mb-4 flex-1">

                  {unidad.descripcion}

                </p>

                {/* META */}

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">

                  <span>
                    ⏱ {(idx + 1) * 8} min
                  </span>

                  <span>·</span>

                  <span>
                    {unidad.leccionesCompletadas}/{unidad.totalLecciones} lecciones completadas
                  </span>

                </div>

                {unidad.finalizada && (
                  <div className="inline-flex self-start mb-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    Unidad finalizada
                  </div>
                )}

                {/* BOTÓN */}

                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() =>
                      navigate(
                        `/unidad/${unidad.id}/lecciones`
                      )
                    }
                    disabled={unidad.finalizada}
                    className={`${cfg.color} text-white w-full py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {unidad.finalizada ? "Unidad completada" : "Empezar →"}
                  </button>

                  <button
                    type="button"
                    onClick={() => finalizarUnidad(unidad)}
                    disabled={unidad.finalizada || unidad.leccionesCompletadas < unidad.totalLecciones || savingUnitId === unidad.id}
                    className="w-full border-2 border-gray-950 text-gray-950 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    {unidad.finalizada
                      ? "Unidad finalizada"
                      : savingUnitId === unidad.id
                        ? "Guardando..."
                        : unidad.leccionesCompletadas < unidad.totalLecciones
                          ? "Completa las lecciones para finalizar"
                          : "Finalizar unidad"}
                  </button>
                </div>

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}
