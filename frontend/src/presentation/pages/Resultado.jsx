import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Resultado() {
  const { leccionId } = useParams();
  const navigate = useNavigate();
  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerLeccion = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/lecciones/${leccionId}`);
        const data = await response.json();
        setLeccion(data);
      } catch (error) {
        console.error("Error obteniendo la leccion:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerLeccion();
  }, [leccionId]);

  if (loading) {
    return <div className="p-10 text-center">Cargando resultado...</div>;
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">
        🎉 Resultado
      </h1>

      <p className="mb-6">
        ¡Felicidades! Has completado la lección {leccionId}
      </p>

      <button
        onClick={() => navigate(`/unidad/${leccion?.unidad_id}/lecciones`, { replace: true })}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={!leccion?.unidad_id}
      >
        Volver a Lecciones
      </button>
    </div>
  );
}