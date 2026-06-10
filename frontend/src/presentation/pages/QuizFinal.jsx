import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playError, playSuccess } from "../../application/services/sound";
import { getQuizFinalProgress } from "../../application/services/progress";

const questions = [
  ["Ritmo", "Que es el pulso musical?", ["Un tiempo constante", "Una escala", "Un acorde", "Un timbre"], "Un tiempo constante"],
  ["Ritmo", "Cuantos tiempos tiene normalmente un compas de 4/4?", ["4", "3", "2", "6"], "4"],
  ["Ritmo", "Si la negra vale 1 pulso, la blanca vale...", ["2 pulsos", "1/2 pulso", "4 pulsos", "0 pulsos"], "2 pulsos"],
  ["Ritmo", "Que representa un silencio?", ["Tiempo sin sonido", "Nota aguda", "Acorde menor", "Timbre"], "Tiempo sin sonido"],
  ["Melodia", "C-D-E-F-G-A-B corresponde a...", ["Do-Re-Mi-Fa-Sol-La-Si", "La-Si-Do-Re-Mi-Fa-Sol", "I-IV-V", "Figuras"], "Do-Re-Mi-Fa-Sol-La-Si"],
  ["Melodia", "Un intervalo es...", ["Distancia entre dos notas", "Volumen", "Velocidad", "Ruido"], "Distancia entre dos notas"],
  ["Melodia", "La escala de Do mayor usa...", ["C-D-E-F-G-A-B-C", "C-E-G", "C-F-G", "A-C-E"], "C-D-E-F-G-A-B-C"],
  ["Melodia", "En el pentagrama, mas arriba indica sonido...", ["Mas agudo", "Mas grave", "Mas lento", "Mas suave"], "Mas agudo"],
  ["Armonia", "Una triada basica tiene...", ["Tres notas", "Siete notas", "Un pulso", "Una linea"], "Tres notas"],
  ["Armonia", "C-E-G forma...", ["Do mayor", "La menor", "Sol mayor", "Un silencio"], "Do mayor"],
  ["Armonia", "La funcion dominante suele generar...", ["Tension", "Reposo total", "Silencio", "Duracion"], "Tension"],
  ["Armonia", "Una progresion armonica es...", ["Secuencia de acordes", "Una nota aislada", "Una figura ritmica", "Un ruido"], "Secuencia de acordes"],
].map(([module, question, options, answer], index) => ({
  id: index + 1,
  module,
  question,
  options,
  answer,
}));

export default function QuizFinal() {
  const [answers, setAnswers] = useState({});
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let active = true;

    getQuizFinalProgress()
      .then((state) => {
        if (!active) {
          return;
        }

        setQuizUnlocked(state.unlocked);
        setProgress(state);
        setCheckingAccess(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setQuizUnlocked(false);
        setProgress(null);
        setCheckingAccess(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return total + (answers[question.id] === question.answer ? 1 : 0);
    }, 0);
  }, [answers]);

  const answerQuestion = (question, option) => {
    setAnswers((current) => ({ ...current, [question.id]: option }));
    option === question.answer ? playSuccess() : playError();
  };

  const downloadResults = () => {
    const rows = [
      ["id", "modulo", "pregunta", "respuesta_usuario", "respuesta_correcta", "correcta"],
      ...questions.map((question) => [
        question.id,
        question.module,
        question.question,
        answers[question.id] || "",
        question.answer,
        answers[question.id] === question.answer ? "si" : "no",
      ]),
      ["total", "", "", score, questions.length, `${Math.round((score / questions.length) * 100)}%`],
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teolearn-quiz-final-resultados.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10 flex items-center justify-center">
        <p className="text-gray-600 font-semibold">Verificando acceso al quiz final...</p>
      </div>
    );
  }

  if (!quizUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-pink mb-3">
            Evaluacion final bloqueada
          </p>
          <h1 className="text-3xl font-extrabold text-gray-950 mb-3">
            Completa todos los módulos para desbloquearla
          </h1>
          <p className="text-gray-600 mb-6">
            Termina Ritmo, Melodía y Armonía para habilitar el quiz final.
          </p>

          {progress?.requiredModules?.length ? (
            <p className="text-sm text-gray-500 mb-6">
              Módulos pendientes: {progress.requiredModules.filter((module) => !module.unlocked).map((module) => module.titulo).join(", ")}
            </p>
          ) : null}

          <Link
            to="/modulos"
            className="inline-flex items-center justify-center bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
          >
            Volver a módulos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-pink mb-3">
          Evaluacion final
        </p>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 mb-3">
              Quiz final descargable
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl">
              Cubre ritmo, melodia y armonia. El archivo CSV sirve para analizar utilidad, aciertos y puntos de mejora durante pruebas de usabilidad.
            </p>
          </div>

          <button
            onClick={downloadResults}
            className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-3 rounded-xl font-extrabold"
          >
            <Download size={18} />
            Descargar resultados
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="font-extrabold text-xl">
            Puntaje: {score} / {questions.length}
          </p>
          <div className="w-full bg-gray-100 h-3 rounded-full mt-3">
            <div
              className="bg-brand-pink h-3 rounded-full"
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((question) => (
            <article key={question.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-2">
                {question.module}
              </p>
              <h2 className="text-xl font-extrabold mb-4">{question.question}</h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option;
                  const correct = option === question.answer;

                  return (
                    <button
                      key={option}
                      onClick={() => answerQuestion(question, option)}
                      className={`p-4 rounded-xl text-left font-bold ${
                        selected
                          ? correct
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
