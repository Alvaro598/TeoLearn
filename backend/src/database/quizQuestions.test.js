import assert from "node:assert/strict";
import test from "node:test";
import {
  PREGUNTAS_EVALUACION_FINAL,
  PREGUNTAS_POR_MODULO,
  calcularAciertos,
} from "./quizQuestions.js";

const slugs = ["ritmo", "melodia", "armonia"];
const todasLasPreguntas = [
  ...slugs.flatMap((slug) => PREGUNTAS_POR_MODULO[slug]),
  ...PREGUNTAS_EVALUACION_FINAL,
];

function normalizarEnunciado(enunciado) {
  return enunciado
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

test("cada quiz de módulo y la evaluación final tienen seis preguntas", () => {
  for (const slug of slugs) {
    assert.equal(PREGUNTAS_POR_MODULO[slug].length, 6, `cantidad en ${slug}`);
  }

  assert.equal(PREGUNTAS_EVALUACION_FINAL.length, 18);
  for (const slug of slugs) {
    assert.equal(
      PREGUNTAS_EVALUACION_FINAL.filter((pregunta) => pregunta.moduloSlug === slug).length,
      6,
      `distribución final en ${slug}`
    );
  }
});

test("las preguntas tienen opciones únicas, una respuesta incluida e explicación", () => {
  for (const pregunta of todasLasPreguntas) {
    assert.ok(pregunta.pregunta.trim(), `enunciado de ${pregunta.id}`);
    assert.equal(pregunta.opciones.length, 4, `opciones de ${pregunta.id}`);
    assert.equal(new Set(pregunta.opciones).size, 4, `opciones repetidas en ${pregunta.id}`);
    assert.equal(
      pregunta.opciones.filter((opcion) => opcion === pregunta.respuesta).length,
      1,
      `respuesta correcta única en ${pregunta.id}`
    );
    assert.ok(pregunta.explicacion.trim(), `explicación de ${pregunta.id}`);
  }
});

test("no hay preguntas textualmente duplicadas entre bancos", () => {
  const enunciados = todasLasPreguntas.map((pregunta) => normalizarEnunciado(pregunta.pregunta));
  assert.equal(new Set(enunciados).size, enunciados.length);
});

test("calcula correctamente los aciertos y tolera una lista vacía", () => {
  const preguntas = [
    { id: "q1", respuesta: "A" },
    { id: "q2", respuesta: "B" },
    { id: "q3", respuesta: "C" },
  ];

  assert.equal(calcularAciertos(preguntas, { q1: "A", q2: "incorrecta", q3: "C" }), 2);
  assert.equal(calcularAciertos([], {}), 0);
  assert.equal(calcularAciertos(null, {}), 0);
});
