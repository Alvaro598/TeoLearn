/**
 * Resultado.jsx
 * Ruta: frontend/src/presentation/pages/Resultado.jsx (reemplaza al anterior)
 *
 * CAMBIO PRINCIPAL: el `<Audio src="/sounds/success.mp3">` apuntaba a un
 * archivo que NO existe en el proyecto (por eso nunca sonaba nada al
 * llegar a esta pantalla). Se reemplaza por playResultScreen() de
 * sound.js, 100% sintetizado, con 3 variantes según el desempeño real:
 *   - "perfecto" → 0 errores: fanfarria completa
 *   - "bien"     → con errores pero la mayoría correctas: acorde simple
 *   - "mejorar"  → más errores que aciertos: tono cálido, no desalentador
 *
 * También respeta `preferences.soundEnabled`, igual que el resto de la app.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiUrl } from "../../application/config/apiBase";
import { getLessonResultLocal, guardarLeccionCompletada } from "../../application/services/progress";
import { useAuth } from "../../application/context/useAuth";
import { usePreferences } from "../../application/context/usePreferences";
import { playResultScreen } from "../../application/services/sound";

function calcularVariante(resultado) {
  const { aciertos = 0, errores = 0 } = resultado || {};
  if (errores === 0 && aciertos > 0) return "perfecto";
  if (aciertos >= errores) return "bien";
  return "mejorar";
}

export default function Resultado() {
  const { leccionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const modoRepaso = Boolean(location.state?.modoRepaso);
  const { usuarioDB, refrescarUsuarioDB } = useAuth();
  const { preferences } = usePreferences();

  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorFinalizar, setErrorFinalizar] = useState("");

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
    if (!resultado || !preferences.soundEnabled) return;
    playResultScreen(calcularVariante(resultado));
    // Solo debe sonar una vez al entrar a la pantalla con el resultado ya cargado.
  }, [resultado, preferences.soundEnabled]);

  const finalizarLeccion = async () => {
    try {
      if (!usuarioDB?.id) throw new Error("Inicia sesión para guardar tu progreso.");
      await guardarLeccionCompletada(
        usuarioDB.id,
        Number(leccionId),
        resultado?.puntuacion || 0,
        leccion?.modulo_slug || ""
      );
      await refrescarUsuarioDB();

      navigate(`/unidad/${leccion?.unidad_id}/lecciones`, {
        replace: true,
      });
    } catch (error) {
      console.error("Error al finalizar lección:", error);
      setErrorFinalizar(error.message || "No se pudo guardar la lección.");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Cargando resultado...
      </div>
    );
  }

  const variante = calcularVariante(resultado);

  const mensajePorVariante = {
    perfecto: "Perfecto. Dominaste esta lección 🎯",
    bien: "Buen trabajo, puedes mejorar con un reintento 💪",
    mejorar: "Vas en buen camino. Repasa y vuelve a intentarlo 🌱",
  };

  return (
    <div className="p-10 text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2">
        {variante === "perfecto" ? "🏆 ¡Lección dominada!" : "🎉 ¡Lección completada!"}
      </h1>

      <p className="text-gray-600 mb-6">
        Has finalizado la lección {leccionId}
      </p>

      {modoRepaso && (
        <p role="status" className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-900">
          Estás repasando una lección cuyos ejercicios ya estaban aprobados. Si la lección ya estaba registrada como completada, finalizarla de nuevo no duplicará los XP.
        </p>
      )}

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

      <p className="text-sm text-gray-500 mb-6">
        {mensajePorVariante[variante]}
      </p>

      {errorFinalizar && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {errorFinalizar}
        </p>
      )}

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
