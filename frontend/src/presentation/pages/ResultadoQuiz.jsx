import { Download, RotateCcw, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getQuizFinalResult } from "../../application/services/progress";
import { calcularAciertos } from "../../../../shared/quizQuestions.js";
import { generarPDF } from "../../application/services/quizPdf";
import { obtenerEstadoUsuario } from "../../application/services/userState";
import { useAuth } from "../../application/context/useAuth";

const RESULT_STORAGE_KEY = "teolearn-quiz-result";

function leerResultadoGuardado() {
  try {
    const resultado = sessionStorage.getItem(RESULT_STORAGE_KEY);
    return resultado ? JSON.parse(resultado) : getQuizFinalResult();
  } catch {
    return null;
  }
}

export default function ResultadoQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioDB } = useAuth();
  const [resultado, setResultado] = useState(() => location.state || leerResultadoGuardado());

  useEffect(() => {
    if (location.state || !usuarioDB?.id) return;
    let cancelled = false;
    obtenerEstadoUsuario()
      .then((state) => {
        if (!cancelled && state.resultado_quiz_final) {
          setResultado(state.resultado_quiz_final);
        }
      })
      .catch((error) => console.error("No se pudo cargar el resultado final:", error));
    return () => {
      cancelled = true;
    };
  }, [location.state, usuarioDB?.id]);

  if (!resultado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-extrabold text-gray-950">
            No hay resultados disponibles
          </h1>
          <p className="mb-6 text-gray-600">
            Completa el quiz para poder consultar y descargar tus resultados.
          </p>
          <button
            type="button"
            onClick={() => navigate("/quiz-final")}
            className="rounded-xl bg-brand-blue px-5 py-3 font-bold text-white"
          >
            Ir al quiz
          </button>
        </div>
      </div>
    );
  }

  const { moduloSlug, preguntas, respuestas, nombreUsuario } = resultado;
  const aciertos = calcularAciertos(preguntas, respuestas);
  const errores = preguntas.length - aciertos;
  const porcentaje = preguntas.length
    ? Math.round((aciertos / preguntas.length) * 100)
    : 0;

  const descargarResultados = () => {
    generarPDF({ moduloSlug, preguntas, respuestas, nombreUsuario });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <Trophy size={32} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-pink">
            Quiz completado
          </p>
          <h1 className="mb-3 text-4xl font-extrabold text-gray-950">
            Estos son tus resultados
          </h1>
          <p className="text-gray-600">
            {nombreUsuario || "Estudiante"}, revisa tu desempeño y descarga el informe cuando quieras.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-brand-blue">{porcentaje}%</p>
            <p className="text-sm font-semibold text-gray-500">Puntaje final</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-green-600">{aciertos}</p>
            <p className="text-sm font-semibold text-gray-500">Respuestas correctas</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-red-500">{errores}</p>
            <p className="text-sm font-semibold text-gray-500">Respuestas por revisar</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-950">Resumen de la evaluación</h2>
              <p className="text-sm text-gray-500">{preguntas.length} preguntas respondidas</p>
            </div>
            <button
              type="button"
              onClick={descargarResultados}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 font-extrabold text-white transition hover:opacity-90"
            >
              <Download size={18} />
              Descargar resultados
            </button>
          </div>

          <div className="space-y-3">
            {preguntas.map((pregunta, index) => {
              const correcta = respuestas[pregunta.id] === pregunta.respuesta;
              return (
                <div
                  key={pregunta.id}
                  className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${
                    correcta ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">Pregunta {index + 1}</p>
                    <p className="text-sm text-gray-600">{pregunta.pregunta}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Tu respuesta: <strong>{respuestas[pregunta.id] || "Sin respuesta"}</strong>
                    </p>
                    {!correcta && (
                      <p className="text-sm text-green-800">
                        Respuesta correcta: <strong>{pregunta.respuesta}</strong>
                      </p>
                    )}
                    {pregunta.explicacion && (
                      <p className="mt-2 text-sm text-blue-900">{pregunta.explicacion}</p>
                    )}
                  </div>
                  <span className={`text-sm font-extrabold ${correcta ? "text-green-700" : "text-red-700"}`}>
                    {correcta ? "Correcta" : "Revisar"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/modulos")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-700 transition hover:bg-white"
          >
            <RotateCcw size={18} />
            Volver a módulos
          </button>
        </div>
      </div>
    </div>
  );
}
