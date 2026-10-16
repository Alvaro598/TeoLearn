function esResultadoQuiz(resultado) {
  return Boolean(
    resultado
      && Array.isArray(resultado.preguntas)
      && resultado.respuestas
      && typeof resultado.respuestas === "object"
  );
}

export function esResultadoDeModulo(resultado) {
  return esResultadoQuiz(resultado)
    && typeof resultado.moduloSlug === "string"
    && resultado.moduloSlug !== "Evaluación final";
}

export function resolverResultadoQuiz({ estadoNavegacion, resultadoSesion, resultadoFinal }) {
  const resultadoNavegacion = estadoNavegacion?.resultado
    || (esResultadoQuiz(estadoNavegacion) ? estadoNavegacion : null);

  if (estadoNavegacion?.tipo === "final") {
    return resultadoNavegacion || resultadoFinal || null;
  }

  if (estadoNavegacion?.tipo === "modulo") {
    return resultadoNavegacion || (esResultadoDeModulo(resultadoSesion) ? resultadoSesion : null);
  }

  return resultadoNavegacion || resultadoSesion || resultadoFinal || null;
}

export function debeCargarResultadoFinal({ estadoNavegacion, resultadoActual, usuarioId }) {
  if (!usuarioId || estadoNavegacion?.tipo === "modulo") return false;
  if (estadoNavegacion?.tipo === "final" && estadoNavegacion.resultado) return false;
  return !esResultadoDeModulo(resultadoActual);
}
