import assert from "node:assert/strict";
import test from "node:test";
import {
  debeCargarResultadoFinal,
  getQuizModuloResult,
  markQuizModuloCompleted,
  resolverResultadoQuiz,
  resolverResultadoQuizModulo,
} from "./quizResults.js";

const resultadoModulo = {
  moduloSlug: "ritmo",
  preguntas: [{ id: 1 }],
  respuestas: { 1: "correcta" },
};
const resultadoFinal = {
  moduloSlug: "Evaluación final",
  preguntas: [{ id: 1 }, { id: 2 }],
  respuestas: { 1: "correcta", 2: "incorrecta" },
};

test("muestra el resultado del módulo recibido al terminar su quiz", () => {
  const actual = resolverResultadoQuiz({
    estadoNavegacion: { tipo: "modulo", resultado: resultadoModulo },
    resultadoSesion: resultadoModulo,
    resultadoFinal,
  });

  assert.equal(actual, resultadoModulo);
  assert.equal(debeCargarResultadoFinal({
    estadoNavegacion: { tipo: "modulo", resultado: resultadoModulo },
    resultadoActual: actual,
    usuarioId: 42,
  }), false);
});

test("al recargar un resultado de módulo no se reemplaza con el resultado final del servidor", () => {
  const actual = resolverResultadoQuiz({
    estadoNavegacion: null,
    resultadoSesion: resultadoModulo,
    resultadoFinal,
  });

  assert.equal(actual, resultadoModulo);
  assert.equal(debeCargarResultadoFinal({
    estadoNavegacion: null,
    resultadoActual: actual,
    usuarioId: 42,
  }), false);
});

test("el acceso explícito a resultados finales prioriza la evaluación final guardada", () => {
  const actual = resolverResultadoQuiz({
    estadoNavegacion: { tipo: "final" },
    resultadoSesion: resultadoModulo,
    resultadoFinal,
  });

  assert.equal(actual, resultadoFinal);
});

test("una evaluación final recibida en la navegación no se reemplaza desde el servidor", () => {
  assert.equal(debeCargarResultadoFinal({
    estadoNavegacion: { tipo: "final", resultado: resultadoFinal },
    resultadoActual: resultadoFinal,
    usuarioId: 42,
  }), false);
});

test("un resultado del módulo guardado en el servidor impide volver a empezar ese quiz", () => {
  const actual = resolverResultadoQuizModulo({
    moduloSlug: "ritmo",
    resultadosServidor: { ritmo: resultadoModulo },
    resultadoLocal: null,
  });

  assert.equal(actual, resultadoModulo);
});

test("el resultado persistido en el servidor prevalece sobre un resultado local distinto", () => {
  const resultadoServidor = {
    ...resultadoModulo,
    respuestas: { 1: "respuesta del primer intento" },
  };
  const resultadoLocal = {
    ...resultadoModulo,
    respuestas: { 1: "respuesta de otro intento" },
  };

  assert.equal(resolverResultadoQuizModulo({
    moduloSlug: "ritmo",
    resultadosServidor: { ritmo: resultadoServidor },
    resultadoLocal,
  }), resultadoServidor);
});

test("el resultado guardado localmente se conserva por usuario y módulo", () => {
  const storageOriginal = globalThis.localStorage;
  const valores = new Map([["teolearn-user-id", "usuario-1"]]);
  globalThis.localStorage = {
    getItem: (key) => valores.get(key) ?? null,
    setItem: (key, value) => valores.set(key, String(value)),
  };

  try {
    markQuizModuloCompleted("ritmo", resultadoModulo);
    assert.deepEqual(getQuizModuloResult("ritmo"), resultadoModulo);
    assert.equal(getQuizModuloResult("melodia"), null);

    const segundoIntento = {
      ...resultadoModulo,
      respuestas: { 1: "otra respuesta" },
    };
    assert.deepEqual(markQuizModuloCompleted("ritmo", segundoIntento), resultadoModulo);
    assert.deepEqual(getQuizModuloResult("ritmo"), resultadoModulo);

    valores.set("teolearn-user-id", "usuario-2");
    assert.equal(getQuizModuloResult("ritmo"), null);
  } finally {
    if (storageOriginal === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = storageOriginal;
  }
});
