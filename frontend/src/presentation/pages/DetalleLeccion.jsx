import { ArrowLeft, Headphones, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../application/context/AuthContext";
import { usePreferences } from "../../application/context/PreferencesContext";
import { markLessonCompleted } from "../../application/services/progress";
import { guardarLeccionCompletada } from "../../application/services/progress";
import { playSequence } from "../../application/services/sound";
import { speakText, stopSpeech } from "../../application/services/speech";

function parseContent(text = "") {
  const lines = text.split("\n");
  const blocks = [];
  let current = { title: null, body: [] };

  lines.forEach((line) => {
    if (line.startsWith("## ")) {
      if (current.title || current.body.length) blocks.push(current);
      current = { title: line.replace("## ", ""), body: [] };
    } else if (line.trim()) {
      current.body.push(line);
    }
  });

  if (current.title || current.body.length) blocks.push(current);
  return blocks;
}

export default function DetalleLeccion() {
  const { leccionId } = useParams();
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const { usuarioDB, refrescarUsuarioDB } = useAuth();
  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [finalizada, setFinalizada] = useState(false);

  useEffect(() => {
    obtenerLeccion();
    return () => stopSpeech();
  }, []);

  const obtenerLeccion = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/lecciones/${leccionId}`);
      const data = await response.json();
      setLeccion(data);
    } catch (error) {
      console.error("Error obteniendo leccion:", error);
    } finally {
      setLoading(false);
    }
  };

  const blocks = useMemo(() => parseContent(leccion?.contenido), [leccion]);

  const toggleSpeech = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }

    speakText(`${leccion.titulo}. ${leccion.descripcion}. ${leccion.contenido}`);
    setSpeaking(true);
  };

  const finalizarLeccion = async () => {
    if (finalizada) return;

    setFinalizada(true);

    if (usuarioDB?.id) {
      try {
        await guardarLeccionCompletada(usuarioDB.id, Number(leccion.id), 0);
        await refrescarUsuarioDB();
      } catch (error) {
        console.error("No se pudo guardar la lección completada en la BD:", error);
      }
    }

    markLessonCompleted(leccion.id);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando leccion...</div>;
  }

  if (!leccion) {
    return <div className="min-h-screen flex items-center justify-center">No se encontro la leccion.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-950 mb-8 font-bold"
        >
          <ArrowLeft size={18} />
          Volver a lecciones
        </button>

        <p className="text-xs font-bold tracking-[0.35em] uppercase mb-3 text-brand-pink">
          Leccion
        </p>

        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 text-gray-950">
          {leccion.titulo}
        </h1>

        <p className="text-gray-700 text-xl mb-6">{leccion.descripcion}</p>

        {preferences.ttsEnabled && (
          <button
            onClick={toggleSpeech}
            className="inline-flex items-center gap-3 bg-brand-pink text-white px-5 py-3 rounded-xl font-extrabold shadow-[5px_5px_0_#111827] mb-10"
          >
            {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {speaking ? "Detener" : "Escuchar leccion"}
          </button>
        )}

        <div className="space-y-8">
          {blocks.map((block, index) => {
            const example = block.body.find((line) => line.startsWith("Ejemplo:"));
            const normalBody = block.body.filter((line) => !line.startsWith("Ejemplo:"));

            return (
              <section key={`${block.title}-${index}`}>
                {block.title && <h2 className="text-3xl font-extrabold mb-4">{block.title}</h2>}

                {normalBody.map((line) => (
                  <p key={line} className="text-gray-800 text-lg leading-8 mb-3">
                    {line}
                  </p>
                ))}

                {example && (
                  <div className="bg-yellow-300 border-2 border-gray-950 rounded-xl p-4 mt-4 font-semibold">
                    {example}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="mt-10 bg-white border-2 border-gray-950 rounded-xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between shadow-[6px_6px_0_#111827]">
          <button
            onClick={() => playSequence(["C4", "D4", "E4", "G4", "C5"], 0.26)}
            className="inline-flex items-center justify-center gap-3 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
          >
            <Play size={18} fill="currentColor" />
            Reproducir ejemplo
          </button>

          <div className="inline-flex items-center gap-3 text-gray-600 font-bold">
            <Headphones size={22} />
            Ejemplo auditivo integrado
          </div>
        </div>

        {leccion.video_url && (
          <a
            href={leccion.video_url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-brand-blue font-bold hover:underline"
          >
            <Play size={16} fill="currentColor" />
            Ver video corto de apoyo
          </a>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-gray-950">Finalizar esta lección</p>
            <p className="text-sm text-gray-600">
              Guarda el progreso de esta lección y vuelve al listado de lecciones.
            </p>
          </div>

          <button
            type="button"
            onClick={finalizarLeccion}
            disabled={finalizada}
            className="inline-flex items-center justify-center bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold disabled:bg-gray-400"
          >
            {finalizada ? "Lección finalizada" : "Finalizar lección"}
          </button>
        </div>

        <button
          onClick={() => navigate(`/ejercicio/${leccion.id}`)}
          className="mt-4 w-full bg-brand-pink text-white font-extrabold py-4 rounded-xl hover:opacity-90 transition"
        >
          Ir a ejercicios
        </button>

        {finalizada && (
          <button
            type="button"
            onClick={() => navigate(`/unidad/${leccion.unidad_id}/lecciones`)}
            className="mt-4 w-full border-2 border-gray-950 text-gray-950 font-extrabold py-4 rounded-xl hover:bg-gray-100 transition"
          >
            Volver al listado de lecciones
          </button>
        )}
      </div>
    </div>
  );
}
