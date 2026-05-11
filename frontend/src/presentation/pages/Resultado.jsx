import { useParams, useNavigate } from "react-router-dom";

export default function Resultado() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">
        🎉 Resultado
      </h1>

      <p className="mb-6">
        Has completado la lección {lessonId}
      </p>

      <button
        onClick={() => navigate("/modulos")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Volver a módulos
      </button>
    </div>
  );
}