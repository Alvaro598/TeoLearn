import { Link } from "react-router-dom";
export default function ModuloCard({ id, title, description, image, progress = 0 }) {

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-transform duration-200"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(15, 23, 42, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
      }}
    >

      {/* Imagen */}
      <img
        src={image}
        alt={title}
        className="h-40 w-full object-cover"
      />

      <div className="p-5 flex flex-col flex-1">

        {/* Título */}
        <h2 className="text-xl font-semibold mb-2">{title}</h2>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>

        {/* Progreso */}
        <p className="text-sm text-gray-500 mb-1">
          Progreso {progress}%
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
     
        <Link
          to={`/modulos/${id}/unidades`} 

          className="w-full bg-brand-blue hover:bg-blue-800 text-white py-2 rounded-lg mt-auto text-center block"
        >
          Ver Lecciones
        </Link>
      </div>
    </div>
  );
}