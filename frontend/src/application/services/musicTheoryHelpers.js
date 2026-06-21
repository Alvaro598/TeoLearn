/**
 * musicTheoryHelpers.js
 * Ruta: frontend/src/application/services/musicTheoryHelpers.js
 *
 * Utilidades compartidas por los tres nuevos componentes de ejercicio
 * (ritmo, melodía, armonía) para interpretar el `contenido` que llega
 * desde el currículo (learningPathData.js) y convertirlo en datos
 * reproducibles por sound.js o validables contra respuesta_correcta.
 */

// ─── Nombres de grados romanos → semitonos desde la tónica ────────────────────
export const GRADO_A_SEMITONOS_MAYOR = {
  I: 0, ii: 2, iii: 4, IV: 5, V: 7, vi: 9, "vii°": 11, "VII°": 11,
  II: 2, III: 4, VI: 9, VII: 11,
};

const CROMATICA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Devuelve el nombre de nota a `semitonos` de distancia de `tonica` (ej. "C4") */
export function transportarNota(tonica, semitonos) {
  const match = tonica.match(/^([A-G]#?)(\d)$/);
  if (!match) return tonica;
  const [, letra, octavaStr] = match;
  const octava = Number(octavaStr);

  const indexBase = CROMATICA.indexOf(letra);
  const totalSemitonos = indexBase + semitonos;
  const nuevaOctava = octava + Math.floor(totalSemitonos / 12);
  const nuevoIndex = ((totalSemitonos % 12) + 12) % 12;

  return `${CROMATICA[nuevoIndex]}${nuevaOctava}`;
}

/**
 * Construye una tríada (3 notas) sobre una tónica dada y un tipo de acorde.
 * tipo: "mayor" | "menor" | "disminuido"
 */
export function construirTriada(tonica, tipo = "mayor") {
  const intervalos = {
    mayor:       [0, 4, 7],
    menor:       [0, 3, 7],
    disminuido:  [0, 3, 6],
  }[tipo] || [0, 4, 7];

  return intervalos.map((semi) => transportarNota(tonica, semi));
}

/**
 * Construye la progresión de acordes (array de arrays de notas) a partir de
 * una notación de grados romanos y la tonalidad.
 *
 * construirProgresionDesdeGrados("C4", ["I","IV","V","I"])
 *  → [["C4","E4","G4"], ["F4","A4","C5"], ["G4","B4","D5"], ["C4","E4","G4"]]
 *
 * Los grados minúsculos (ii, iii, vi) se interpretan como tríadas menores;
 * los mayúsculos (I, IV, V) como mayores; "vii°"/"VII°" como disminuido.
 */
export function construirProgresionDesdeGrados(tonicaBase, grados = []) {
  return grados.map((grado) => {
    const semitonos = GRADO_A_SEMITONOS_MAYOR[grado] ?? 0;
    const tonicaGrado = transportarNota(tonicaBase, semitonos);

    let tipo = "mayor";
    if (grado.includes("°")) tipo = "disminuido";
    else if (grado === grado.toLowerCase() && /^[ivx]+$/i.test(grado)) tipo = "menor";

    return construirTriada(tonicaGrado, tipo);
  });
}

// ─── Conversión de patrones rítmicos a formato reproducible ───────────────────
/**
 * Normaliza el contenido de un ejercicio rítmico (definido en el currículo)
 * al formato esperado por sound.js → playRhythm().
 *
 * Espera contenido.patron = [
 *   { figura: "negra", nota: "C4", acento: true },   // kick en tiempo fuerte
 *   { figura: "negra", nota: null },                  // silencio
 *   { figura: "negra", nota: "G4" },                  // snare
 *   { figura: "negra", nota: null },
 * ]
 */
export function normalizarPatronRitmico(contenido = {}) {
  return (contenido.patron || []).map((paso) => ({
    figura: paso.figura || "negra",
    nota:   paso.nota ?? null,
    acento: !!paso.acento,
  }));
}

// ─── Comparación de respuestas ────────────────────────────────────────────────
export function compararArraysNotas(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((nota, i) => nota === b[i]);
}

export function compararStackAcordes(stackUsuario = [], stackEsperado = []) {
  if (stackUsuario.length !== stackEsperado.length) return false;
  return stackUsuario.every((acorde, i) => {
    const esperado = [...stackEsperado[i]].sort();
    const recibido = [...acorde].sort();
    return JSON.stringify(esperado) === JSON.stringify(recibido);
  });
}

// ─── Etiquetas legibles para UI ────────────────────────────────────────────────
export const FIGURA_LABEL = {
  redonda:      { simbolo: "○",  beats: 4,    nombre: "Redonda" },
  blanca:       { simbolo: "𝅗𝅥", beats: 2,    nombre: "Blanca" },
  negra:        { simbolo: "♩",  beats: 1,    nombre: "Negra" },
  corchea:      { simbolo: "♪",  beats: 0.5,  nombre: "Corchea" },
  semicorchea:  { simbolo: "♬",  beats: 0.25, nombre: "Semicorchea" },
  silencio:     { simbolo: "𝄽",  beats: 1,    nombre: "Silencio" },
};

export const TECNICA_LABEL = {
  legato:        "Ligado: las notas se conectan sin separación.",
  staccato:      "Staccato: notas cortas y separadas.",
  pizzicato:     "Pizzicato: pellizcado, sonido seco y corto.",
  glissando:     "Glissando: deslizamiento continuo entre notas.",
  tenuto:        "Tenuto: sostener la nota a su valor completo.",
  pregunta:      "Frase 'pregunta': abierta, sin resolver.",
  respuesta:     "Frase 'respuesta': cierra y resuelve la pregunta.",
  motivo:        "Motivo: idea melódica corta y reconocible.",
  variacion:     "Variación: el motivo transformado (ritmo, altura o ambos).",
  arpegio:       "Arpegio: notas de un acorde tocadas en sucesión.",
  puntoFocal:    "Punto focal: la nota de mayor tensión/altura de la frase.",
};