import test from "node:test";
import assert from "node:assert/strict";
import { answerIsCorrect } from "./respuesta.controller.js";

test("evalúa selección simple sin aceptar flags del cliente", () => {
  const exercise = { tipo: "quiz", respuesta_correcta: { respuesta: "A" } };
  assert.equal(answerIsCorrect(exercise, { respuesta: "A", correcta: false }), true);
  assert.equal(answerIsCorrect(exercise, { respuesta: "B", correcta: true }), false);
});

test("acepta notas enarmónicas y verifica el orden melódico", () => {
  const exercise = { tipo: "midi", respuesta_correcta: { notas: ["C#4", "E4"] } };
  assert.equal(answerIsCorrect(exercise, { notas: ["Db4", "E4"] }), true);
  assert.equal(answerIsCorrect(exercise, { notas: ["E4", "Db4"] }), false);
});

test("compara acordes sin depender del orden de sus notas", () => {
  const exercise = { tipo: "midi", respuesta_correcta: { stack: [["C4", "E4", "G4"]] } };
  assert.equal(answerIsCorrect(exercise, { stack: [["G4", "C4", "E4"]] }), true);
  assert.equal(answerIsCorrect(exercise, { stack: [["C4", "E4"]] }), false);
});

test("compara patrones y rechaza estructuras inválidas", () => {
  const exercise = { tipo: "midi", respuesta_correcta: { patron: { kick: [1, 3], snare: [2] } } };
  assert.equal(answerIsCorrect(exercise, { patron: { kick: [3, 1], snare: [2] } }), true);
  assert.equal(answerIsCorrect(exercise, { patron: { kick: "1,3", snare: [2] } }), false);
});

test("valida duración y reloj interno con límites del servidor", () => {
  const duration = { tipo: "midi", contenido: { subtipo: "duracion" }, respuesta_correcta: { duracion: "2 pulsos" } };
  const clock = { tipo: "auditivo", contenido: { subtipo: "reloj-interno" }, respuesta_correcta: { respuesta: "sincronizado" } };
  assert.equal(answerIsCorrect(duration, { duracion: "2 pulsos" }), true);
  assert.equal(answerIsCorrect(clock, { diferenciaMs: 220 }), true);
  assert.equal(answerIsCorrect(clock, { diferenciaMs: 221 }), false);
  assert.equal(answerIsCorrect(clock, { diferenciaMs: -1 }), false);
});

test("rechaza ejercicios que no tienen una clave evaluable", () => {
  assert.equal(answerIsCorrect({ tipo: "quiz", respuesta_correcta: {} }, {}), false);
});