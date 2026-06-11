import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../../application/config/apiBase";
import { getLessonResultLocal } from "../../application/services/progress";

export default function Resultado() {
  const { leccionId } = useParams();
  const navigate = useNavigate();

  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);

  const [resultado, setResultado] = useState(() =>
    getLessonResultLocal(leccionId)
  );

  useEffect(() => {
    const obtenerLeccion = async () => {
      try {
        const response = await fetch(apiUrl(`/lecciones/${leccionId}`));
        const data = await response.json();
        setLeccion(data);
        setResultado(getLessonResultLocal(leccionId));
      } catch (error) {
        console.error("Error obteniendo la lección:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerLeccion();
  }, [leccionId]);

  useEffect(() => {
    // 🔊 sonido de éxito (opcional)
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {
      // algunos navegadores bloquean autoplay, no es crítico
    });
  }, []);

  const finalizarLeccion = async () => {
    try {
      await fetch(apiUrl(`/lecciones/${leccionId}/finalizar`), {
        method: "POST",
      });

      navigate(`/unidad/${leccion?.unidad_id}/lecciones`, {
        replace: true,
      });
    } catch (error) {
      console.error("Error al finalizar lección:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Cargando resultado...
      </div>
    );
  }

  return (
    <div className="p-10 text-center max-w-2xl mx-auto">

      {/* 🎉 Título */}
      <h1 className="text-3xl font-extrabold mb-2">
        🎉 ¡Lección completada!
      </h1>

      <p className="text-gray-600 mb-6">
        Has finalizado la lección {leccionId}
      </p>

      {/* 📊 Resultado */}
      <div className="bg-white border rounded-xl p-6 shadow mb-6">
        <h2 className="text-lg font-bold mb-4">Resultados</h2>

        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-extrabold text-green-600">
              {resultado.aciertos}
            </p>
            <p className="text-sm text-gray-500">Aciertos</p>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-red-500">
              {resultado.errores}
            </p>
            <p className="text-sm text-gray-500">Errores</p>
          </div>
        </div>
      </div>

      {/* 💬 Mensaje motivacional */}
      <p className="text-sm text-gray-500 mb-6">
        {resultado.errores === 0
          ? "Perfecto. Dominaste esta lección 🎯"
          : "Buen trabajo, puedes mejorar con un reintento 💪"}
      </p>

      {/* 🚀 Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">

        <button
          onClick={() =>
            navigate(`/unidad/${leccion?.unidad_id}/lecciones`, {
              replace: true,
            })
          }
          className="px-5 py-2 rounded bg-gray-200 font-bold"
        >
          Volver
        </button>

        <button
          onClick={finalizarLeccion}
          className="px-5 py-2 rounded bg-blue-600 text-white font-extrabold"
        >
          Finalizar lección
        </button>
      </div>
    </div>
  );
}