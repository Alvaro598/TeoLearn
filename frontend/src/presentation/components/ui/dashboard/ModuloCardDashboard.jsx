import { Link } from "react-router-dom";

export default function ModuloCardDashboard({
  nombre,
  path,
  emoji,
  porcentaje,
  color
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">

      <div className="text-3xl mb-2">{emoji}</div>

      <h3 className="font-semibold text-lg mb-2">
        {nombre}
      </h3>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {porcentaje}% completado
      </p>
      
      
    </div>
  );
}