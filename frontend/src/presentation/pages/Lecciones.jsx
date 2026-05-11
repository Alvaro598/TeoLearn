import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { unidadesData } from "../../data/unidadesData";

import LeccionCard from "../components/ui/LeccionCard";

export default function Lecciones() {

  const { unidadId } = useParams();

  const navigate = useNavigate();

  let lecciones = [];

  Object.values(unidadesData).forEach(
    (modulo) => {

      modulo.forEach((unidad) => {

        if (
          unidad.id === Number(unidadId)
        ) {
          lecciones =
            unidad.lecciones;
        }
      });
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      {/* VOLVER */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Volver
      </button>

      {/* TÍTULO */}
      <h1 className="text-3xl text-center font-bold mb-10 py-5 pb-5">
        Lecciones
      </h1>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8">

        {lecciones.map((leccion) => (
          <LeccionCard
            key={leccion.id}
            leccion={leccion}
            unidadId={unidadId}
          />
        ))}

      </div>

    </div>
  );
}