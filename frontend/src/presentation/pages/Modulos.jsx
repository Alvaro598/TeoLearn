
import ModuloCard from "../components/ui/ModuloCard";

export default function Modulos() {
  const modulos = [
    {
      id: "ritmo",
      title: "Ritmo",
      description:
        "Se centra en el tiempo, las figuras musicales y el compás. Domina los fundamentos del tiempo musical.",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d"
    },
    {
      id: "melodia",
      title: "Melodía",
      description:
        "Cubre el tono, las escalas y los intervalos. Aprende a componer melodías expresivas y memorables.",
      image:
        "https://images.unsplash.com/photo-1513883049090-d0b7439799bf"
    },
    {
      id: "armonia",
      title: "Armonía",
      description:
        "Enseña acordes, progresiones y conducción de voces. Comprende cómo se combinan las notas.",
      image:
        "https://images.unsplash.com/photo-1507838153414-b4b713384a76"
    }
  ];

  return (
    <>
     

      <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-10">
        <h1 className="text-2xl text-center py-5 pb-5 sm:text-3xl font-bold mb-6 sm:mb-10">Módulos</h1>

        {/* GRID en lugar de flex */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {modulos.map((mod, index) => (
            <ModuloCard
              key={index}
              id={mod.id}
              title={mod.title}
              description={mod.description}
              image={mod.image}
              progress={0} 
            />
          ))}
        </div>
      </div>
    </>
  );
}