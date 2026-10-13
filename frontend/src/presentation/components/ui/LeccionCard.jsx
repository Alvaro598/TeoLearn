import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";

const FALLBACK_LESSON_IMAGE =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d";

export default function LeccionCard({
  leccion,
  unidadId,
  completada = false,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/unidad/${unidadId}/leccion/${leccion.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl overflow-hidden shadow-md transition-transform bg-white cursor-pointer hover:-translate-y-2 ${
        completada ? "ring-2 ring-green-200" : ""
      }`}
    >
      {/* IMAGEN */}
      <div className="h-44 w-full bg-white p-4 flex items-center justify-center">
        <img
          src={leccion.imagen_url || FALLBACK_LESSON_IMAGE}
          alt={leccion.titulo}
          className="max-h-full max-w-full object-contain"
          onError={(event) => {
            if (event.currentTarget.src !== FALLBACK_LESSON_IMAGE) {
              event.currentTarget.src = FALLBACK_LESSON_IMAGE;
            }
          }}
        />
      </div>

      {/* CONTENIDO */}
      <div className="p-5 bg-white">
        <div className="flex justify-between items-center mb-2 gap-3">
          <h2 className="font-semibold text-lg">
            {leccion.titulo}
          </h2>

          <PlayCircle
            className={`shrink-0 ${
              completada ? "text-green-600" : "text-brand-pink"
            }`}
          />
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {leccion.descripcion}
        </p>

        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            completada
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {completada ? "Repasar" : "Disponible"}
        </span>
      </div>
    </div>
  );
}