const MODULOS_QUIZ = new Set(["ritmo", "melodia", "armonia"]);

function esResultadoQuiz(resultado) {
  return Boolean(
    resultado
      && Array.isArray(resultado.preguntas)
      && resultado.respuestas
      && typeof resultado.respuestas === "object"
  );
}

export function resolverResultadoQuizModulo({ moduloSlug, resultadosServidor, resultadoLocal }) {
  if (!MODULOS_QUIZ.has(moduloSlug)) return null;

  const resultadoServidor = resultadosServidor?.[moduloSlug];
  if (esResultadoQuiz(resultadoServidor) && resultadoServidor.moduloSlug === moduloSlug) {
    return resultadoServidor;
  }

  if (esResultadoQuiz(resultadoLocal) && resultadoLocal.moduloSlug === moduloSlug) {
    return resultadoLocal;
  }

  return null;
}

function getQuizModuloStorageKey(moduloSlug) {
  const usuarioId = localStorage.getItem("teolearn-user-id")
    || localStorage.getItem("teolearn-firebase-uid")
    || "guest";
  return `teolearn-module-quiz:${usuarioId}:${moduloSlug}`;
}

export function getQuizModuloResult(moduloSlug) {
  if (!MODULOS_QUIZ.has(moduloSlug)) return null;

  try {
    const raw = localStorage.getItem(getQuizModuloStorageKey(moduloSlug));
    const resultado = raw ? JSON.parse(raw) : null;
    return esResultadoQuiz(resultado) && resultado.moduloSlug === moduloSlug ? resultado : null;
  } catch {
    return null;
  }
}

export function sincronizarResultadoQuizModuloLocal(moduloSlug, resultado) {
  if (!MODULOS_QUIZ.has(moduloSlug) || !esResultadoQuiz(resultado) || resultado.moduloSlug !== moduloSlug) {
    return null;
  }

  localStorage.setItem(getQuizModuloStorageKey(moduloSlug), JSON.stringify(resultado));
  return resultado;
}

export function markQuizModuloCompleted(moduloSlug, resultado) {
  if (!MODULOS_QUIZ.has(moduloSlug) || !esResultadoQuiz(resultado) || resultado.moduloSlug !== moduloSlug) {
    return null;
  }

  return getQuizModuloResult(moduloSlug) || sincronizarResultadoQuizModuloLocal(moduloSlug, resultado);
}

export async function guardarResultadoQuizModulo(moduloSlug, resultado) {
  const resultadoExistente = getQuizModuloResult(moduloSlug);
  const resultadoInicial = resultadoExistente || markQuizModuloCompleted(moduloSlug, resultado);
  if (!resultadoInicial) throw new Error("Resultado de quiz modular inválido");

  const { actualizarEstadoUsuario } = await import("./userState.js");
  const state = await actualizarEstadoUsuario({
    resultados_quiz_modulo: { [moduloSlug]: resultadoInicial },
  });
  const resultadoServidor = resolverResultadoQuizModulo({
    moduloSlug,
    resultadosServidor: state.resultados_quiz_modulo,
    resultadoLocal: resultadoInicial,
  });

  if (resultadoServidor) sincronizarResultadoQuizModuloLocal(moduloSlug, resultadoServidor);
  return resultadoServidor || resultadoInicial;
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
