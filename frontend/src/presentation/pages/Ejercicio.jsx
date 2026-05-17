import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

export default function Ejercicio() {

  const { leccionId } = useParams();

  const navigate = useNavigate();

  const [leccion, setLeccion] = useState(null);

  const [ejercicios, setEjercicios] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    obtenerDatos();

  }, []);

  const obtenerDatos = async () => {

    try {

      // =========================
      // LECCIÓN
      // =========================

      const leccionResponse = await fetch(
        `http://localhost:3000/api/lecciones/${leccionId}`
      );

      const leccionData = await leccionResponse.json();

      setLeccion(leccionData);

      // =========================
      // EJERCICIOS
      // =========================

      const ejerciciosResponse = await fetch(
        `http://localhost:3000/api/ejercicios/leccion/${leccionId}`
      );

      const ejerciciosData = await ejerciciosResponse.json();

      setEjercicios(ejerciciosData);

    } catch (error) {

      console.error(
        "Error obteniendo ejercicios:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  // ====================================
  // LOADING
  // ====================================

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Cargando ejercicios...
      </div>
    );
  }

  // ====================================
  // ERROR
  // ====================================

  if (!leccion) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        No existe la lección
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50 text-gray-900">

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* VOLVER */}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition"
        >
          ← Volver
        </button>

        {/* HEADER */}

        <div className="mb-10">

          <h1
            className="text-4xl font-extrabold mb-3"
            style={{
              fontFamily: "Syne, sans-serif",
            }}
          >
            {leccion.titulo}
          </h1>

          <p className="text-gray-500">
            Aquí encontrarás los ejercicios de la lección.
          </p>

        </div>

        {/* EJERCICIOS */}

        <div className="space-y-6">

          {ejercicios.map((exercise) => {

            // =========================
            // CONTENIDO JSONB
            // =========================

            const contenido =
              exercise.contenido || {};

            const opciones =
              contenido.opciones || [];

            return (

              <div
                key={exercise.id}
                className="bg-white rounded-3xl p-6 shadow-sm"
              >

                <div className="flex items-center justify-between mb-4">

                  <h2 className="text-2xl font-bold">
                    {exercise.pregunta}
                  </h2>

                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                    +{exercise.puntos} XP
                  </span>

                </div>

                {/* ===================================== */}
                {/* QUIZ */}
                {/* ===================================== */}

                {exercise.tipo === "quiz" && (

                  <div>

                    <div className="grid gap-3">

                      {opciones.map((option) => (

                        <button
                          key={option}
                          className="
                            bg-gray-100
                            hover:bg-gray-200
                            transition
                            p-4
                            rounded-2xl
                            text-left
                          "
                        >
                          {option}
                        </button>

                      ))}

                    </div>

                  </div>
                )}

                {/* ===================================== */}
                {/* EAR TRAINING */}
                {/* ===================================== */}

                {exercise.tipo === "ear-training" && (

                  <div>

                    <button
                      className="
                        bg-blue-500
                        hover:bg-blue-400
                        text-white
                        px-5
                        py-3
                        rounded-2xl
                        font-bold
                        mb-5
                      "
                    >
                      ▶ Reproducir Audio
                    </button>

                    <div className="grid gap-3">

                      {opciones.map((option) => (

                        <button
                          key={option}
                          className="
                            bg-gray-100
                            hover:bg-gray-200
                            transition
                            p-4
                            rounded-2xl
                            text-left
                          "
                        >
                          {option}
                        </button>

                      ))}

                    </div>

                  </div>
                )}

                {/* ===================================== */}
                {/* MIDI */}
                {/* ===================================== */}

                {exercise.tipo === "midi" && (

                  <div>

                    <p className="text-gray-700 mb-4">
                      Piano interactivo próximamente.
                    </p>

                    <div className="
                      bg-gray-100
                      rounded-2xl
                      h-40
                      flex
                      items-center
                      justify-center
                      text-gray-500
                    ">
                      Piano Roll MIDI
                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}