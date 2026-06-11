import { useEffect, useState } from "react";
import { useAuth } from "../../application/context/AuthContext";
import { apiUrl } from "../../application/config/apiBase";
import { obtenerDashboard } from "../../application/services/progress";
import ModuloCard from "../components/ui/ModuloCard";

export default function Modulos() {

  const { usuarioDB } = useAuth();

  const [modulos, setModulos] = useState([]);
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
          (dashboardData?.modulos || []).map((modulo) => [modulo.slug, modulo])
        );

        setModulos(
          data.map((modulo) => {
            const progreso = progresoPorSlug.get(modulo.slug);
            const porcentaje = progreso
              ? progreso.total_lecciones > 0
                ? Math.round(
                    (progreso.lecciones_completadas / progreso.total_lecciones) * 100
                  )
                : 0
              : 0;

            return { ...modulo, progress: porcentaje };
          })
        );

      } catch (error) {

        console.error("Error obteniendo módulos:", error);

      }

    };

    obtenerModulos();

  }, [usuarioDB?.id]);

  return (
    <>


      <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
        <h1 className="text-3xl text-center py-5 pb-5 sm:text-3xl font-extrabold mb-6 sm:mb-10">Módulos</h1>

        {/* GRID en lugar de flex */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {modulos.map((mod, index) => (
            <ModuloCard
              key={index}
              id={mod.slug}
              title={mod.titulo}
              description={mod.descripcion}
              image={mod.imagen}
              progress={mod.progress}
            />
          ))}
        </div>
      </div>
    </>
  );
}