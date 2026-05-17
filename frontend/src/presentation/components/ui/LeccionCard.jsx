import { useNavigate } from "react-router-dom";

import {
  PlayCircle,
} from "lucide-react";

export default function LeccionCard({
  leccion,
  unidadId,
}) {

  const navigate = useNavigate();

  const handleClick = () => {

    navigate(
      `/unidad/${unidadId}/leccion/${leccion.id}`
    );
  };

  return (

    <div
      onClick={handleClick}
      className="rounded-xl overflow-hidden shadow-md cursor-pointer transition transform hover:-translate-y-2 bg-white"
    >

      {/* IMAGEN */}
      <img
        src="https://images.unsplash.com/photo-1511379938547-c1f69419868d"
        alt={leccion.titulo}
        className="h-40 w-full object-cover"
      />

      {/* CONTENIDO */}
      <div className="p-5 bg-white">

        <div className="flex justify-between items-center mb-2">

          <h2 className="font-semibold text-lg">
            {leccion.titulo}
          </h2>

          <PlayCircle className="text-brand-pink" />

        </div>

        <p className="text-sm text-gray-600 mb-3">
          {leccion.descripcion}
        </p>

        <span
          className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-600"
        >
          Disponible
        </span>

      </div>

    </div>
  );
}