import { useEffect, useState } from "react";
import ModuloCard from "../components/ui/ModuloCard";

export default function Modulos() {

  const [modulos, setModulos] = useState([]);
  useEffect(() => {

    const obtenerModulos = async () => {

      try {

        const response = await fetch("http://localhost:3000/api/modulos");

        const data = await response.json();

        setModulos(data);

      } catch (error) {

        console.error("Error obteniendo módulos:", error);

      }

    };

    obtenerModulos();

  }, []);

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
            />
          ))}
        </div>
      </div>
    </>
  );
}