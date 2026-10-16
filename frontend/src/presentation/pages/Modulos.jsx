
import { useEffect, useState } from "react";
import { useAuth } from "../../application/context/useAuth";
import { apiUrl } from "../../application/config/apiBase";
import { obtenerDashboard } from "../../application/services/progress";
import ModuloCard from "../components/ui/ModuloCard";

export default function Modulos() {
  const { usuarioDB }  = useAuth();
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerModulos = async () => {
      try {
        const [response, dashboardData] = await Promise.all([
          fetch(apiUrl("/modulos")),
          usuarioDB?.id
            ? obtenerDashboard(usuarioDB.id).catch(() => null)
            : Promise.resolve(null),
        ]);

        const data = await response.json();
        const progresoPorSlug = new Map(
          (dashboardData?.modulos || []).map((m) => [m.slug, m])
        );

        // Construir lista de módulos ordenados con su porcentaje real
        const lista = data.map((modulo) => {
          const progreso    = progresoPorSlug.get(modulo.slug);
          const porcentaje  = progreso
            ? progreso.total_lecciones > 0
              ? Math.round((progreso.lecciones_completadas / progreso.total_lecciones) * 100)
              : 0
            : 0;
          return { ...modulo, porcentaje };
        });

        setModulos(lista);
      } catch (error) {
        console.error("Error obteniendo módulos:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerModulos();
  }, [usuarioDB?.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl text-center font-extrabold mb-6">Módulos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      <h1 className="text-3xl text-center py-5 font-extrabold mb-6">Módulos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {modulos.map((mod, index) => (
          <ModuloCard
            key={mod.slug}
            id={mod.slug}
            title={mod.titulo}
            description={mod.descripcion}
            image={mod.imagen}
            progress={mod.porcentaje}
            orden={index + 1}
            porcentajeAnterior={index === 0 ? 100 : modulos[index - 1]?.porcentaje ?? 0}
          />
        ))}
      </div>
    </div>
  );
}