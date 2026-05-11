import { useNavigate } from "react-router-dom";

import {
  Lock,
  CheckCircle,
  PlayCircle,
} from "lucide-react";

export default function LeccionCard({
  leccion,
  unidadId,
}) {

  const navigate = useNavigate();

  const handleClick = () => {

    if (
      leccion.status !== "locked"
    ) {

      navigate(
        `/unidad/${unidadId}/leccion/${leccion.id}`
      );
    }
  };

  const getStatusIcon = () => {

    switch (leccion.status) {

      case "completed":
        return (
          <CheckCircle className="text-green-500" />
        );

      case "current":
        return (
          <PlayCircle className="text-yellow-500" />
        );

      case "locked":
        return (
          <Lock className="text-gray-400" />
        );
    }
  };

  return (

    <div
      onClick={handleClick}
      className={`rounded-xl overflow-hidden shadow-md cursor-pointer transition transform hover:-translate-y-2 ${
        leccion.status === "locked" &&
        "opacity-60 cursor-not-allowed"
      }`}
    >

      {/* IMAGEN */}
      <img
        src={leccion.image}
        alt={leccion.title}
        className="h-40 w-full object-cover"
      />

      {/* CONTENIDO */}
      <div className="p-5 bg-white">

        <div className="flex justify-between items-center mb-2">

          <h2 className="font-semibold text-lg">
            {leccion.title}
          </h2>

          {getStatusIcon()}

        </div>

        <p className="text-sm text-gray-600 mb-3">
          {leccion.description}
        </p>

        {/* ESTADO */}
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            leccion.status === "completed"
              ? "bg-green-100 text-green-600"
              : leccion.status === "current"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {leccion.status}
        </span>

      </div>

    </div>
  );
}