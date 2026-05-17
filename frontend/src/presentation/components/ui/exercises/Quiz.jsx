
import { useState } from "react"

export default function Quiz({
  exercise,
  onComplete
}) {
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] =
    useState(false)

  const handleSubmit = () => {
    setShowResult(true)

    const isCorrect =
      selected === exercise.correctAnswer

    onComplete({
      isCorrect,
      score: isCorrect ? 100 : 0
    })
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {exercise.title}
        </h2>

        <p className="text-zinc-400 mt-2">
          {exercise.question}
        </p>
      </div>

      <div className="space-y-3">
        {exercise.options.map((option) => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`
              w-full p-4 rounded-xl border transition

              ${
                selected === option
                  ? "bg-blue-500 border-blue-400"
                  : "bg-zinc-800 border-zinc-700"
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="
          w-full
          bg-green-500
          hover:bg-green-400
          disabled:bg-zinc-700
          py-3
          rounded-xl
          font-bold
        "
      >
        Responder
      </button>

      {showResult && (
        <div className="bg-zinc-800 p-4 rounded-xl">
          {selected === exercise.correctAnswer ? (
            <p className="text-green-400">
              Correcto
            </p>
          ) : (
            <p className="text-red-400">
              Incorrecto
            </p>
          )}

          <p className="text-zinc-300 mt-2">
            {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  )
}