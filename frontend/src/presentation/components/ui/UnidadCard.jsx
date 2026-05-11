import { useNavigate } from "react-router-dom";

export default function UnidadCard({
  unidad,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition">

      <h2 className="text-xl font-bold mb-2">
        {unidad.titulo}
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        {unidad.descripcion}
      </p>

      

      <button
        onClick={() =>
          navigate(
            `/unidad/${unidad.id}/lecciones`
          )
        }
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
      >
        Ver unidad
      </button>
    </div>
  );
}