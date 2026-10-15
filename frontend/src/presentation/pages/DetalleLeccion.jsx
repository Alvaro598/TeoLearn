import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../../application/config/apiBase";
import { usePreferences } from "../../application/context/usePreferences";
import { speakText, stopSpeech } from "../../application/services/speech";

function getVideoEmbedUrl(videoUrl) {
  if (!videoUrl) return null;

  const driveFileId = videoUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1]
    || videoUrl.match(/id=([^&]+)/i)?.[1]
    || videoUrl.match(/google\.com\/uc\?export=download&id=([^&]+)/i)?.[1];

  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }

  if (videoUrl.includes("youtube.com/watch")) {
    const youtubeId = videoUrl.match(/[?&]v=([^&]+)/i)?.[1];
    return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : videoUrl;
  }

  if (videoUrl.includes("youtu.be/")) {
    const youtubeId = videoUrl.match(/youtu\.be\/([^?&]+)/i)?.[1];
    return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : videoUrl;
  }

  if (videoUrl.includes("youtube.com/embed/")) {
    return videoUrl;
  }

  return videoUrl;
}

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
  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const obtenerLeccion = async () => {
      try {
        const response = await fetch(apiUrl(`/lecciones/${leccionId}`));
        const data = await response.json();
        setLeccion(data);
      } catch (error) {
        console.error("Error obteniendo leccion:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerLeccion();
    return () => stopSpeech();
  }, [leccionId]);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando leccion...</div>;
  }

  if (!leccion) {
    return <div className="min-h-screen flex items-center justify-center">No se encontro la leccion.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">
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

        <h1 className="w-full min-w-0 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight break-words mb-4 text-gray-950">
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

         {leccion.video_url && (
          <div className="mb-6 overflow-hidden rounded-3xl border-4 border-gray-950 shadow-[8px_8px_0_#111827] bg-white">
            <div className="relative aspect-video">
              <iframe
                src={getVideoEmbedUrl(leccion.video_url)}
                title={`Video de apoyo: ${leccion.titulo}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
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

        <button
        id="boton-ir-ejercicios"
          onClick={() => navigate(`/ejercicio/${leccion.id}`)}
          className="mt-4 w-full bg-brand-pink text-white font-extrabold py-4 rounded-xl hover:opacity-90 transition"
        >
          Ir a ejercicios
        </button>

      </div>
    </div>
  );
}
