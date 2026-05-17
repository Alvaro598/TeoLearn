

export const evaluateQuiz = (
  correctAnswer,
  userAnswer
) => {
  const isCorrect = correctAnswer === userAnswer

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,

    feedback: isCorrect
      ? "Respuesta correcta."
      : "Respuesta incorrecta."
  }
}

export const evaluateMidi = (
  expectedNotes,
  userNotes
) => {
  let mistakes = []

  expectedNotes.forEach((note, index) => {
    if (userNotes[index] !== note) {
      mistakes.push({
        expected: note,
        received: userNotes[index]
      })
    }
  })

  const score =
    100 -
    (mistakes.length / expectedNotes.length) * 100

  return {
    isCorrect: mistakes.length === 0,

    score: Math.max(score, 0),

    mistakes
  }
}

export const generateAIFeedback = (
  mistakes
) => {
  if (!mistakes.length) {
    return "Excelente trabajo. Interpretaste correctamente el ejercicio."
  }

  return `
Detecté algunos errores en las notas seleccionadas.

Intenta revisar:
${mistakes
  .map(
    (m) =>
      `Esperada: ${m.expected} / Recibida: ${m.received}`
  )
  .join("\n")}
`
}