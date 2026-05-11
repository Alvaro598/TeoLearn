import { useState } from "react";


export default function RitmoExercise() {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const evaluar = async () => {
    setLoading(true);

    const res = await enviarRitmo({
      patron: {},
      tempo: 120,
      ejercicio_id: 1
    });

    setFeedback(res);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">
        Ejercicio de Ritmo
      </h1>

      <button
        onClick={evaluar}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Evaluando..." : "Evaluar"}
      </button>

      {feedback && (
        <p className="mt-4">
          {feedback.mensaje}
        </p>
      )}

    </div>
  );
}