import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../../application/config/apiBase";
import { useAuth } from "../../application/context/AuthContext";
import { obtenerDashboard } from "../../application/services/progress";
import LeccionCard from "../components/ui/LeccionCard";

export default function Lecciones() {

  const { unidadId } = useParams();
  const navigate = useNavigate();
  const { usuarioDB } = useAuth();

  const [unidad, setUnidad] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerLecciones();
  }, [unidadId, usuarioDB?.id]);

  async function obtenerLecciones() {

    try {
      const [response, dashboardData] = await Promise.all([
        fetch(apiUrl(`/unidades/${unidadId}/lecciones`)),
        usuarioDB?.id
          ? obtenerDashboard(usuarioDB.id).catch(() => null)
          : Promise.resolve(null),
      ]);

      const data = await response.json();
      setCompletedLessonIds(
        new Set(dashboardData?.lecciones_completadas_ids || [])
      );

      setUnidad(data);
      setLecciones(data.lecciones || []);

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
          onClick={() => navigate(unidad?.modulo_slug ? `/modulos/${unidad.modulo_slug}/unidades` : '/modulos')}
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
              completada={completedLessonIds.has(String(leccion.id))}
            />

          ))}

        </div>

      </div>

    </div>
  );
}