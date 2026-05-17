import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

const MOD_CONFIG = {

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

  }, []);

  /*
    Consulta al backend
  */

  const obtenerUnidades = async () => {

    try {

      const respuesta =
        await fetch(
          `http://localhost:3000/api/unidades/modulo/${moduloId}`
        );

      const data =
        await respuesta.json();

      setUnidades(data);

    } catch (error) {

      console.error(
        "Error obteniendo unidades:",
        error
      );

    } finally {

      setLoading(false);

    }

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
                    Próximamente
                  </span>

                </div>

                {/* BOTÓN */}

                <button
                  onClick={() =>
                    navigate(
                      `/unidad/${unidad.id}/lecciones`
                    )
                  }
                  className={`${cfg.color} text-white w-full py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition`}
                >
                  Empezar →
                </button>

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}