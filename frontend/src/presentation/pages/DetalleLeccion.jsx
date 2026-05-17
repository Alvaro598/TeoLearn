import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

export default function DetalleLeccion() {

  const { leccionId } = useParams();

  const navigate = useNavigate();

  const [leccion, setLeccion] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    obtenerLeccion();

  }, []);

  const obtenerLeccion = async () => {

    try {

      const response = await fetch(
        `http://localhost:3000/api/lecciones/${leccionId}`
      );

      const data = await response.json();

      setLeccion(data);

    } catch (error) {

      console.error(
        "Error obteniendo lección:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando lección...
      </div>
    );
  }

  if (!leccion) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        No se encontró la lección.
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition"
        >
          ← Volver
        </button>

        <p className="text-xs font-bold tracking-widest uppercase mb-2 text-brand-pink">
          Lección
        </p>

        <h1
          className="text-5xl font-extrabold mb-3"
          style={{
            fontFamily: "Syne, sans-serif",
          }}
        >
          {leccion.titulo}
        </h1>

        <p className="text-gray-500 text-lg mb-8">
          {leccion.descripcion}
        </p>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-10">

          <h2
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: "Syne, sans-serif"
            }}
          >
            Teoría
          </h2>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {leccion.contenido}
          </p>

        </div>

        <button
          onClick={() =>
            navigate(`/ejercicio/${leccion.id}`)
          }
          className="
            w-full
            bg-brand-pink
            text-white
            font-semibold
            py-4
            rounded-2xl
            hover:opacity-90
            transition
            mb-5
          "
        >
          Ir al ejercicio →
        </button>

        <button
          onClick={() => navigate(-1)}
          className="
            w-full
            bg-brand-dark
            text-white
            font-semibold
            py-4
            rounded-2xl
            hover:opacity-90
            transition
          "
        >
          ✅ Lección completada
        </button>

      </div>

    </div>
  );
}