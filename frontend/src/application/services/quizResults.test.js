import assert from "node:assert/strict";
import test from "node:test";
import {
  debeCargarResultadoFinal,
  resolverResultadoQuiz,
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
