import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeccionCard from "../components/ui/LeccionCard";

export default function Lecciones() {

  const { unidadId } = useParams();
  const navigate = useNavigate();

  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerLecciones();
  }, []);

  async function obtenerLecciones() {

    try {

      const response = await fetch(
        `http://localhost:3000/api/lecciones/unidad/${unidadId}`
      );

      const data = await response.json();

      setLecciones(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Cargando lecciones...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-6 py-10">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-500"
        >
          ← Volver
        </button>

        <h1 className="text-5xl font-extrabold mb-10">
          Lecciones
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {lecciones.map((leccion) => (

            <LeccionCard
              key={leccion.id}
              leccion={leccion}
              unidadId={unidadId}
            />

          ))}

        </div>

      </div>

    </div>
  );
}