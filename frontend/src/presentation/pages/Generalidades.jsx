import { Play, Search } from "lucide-react";
import { useMemo, useState } from "react";

const videos = [
  {
    title: "Historia de la musica en 10 minutos",
    category: "Historia",
    image: "/images/history.jpg",
    description: "Un recorrido desde la musica ritual y antigua hasta la musica popular moderna.",
    duration: "10 min",
    url: "https://www.youtube.com/results?search_query=historia+de+la+musica+resumen",
  },
  {
    title: "Origen de los generos musicales",
    category: "Generos",
    image: "/images/genres.jpg",
    description: "Como nacen estilos como clasica, jazz, rock, salsa, pop y musica urbana.",
    duration: "12 min",
    url: "https://www.youtube.com/results?search_query=origen+generos+musicales",
  },
  {
    title: "Como practicar teoria con un instrumento",
    category: "Practica",
    image: "/images/practice.jpg",
    description: "Ideas para llevar notas, ritmo, intervalos y acordes al piano, guitarra o voz.",
    duration: "8 min",
    url: "https://www.youtube.com/results?search_query=practicar+teoria+musical+instrumento",
  },
  {
    title: "Herramientas digitales para crear musica",
    category: "Produccion",
    image: "/images/production.jpg",
    description: "DAW, secuenciadores, pianos virtuales y apps utiles para componer.",
    duration: "9 min",
    url: "https://www.youtube.com/results?search_query=herramientas+digitales+para+crear+musica",
  },
  {
    title: "Consejos para aprender musica desde cero",
    category: "Consejos",
    image: "/images/tips.jpg",
    description: "Rutinas cortas, escucha activa, practica deliberada y metas alcanzables.",
    duration: "7 min",
    url: "https://www.youtube.com/results?search_query=consejos+aprender+musica+desde+cero",
  },
  {
    title: "Del 20 por ciento al 80 por ciento",
    category: "Pareto",
    image: "/images/pareto.jpg",
    description: "Temas esenciales que explican gran parte de lo que un principiante necesita dominar.",
    duration: "6 min",
    url: "https://www.youtube.com/results?search_query=principio+de+pareto+aprendizaje+musical",
  },
];

export default function Generalidades() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = ["Todos", ...new Set(videos.map((video) => video.category))];

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesCategory = category === "Todos" || video.category === category;
      const matchesQuery = `${video.title} ${video.description}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-pink mb-3">
            Contenido de apoyo
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 mb-4">
            Galeria para ampliar tu cultura musical
          </h1>

          <p className="max-w-3xl text-gray-600 text-lg leading-relaxed">
            Este espacio cubre el aprendizaje transversal: historia, generos, practica con instrumento,
            herramientas creativas y consejos para convertir la teoria en musica real.
          </p>

          <div className="mt-8 flex flex-col lg:flex-row gap-4">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Buscar historia, generos, instrumentos..."
              />
            </label>

            <div className="flex gap-2 overflow-x-auto">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap ${category === item
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => (
          <article
            key={video.title}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.image}
                alt={video.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play
                  size={44}
                  fill="currentColor"
                  className="text-white"
                />
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="font-bold uppercase tracking-widest text-brand-pink">
                  {video.category}
                </span>
                <span>{video.duration}</span>
              </div>

              <h2 className="text-xl font-extrabold mb-2">{video.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {video.description}
              </p>

              <div className="mt-auto">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-800"
                >
                  <Play size={16} fill="currentColor" />
                  Ver recursos
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
