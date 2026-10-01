/**
 * ModuloCard.jsx
 * Ruta: frontend/src/presentation/components/ui/ModuloCard.jsx
 *
 * CAMBIOS:
 *  - Muestra el módulo como BLOQUEADO si el módulo anterior no está
 *    completado al 100%. El orden es: Ritmo → Melodía → Armonía.
 *  - La lógica de desbloqueo se basa en `porcentajeAnterior` (prop nueva)
 *    que Modulos.jsx calcula desde la BD (no localStorage).
 *  - Módulo bloqueado: card en gris, sin Link, con candado visible.
 *  - El módulo de índice 0 (Ritmo) siempre está desbloqueado.
 *  - Se añade enlace al quiz por módulo cuando el módulo está completado.
 */

import { Lock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function ModuloCard({
  id,
  title,
  description,
  image,
  progress = 0,
  orden = 1,           // 1-based: 1=Ritmo, 2=Melodía, 3=Armonía
  porcentajeAnterior = 100, // porcentaje del módulo anterior (100 si es el primero)
}) {
  const bloqueado  = orden > 1 && porcentajeAnterior < 100;
  const completado = progress === 100;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-transform duration-200 ${
        bloqueado ? "opacity-60 grayscale" : ""
      }`}
      onMouseEnter={(e) => {
        if (bloqueado) return;
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(15,23,42,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
      }}
    >
      {/* Imagen */}
      <div className="relative">
        <img src={image} alt={title} className="h-40 w-full object-cover" />

        {bloqueado && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3">
              <Lock size={24} className="text-gray-700" />
            </div>
          </div>
        )}

        {completado && !bloqueado && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
            <Trophy size={12} />
            Completado
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {/* Progreso */}
        <p className="text-sm text-gray-500 mb-1">
          Progreso {progress}%
          {bloqueado && (
            <span className="ml-2 text-orange-500 font-bold">
              · Completa {orden === 2 ? "Ritmo" : "Melodía"} primero
            </span>
          )}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
          <div id= "progress-bar" 
            className={`h-2 rounded-full transition-all ${
              completado ? "bg-green-500" : "bg-brand-blue"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Botones */}
        <div className="mt-auto flex flex-col gap-2">
          {bloqueado ? (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg text-center font-bold cursor-not-allowed"
            >
              🔒 Módulo bloqueado
            </button>
          ) : (
            <Link id = "botones-modulos"
              to={`/modulos/${id}/unidades`}
              className={`w-full py-2 rounded-lg text-center block font-bold text-white ${
                completado
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-brand-blue hover:bg-blue-800"
              }`}
            >
              {completado ? "Repasar lecciones" : "Ver lecciones"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}