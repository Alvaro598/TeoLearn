/**
 * MEJORA 4: Currículo rediseñado
 * ================================
 * Ruta: backend/src/database/learningPathData.js   (reemplaza al original)
 *
 * Estructura: 3 módulos × 4 unidades × 3 lecciones = 36 lecciones
 * Ejercicios por lección: 3 quiz + 2 auditivos + 2 MIDI = 7 ejercicios
 * Total mínimo: 36 × 7 = 252 ejercicios ✓
 *
 * Principios pedagógicos aplicados:
 *  - Taxonomía de Bloom: recordar → comprender → aplicar → crear
 *  - Recuperación activa: cada lección cierra con pregunta de síntesis
 *  - Espaciado: las unidades de "aplicación" revisan conceptos previos
 *  - Carga cognitiva reducida: un concepto central por lección
 *  - Conexión teoría-práctica: los MIDI replican exactamente el ejemplo teórico
 */

const moduleImages = {
  ritmo:    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  melodia:  "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=1200&q=80",
  armonia:  "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80",
};

// ─── Constructores de contenido ───────────────────────────────────────────────
function content({ intro, sections, graphic, audioExample }) {
  return [
    intro,
    "",
    ...sections.flatMap((s) => [
      `## ${s.title}`,
      s.body,
      s.example ? `Ejemplo: ${s.example}` : "",
      "",
    ]),
    graphic      ? `Gráfico textual: ${graphic}` : "",
    audioExample ? `Ejemplo auditivo sugerido: ${audioExample}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function quiz(order, question, options, answer, points = 10) {
  return {
    tipo: "quiz",
    pregunta: question,
    contenido: { opciones: options },
    respuesta_correcta: { respuesta: answer },
    puntos: points,
    orden: order,
  };
}

// ─── Helpers de teoría musical (transporte y construcción de tríadas) ────────
const CROMATICA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function transportarNota(tonica, semitonos) {
  const m = tonica.match(/^([A-G]#?)(\d)$/);
  if (!m) return tonica;
  const [, letra, octavaStr] = m;
  const octava = Number(octavaStr);
  const idx = CROMATICA.indexOf(letra) + semitonos;
  const nuevaOctava = octava + Math.floor(idx / 12);
  const nuevoIdx = ((idx % 12) + 12) % 12;
  return `${CROMATICA[nuevoIdx]}${nuevaOctava}`;
}

function construirTriada(tonica, tipo = "mayor") {
  const intervalos = { mayor: [0, 4, 7], menor: [0, 3, 7], disminuido: [0, 3, 6] }[tipo] || [0, 4, 7];
  return intervalos.map((s) => transportarNota(tonica, s));
}

const GRADO_A_SEMITONOS = {
  I: 0, ii: 2, iii: 4, IV: 5, V: 7, vi: 9, "vii°": 11,
  II: 2, III: 4, VI: 9, VII: 11, "VII°": 11,
};

function tipoDeGrado(grado) {
  if (grado.includes("°")) return "disminuido";
  if (grado === grado.toLowerCase()) return "menor";
  return "mayor";
}

function construirProgresion(tonicaBase, grados) {
  return grados.map((grado) => {
    const tonicaGrado = transportarNota(tonicaBase, GRADO_A_SEMITONOS[grado] ?? 0);
    return construirTriada(tonicaGrado, tipoDeGrado(grado));
  });
}

// Semitonos de la escala mayor diatónica (0=tónica, 11=7° grado/sensible)
const SEMITONOS_ESCALA_MAYOR = [0, 2, 4, 5, 7, 9, 11];

/** Devuelve el grado diatónico (1-7) de `nota` respecto a `tonica` en escala mayor.
 *  Si la nota no cae exactamente en la escala diatónica, se aproxima al grado más cercano. */
function gradoDiatonico(tonica, nota) {
  const m1 = tonica.match(/^([A-G]#?)(\d)$/);
  const m2 = nota.match(/^([A-G]#?)(\d)$/);
  if (!m1 || !m2) return "1";

  const semisTonica = CROMATICA.indexOf(m1[1]) + Number(m1[2]) * 12;
  const semisNota   = CROMATICA.indexOf(m2[1]) + Number(m2[2]) * 12;
  const distancia    = ((semisNota - semisTonica) % 12 + 12) % 12;

  let mejorGrado = 1;
  let mejorDif    = Infinity;
  SEMITONOS_ESCALA_MAYOR.forEach((semis, i) => {
    const dif = Math.abs(semis - distancia);
    if (dif < mejorDif) { mejorDif = dif; mejorGrado = i + 1; }
  });

  return String(mejorGrado);
}

// ─── Constructor AUDITIVO consciente de categoría ─────────────────────────────
/**
 * audio(order, def, categoria, variante, points)
 *
 * def = { pregunta, nota, opciones }  (la definición original q1/a1 etc.)
 * categoria = "ritmo" | "melodia" | "armonia"
 * variante  = índice 0/1 dentro de la lección, para alternar subtipos
 */
function audio(order, def, categoria = "melodia", variante = 0, points = 15) {
  if (categoria === "ritmo") {
    const subtipo = variante % 2 === 0 ? "identificar-figura" : "tiempo-fuerte";
    const figuraOpciones = ["Negra", "Corchea", "Blanca", "Semicorchea"];
    const tiempoOpciones = ["Tiempo 1", "Tiempo 2", "Tiempo 3", "Tiempo 4"];

    const patron = subtipo === "identificar-figura"
      ? [
          { figura: "negra", nota: def.nota },
          { figura: "negra", nota: null },
          { figura: "negra", nota: def.nota },
          { figura: "negra", nota: null },
        ]
      : [
          { figura: "negra", nota: def.nota },
          { figura: "negra", nota: def.opciones?.[1] || def.nota },
          { figura: "negra", nota: def.opciones?.[2] || def.nota },
          { figura: "negra", nota: def.opciones?.[3] || def.nota },
        ];

    return {
      tipo: "auditivo",
      pregunta: def.pregunta,
      contenido: {
        categoria: "ritmo",
        subtipo,
        patron,
        bpm: 80,
        opciones: subtipo === "identificar-figura" ? figuraOpciones : tiempoOpciones,
      },
      respuesta_correcta: {
        respuesta: subtipo === "identificar-figura" ? "Negra" : "Tiempo 1",
      },
      puntos: points,
      orden: order,
    };
  }

  if (categoria === "armonia") {
    const subtipo = variante % 2 === 0 ? "intervalo-parejas" : "fundamental-cancion";

    if (subtipo === "intervalo-parejas") {
      // Construimos una 5ª justa real desde la nota objetivo para garantizar
      // que el intervalo etiquetado ("5ª") sea efectivamente correcto.
      const notaBase = def.nota;
      const notaSuperior = transportarNota(def.nota, 7);
      return {
        tipo: "auditivo",
        pregunta: def.pregunta,
        contenido: {
          categoria: "armonia",
          subtipo,
          notas: [notaBase, notaSuperior],
          modo: "armonico",
          opciones: ["2ª", "3ª", "4ª", "5ª", "6ª", "8ª"],
        },
        respuesta_correcta: { respuesta: "5ª" },
        puntos: points,
        orden: order,
      };
    }

    const acorde = construirTriada(def.nota, "mayor");
    return {
      tipo: "auditivo",
      pregunta: def.pregunta,
      contenido: {
        categoria: "armonia",
        subtipo,
        acorde,
        opciones: def.opciones || acorde,
      },
      respuesta_correcta: { respuesta: def.nota },
      puntos: points,
      orden: order,
    };
  }

  // ── categoria === "melodia" (por defecto) ──────────────────────────────────
  const subtipos = ["nota-individual", "direccion-melodica", "grado-tonal", "pedal-tonica", "resolucion-tension"];
  const subtipo = subtipos[variante % subtipos.length];

  if (subtipo === "direccion-melodica") {
    const otra = def.opciones?.find((o) => o !== def.nota) || transportarNota(def.nota, 4);
    const m1 = def.nota.match(/^([A-G]#?)(\d)$/);
    const m2 = otra.match(/^([A-G]#?)(\d)$/);
    const semis1 = m1 ? CROMATICA.indexOf(m1[1]) + Number(m1[2]) * 12 : 0;
    const semis2 = m2 ? CROMATICA.indexOf(m2[1]) + Number(m2[2]) * 12 : 0;
    const direccionReal = semis2 > semis1 ? "Sube" : semis2 < semis1 ? "Baja" : "Se mantiene igual";

    return {
      tipo: "auditivo",
      pregunta: def.pregunta,
      contenido: {
        categoria: "melodia",
        subtipo,
        notas: [def.nota, otra],
        opciones: ["Sube", "Baja", "Se mantiene igual"],
      },
      respuesta_correcta: { respuesta: direccionReal },
      puntos: points,
      orden: order,
    };
  }

  if (subtipo === "grado-tonal") {
    const tonica = "C4";
    return {
      tipo: "auditivo",
      pregunta: def.pregunta,
      contenido: {
        categoria: "melodia",
        subtipo,
        tonica,
        nota: def.nota,
        opciones: ["1", "2", "3", "4", "5", "6", "7"],
      },
      respuesta_correcta: { respuesta: gradoDiatonico(tonica, def.nota), nota: def.nota },
      puntos: points,
      orden: order,
    };
  }

  if (subtipo === "pedal-tonica") {
    return {
      tipo: "auditivo",
      pregunta: def.pregunta,
      contenido: {
        categoria: "melodia",
        subtipo,
        notas: [def.nota, ...(def.opciones || []).slice(0, 3)],
        opciones: def.opciones || [def.nota],
      },
      respuesta_correcta: { respuesta: def.nota },
      puntos: points,
      orden: order,
    };
  }

  if (subtipo === "resolucion-tension") {
    return {
      tipo: "auditivo",
      pregunta: def.pregunta,
      contenido: {
        categoria: "melodia",
        subtipo,
        nota: def.nota,
        opciones: def.opciones || [def.nota],
      },
      respuesta_correcta: { respuesta: def.opciones?.[0] || def.nota },
      puntos: points,
      orden: order,
    };
  }

  return {
    tipo: "auditivo",
    pregunta: def.pregunta,
    contenido: {
      categoria: "melodia",
      subtipo: "nota-individual",
      nota: def.nota,
      opciones: def.opciones || ["C4", "D4", "E4", "G4"],
    },
    respuesta_correcta: { respuesta: def.nota },
    puntos: points,
    orden: order,
  };
}

// ─── Constructor MIDI consciente de categoría ─────────────────────────────────
/**
 * midi(order, def, categoria, variante, points)
 *
 * def = { pregunta, notas }  (la definición original m1/m2)
 */
function midi(order, def, categoria = "melodia", variante = 0, points = 20) {
  if (categoria === "ritmo") {
    const notasUnicas = [...new Set(def.notas)];
    const kickNota  = notasUnicas[0] || "C3";
    const snareNota = notasUnicas[1] || notasUnicas[0] || "D3";

    const kickTiempos  = [];
    const snareTiempos = [];
    def.notas.forEach((n, i) => {
      const tiempo = i + 1;
      if (n === kickNota) kickTiempos.push(tiempo);
      else snareTiempos.push(tiempo);
    });

    return {
      tipo: "midi",
      pregunta: def.pregunta,
      contenido: {
        categoria: "ritmo",
        compas: def.notas.length,
        figuraBase: "negra",
        instrumentos: [
          { id: "kick",  nota: kickNota,  label: "Bombo (Kick)" },
          { id: "snare", nota: snareNota, label: "Caja (Snare)" },
        ],
        tiemposFuertes: [1],
        instrucciones: def.pregunta,
      },
      respuesta_correcta: {
        patron: { kick: kickTiempos, snare: snareTiempos },
      },
      puntos: points,
      orden: order,
    };
  }

  if (categoria === "armonia") {
    const tonica = def.notas[0] || "C4";
    const progresion = variante % 2 === 0 ? ["I", "IV", "V", "I"] : ["III", "VII°", "V", "I"];
    const stack = construirProgresion(tonica, progresion);

    return {
      tipo: "midi",
      pregunta: def.pregunta,
      contenido: {
        categoria: "armonia",
        tonalidad: tonica,
        progresion,
        notasDisponibles: ["C5","B4","A4","G4","F4","E4","D4","C4","B3","G3"],
        instrucciones: `Construye la progresión ${progresion.join(" - ")} en la tonalidad de ${tonica}.`,
      },
      respuesta_correcta: { stack },
      puntos: points + 5,
      orden: order,
    };
  }

  // ── categoria === "melodia" (por defecto) ──────────────────────────────────
  const tecnica = variante % 2 === 0 ? "pregunta-respuesta" : "motivo-variacion";
  const articulaciones = ["legato", "staccato", "tenuto", "pizzicato"];
  const articulacion = tecnica === "motivo-variacion" ? articulaciones[variante % articulaciones.length] : undefined;

  if (tecnica === "pregunta-respuesta" && def.notas.length >= 2) {
    const mitad = Math.ceil(def.notas.length / 2);
    const pista = def.notas.slice(0, mitad).map((note, i) => ({ note, step: i + 1 }));
    const respuestaEsperada = def.notas.slice(mitad);

    return {
      tipo: "midi",
      pregunta: def.pregunta,
      contenido: {
        categoria: "melodia",
        tecnica,
        notasDisponibles: ["C5","B4","A4","G4","F4","E4","D4","C4"],
        columnas: def.notas.length,
        pista,
        instrucciones: `${def.pregunta} La primera parte (pregunta) ya está dada; completa la respuesta.`,
      },
      respuesta_correcta: { notas: respuestaEsperada },
      puntos: points,
      orden: order,
    };
  }

  return {
    tipo: "midi",
    pregunta: def.pregunta,
    contenido: {
      categoria: "melodia",
      tecnica: "motivo-variacion",
      articulacion,
      notasDisponibles: ["C5","B4","A4","G4","F4","E4","D4","C4"],
      columnas: Math.max(def.notas.length, 4),
      pista: [],
      instrucciones: `${def.pregunta}${articulacion ? ` Interpreta con articulación ${articulacion}.` : ""}`,
    },
    respuesta_correcta: { notas: def.notas },
    puntos: points,
    orden: order,
  };
}

/**
 * 7 ejercicios por lección:
 *  1. quiz conceptual (recordar)
 *  2. quiz aplicado   (comprender)
 *  3. auditivo básico (reconocer)            — formato especializado por categoría
 *  4. auditivo comparativo (discriminar)     — formato especializado por categoría, variante alterna
 *  5. MIDI replicar   (aplicar)               — formato especializado por categoría
 *  6. MIDI crear      (crear)                 — formato especializado por categoría, variante alterna
 *  7. quiz de síntesis (evaluar)
 *
 * `categoria` y `variante` permiten que cada lección dentro de un mismo
 * módulo rote entre los distintos subtipos pedagógicos (ver audio()/midi()).
 */
function ejercicios7(def, categoria = "melodia", variante = 0, base = 1) {
  return [
    quiz(base,   def.q1.pregunta, def.q1.opciones, def.q1.respuesta),
    quiz(base+1, def.q2.pregunta, def.q2.opciones, def.q2.respuesta),
    audio(base+2, def.a1, categoria, variante),
    audio(base+3, def.a2, categoria, variante + 1),
    midi(base+4,  def.m1, categoria, variante),
    midi(base+5,  def.m2, categoria, variante + 1),
    quiz(base+6,  def.q3.pregunta, def.q3.opciones, def.q3.respuesta, 15),
  ];
}

function lesson(def, order, categoria = "melodia", variante = 0) {
  return {
    titulo:       def.titulo,
    descripcion:  def.descripcion,
    contenido:    content(def),
    video_url:    def.video_url,
    orden:        order,
    xp_recompensa: def.xp || 70,
    ejercicios:   ejercicios7(def.ejercicios, categoria, variante),
  };
}

function unit(titulo, descripcion, orden, lessons, categoria = "melodia") {
  return {
    titulo,
    descripcion,
    orden,
    lecciones: lessons.map((item, i) => lesson(item, i + 1, categoria, i)),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 1: RITMO
// ═══════════════════════════════════════════════════════════════════════════════

const ritmo_u1 = [
  // ── Lección 1: Pulso ─────────────────────────────────────────────────────
  {
    titulo: "Pulso",
    descripcion: "Siente el latido constante que sostiene toda la música.",
    intro:
      "El pulso es la unidad de tiempo más pequeña y constante en la música. Como el latido del corazón, no se detiene y no acelera: simplemente continúa. Antes de leer figuras o compases, necesitas sentir el pulso en tu cuerpo.",
    sections: [
      { title: "¿Qué es el pulso?", body: "Una sucesión regular de tiempos iguales. Puedes marcarlo con el pie, palmas o un metrónomo.", example: "| 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 |" },
      { title: "Pulso corporal", body: "Antes de tocar cualquier instrumento, siente el pulso: camina al ritmo, aplaude, balancea la cabeza.", example: "Caminar: izq-der-izq-der al mismo tiempo que pasa la música." },
      { title: "Tempo", body: "La velocidad del pulso se llama tempo. Un pulso lento es adagio; uno rápido es allegro.", example: "60 BPM = 1 pulso por segundo." },
    ],
    graphic: "→ · · · → · · · → (cada → es el pulso fuerte)",
    audioExample: "Pulso constante en C4 a 80 BPM.",
    video_url: "https://www.youtube.com/results?search_query=pulso+musical+para+principiantes",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué describe mejor el pulso musical?", opciones: ["Un tiempo constante e igual", "Una nota aguda", "Un acorde mayor", "Un cambio de volumen"], respuesta: "Un tiempo constante e igual" },
      q2: { pregunta: "¿Qué nombre recibe la velocidad del pulso?", opciones: ["Tempo", "Timbre", "Compás", "Dinámica"], respuesta: "Tempo" },
      a1: { pregunta: "Escucha y selecciona la nota del pulso.", nota: "C4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Cuál de estas notas suena más grave?", nota: "C4", opciones: ["C4","C5","E4","G4"] },
      m1: { pregunta: "Coloca cuatro pulsos iguales en el editor (C4).", notas: ["C4","C4","C4","C4"] },
      m2: { pregunta: "Alterna dos notas para simular pulso y contrapulso.", notas: ["C4","G4","C4","G4"] },
      q3: { pregunta: "Un músico que 'pierde el pulso' significa que:", opciones: ["Acelera o frena sin control", "Toca muy suave", "Cambia de instrumento", "Añade más notas"], respuesta: "Acelera o frena sin control" },
    },
  },
  // ── Lección 2: Tempo ─────────────────────────────────────────────────────
  {
    titulo: "Tempo",
    descripcion: "Controla la velocidad de la música con precisión.",
    intro:
      "El tempo determina qué tan rápido o lento fluye la música. Es la primera indicación que aparece en una partitura y afecta todo: el carácter de la pieza, su energía y su dificultad técnica.",
    sections: [
      { title: "BPM", body: "BPM significa 'pulsos por minuto'. 60 BPM = 1 pulso por segundo; 120 BPM = 2 pulsos por segundo.", example: "Canción lenta: 60-80 BPM. Canción rápida: 140-180 BPM." },
      { title: "Términos de tempo", body: "Largo (40-60), Andante (76-108), Allegro (120-156), Presto (168+).", example: "Una marcha fúnebre es Largo; una danza folklórica puede ser Presto." },
      { title: "Metrónomo", body: "Herramienta que marca el pulso a un BPM exacto. Úsalo para practicar con disciplina.", example: "Practica siempre a 60% del tempo objetivo antes de subir velocidad." },
    ],
    graphic: "Largo ←────── Andante ──── Allegro ──── Presto →",
    audioExample: "Pulso a 80 BPM y a 160 BPM comparados.",
    video_url: "https://www.youtube.com/results?search_query=tempo+musical+bpm+explicacion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué significa 120 BPM?", opciones: ["120 pulsos por minuto", "120 notas por compás", "120 compases por hora", "120 decibeles"], respuesta: "120 pulsos por minuto" },
      q2: { pregunta: "¿Qué término describe un tempo muy lento (40-60 BPM)?", opciones: ["Largo", "Allegro", "Presto", "Vivace"], respuesta: "Largo" },
      a1: { pregunta: "Escucha: ¿qué nota suena durante el pulso lento?", nota: "E4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "Identifica la nota del pulso rápido.", nota: "G4", opciones: ["C4","E4","G4","B4"] },
      m1: { pregunta: "Construye 4 pulsos a tempo moderado (E4).", notas: ["E4","E4","E4","E4"] },
      m2: { pregunta: "Alterna un pulso lento y uno rápido con estas notas.", notas: ["C4","C4","E4","E4"] },
      q3: { pregunta: "Al estudiar, ¿qué estrategia de tempo es más efectiva?", opciones: ["Comenzar lento y subir gradualmente", "Siempre al máximo para acostumbrarse", "Cambiar el tempo cada compás", "Ignorar el metrónomo"], respuesta: "Comenzar lento y subir gradualmente" },
    },
  },
  // ── Lección 3: Metrónomo ─────────────────────────────────────────────────
  {
    titulo: "Metrónomo",
    descripcion: "Usa el metrónomo como tu mejor maestro de regularidad.",
    intro:
      "El metrónomo es el árbitro imparcial del tiempo. Practicar con él revela inconsistencias que el oído propio tiende a ignorar. Aprender a 'tocar con click' es una habilidad profesional.",
    sections: [
      { title: "Función del metrónomo", body: "Divide el tiempo en pulsos exactos y audibles. Puede ser mecánico o digital.", example: "Click cada 0.5 s = 120 BPM." },
      { title: "Cómo usarlo", body: "Selecciona el BPM objetivo, escucha dos compases antes de tocar y mantén el pulso aunque cometas errores.", example: "Si el metrónomo suena y tú tocas al mismo tiempo, vas bien." },
      { title: "Errores comunes", body: "Apagarlo cuando se complica, practicar siempre a máxima velocidad, o 'pelear' con el click.", example: "El click siempre tiene razón: tú eres quien se ajusta." },
    ],
    graphic: "Click: ⬤ · · · ⬤ · · · ⬤ (tú tocas encima)",
    audioExample: "Metrónomo a 80 BPM con nota D4 al unísono.",
    video_url: "https://www.youtube.com/results?search_query=como+usar+metronomo+correctamente",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Para qué sirve el metrónomo?", opciones: ["Mantener un pulso constante y exacto", "Afinar el instrumento", "Indicar la dinámica", "Escribir partituras"], respuesta: "Mantener un pulso constante y exacto" },
      q2: { pregunta: "¿Qué debe hacer el músico cuando el click del metrónomo y su nota no coinciden?", opciones: ["Ajustarse al metrónomo", "Apagar el metrónomo", "Acelerar para adelantarse", "Ignorar el problema"], respuesta: "Ajustarse al metrónomo" },
      a1: { pregunta: "Escucha el pulso del metrónomo: ¿qué nota lo acompaña?", nota: "D4", opciones: ["C4","D4","E4","F4"] },
      a2: { pregunta: "Identifica la nota que suena a contratiempo.", nota: "A4", opciones: ["C4","D4","G4","A4"] },
      m1: { pregunta: "Coloca D4 en cada pulso del compás.", notas: ["D4","D4","D4","D4"] },
      m2: { pregunta: "Construye un patrón que alterne pulso y contratiempo.", notas: ["D4","A4","D4","A4"] },
      q3: { pregunta: "Un músico que 'corre' adelante del click debería:", opciones: ["Reducir el tempo y practicar más lento", "Apagar el metrónomo", "Tocar más rápido para adaptarse", "Cambiar de instrumento"], respuesta: "Reducir el tempo y practicar más lento" },
    },
  },
];

const ritmo_u2 = [
  // ── Lección 1: Compás ────────────────────────────────────────────────────
  {
    titulo: "Compás",
    descripcion: "Agrupa pulsos para entender 4/4, 3/4 y 2/4.",
    intro:
      "El compás organiza los pulsos en grupos regulares con un acento natural al inicio. La indicación de compás (numerador/denominador) indica cuántos pulsos hay y qué figura vale uno.",
    sections: [
      { title: "4/4", body: "Cuatro tiempos por compás. El tiempo 1 es el más fuerte.", example: "FUERTE-débil-medio-débil | 1-2-3-4 |" },
      { title: "3/4", body: "Tres tiempos. Primer tiempo fuerte; sensación de vals.", example: "FUERTE-débil-débil | 1-2-3 |" },
      { title: "2/4", body: "Dos tiempos. Muy común en marchas y polkas.", example: "FUERTE-débil | 1-2 |" },
    ],
    graphic: "4/4: ⬤ · ◉ · | ⬤ · ◉ · (⬤=fuerte, ◉=medio, ·=débil)",
    audioExample: "Compás 4/4 con acento en 1.",
    video_url: "https://www.youtube.com/results?search_query=compas+musical+4/4+3/4+explicacion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "En un compás de 4/4, ¿cuántos tiempos hay?", opciones: ["4","3","2","6"], respuesta: "4" },
      q2: { pregunta: "¿Qué compás tiene sensación de vals?", opciones: ["3/4","4/4","2/4","6/8"], respuesta: "3/4" },
      a1: { pregunta: "Escucha el acento fuerte: ¿qué nota lo marca?", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "¿Qué nota suena en el tiempo 3 (débil)?", nota: "E4", opciones: ["C4","D4","E4","G4"] },
      m1: { pregunta: "Construye un compás de 4/4: nota fuerte en 1, pausa en 2-3-4.", notas: ["C4","E4","G4","E4"] },
      m2: { pregunta: "Construye un compás de 3/4: C4-E4-G4.", notas: ["C4","E4","G4"] },
      q3: { pregunta: "Un numerador de 3 en la indicación de compás significa:", opciones: ["3 tiempos por compás", "La negra vale 3", "Hay 3 compases", "Tempo = 3"], respuesta: "3 tiempos por compás" },
    },
  },
  // ── Lección 2: Acentos ───────────────────────────────────────────────────
  {
    titulo: "Acentos rítmicos",
    descripcion: "Reconoce y crea acentos para dar carácter al ritmo.",
    intro:
      "Un acento es el énfasis sobre un tiempo determinado. Los acentos naturales del compás crean jerarquía; los acentos irregulares (sincopas, contratiempos) crean sorpresa y tensión.",
    sections: [
      { title: "Acento natural", body: "En 4/4: tiempo 1 fuerte, 3 medio, 2 y 4 débiles.", example: "F-d-m-d | 1-2-3-4" },
      { title: "Contrapulso (off-beat)", body: "Tocar en los tiempos débiles crea tensión. Muy común en jazz y reggae.", example: "Silencio-2-Silencio-4 (palmas en 2 y 4)." },
      { title: "Síncopa", body: "Un acento anticipado que 'roba' su valor al tiempo siguiente.", example: "1 y(acento)-2-3(acento)-4." },
    ],
    graphic: "F=fuerte d=débil: F-d-M-d en 4/4",
    audioExample: "Acento natural 4/4, luego acento en contratiempo.",
    video_url: "https://www.youtube.com/results?search_query=acentos+ritmo+sincopa+contrapulso",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "En 4/4, ¿cuál es el tiempo más fuerte?", opciones: ["Tiempo 1","Tiempo 2","Tiempo 3","Tiempo 4"], respuesta: "Tiempo 1" },
      q2: { pregunta: "Tocar en los tiempos 2 y 4 (débiles) en 4/4 se llama:", opciones: ["Contrapulso","Síncopa","Compás","Armonía"], respuesta: "Contrapulso" },
      a1: { pregunta: "Escucha: ¿en qué nota cae el acento fuerte?", nota: "C4", opciones: ["C4","E4","G4","B4"] },
      a2: { pregunta: "¿Qué nota suena desplazada (síncopa)?", nota: "D4", opciones: ["C4","D4","E4","G4"] },
      m1: { pregunta: "Coloca acento en tiempo 1 (C5) y nota normal en 3 (G4).", notas: ["C5","G4","C5","G4"] },
      m2: { pregunta: "Crea una síncopa: anticipa el acento antes del tiempo 3.", notas: ["C4","E4","G4","E4"] },
      q3: { pregunta: "Una síncopa genera en el oyente:", opciones: ["Tensión y sorpresa","Reposo total","Mayor volumen","Menor velocidad"], respuesta: "Tensión y sorpresa" },
    },
  },
  // ── Lección 3: Barras de compás ──────────────────────────────────────────
  {
    titulo: "Barras de compás",
    descripcion: "Lee el lenguaje visual que organiza el tiempo en la partitura.",
    intro:
      "Las barras de compás son líneas verticales en el pentagrama que delimitan cada grupo de pulsos. Saber leerlas te permite ubicarte en la partitura y comunicarte con otros músicos.",
    sections: [
      { title: "Barra simple", body: "Separa dos compases consecutivos.", example: "| compás 1 | compás 2 |" },
      { title: "Barra doble", body: "Indica el final de una sección o un cambio de tempo/tonalidad.", example: "|| — aparece entre verso y coro." },
      { title: "Barra de repetición", body: "Indica volver al inicio o a la barra con el punto de repetición.", example: "|: sección A :| → tocar dos veces." },
    ],
    graphic: "| c1 | c2 | c3 || — barra doble = sección",
    audioExample: "Patrón que se repite entre barras de repetición.",
    video_url: "https://www.youtube.com/results?search_query=barras+de+compas+partitura+lectura",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué indica una barra doble en la partitura?", opciones: ["Fin de sección o cambio","Silencio largo","Repetición obligatoria","Cambio de instrumento"], respuesta: "Fin de sección o cambio" },
      q2: { pregunta: "El símbolo |: :| indica:", opciones: ["Repetir la sección","Fin de la obra","Cambio de compás","Silencio total"], respuesta: "Repetir la sección" },
      a1: { pregunta: "Escucha el primer tiempo del compás: ¿qué nota es?", nota: "C4", opciones: ["C4","D4","E4","F4"] },
      a2: { pregunta: "¿Qué nota marca el inicio del segundo compás?", nota: "G4", opciones: ["C4","E4","G4","A4"] },
      m1: { pregunta: "Construye dos compases de 2 notas cada uno.", notas: ["C4","E4","G4","E4"] },
      m2: { pregunta: "Replica el patrón que se repetiría: C4-E4-G4.", notas: ["C4","E4","G4"] },
      q3: { pregunta: "Si un compás de 4/4 tiene tres negras, ¿qué figura completa el compás?", opciones: ["Una negra más","Una blanca","Dos corcheas","Una redonda"], respuesta: "Una negra más" },
    },
  },
];

const ritmo_u3 = [
  // ── Lección 1: Redonda, blanca y negra ──────────────────────────────────
  {
    titulo: "Redonda, blanca y negra",
    descripcion: "Conoce las figuras de mayor duración y sus silencios.",
    intro:
      "Las figuras rítmicas representan la duración de los sonidos. La redonda es la más larga (4 tiempos), la blanca dura 2, y la negra 1. Cada figura tiene su silencio equivalente.",
    sections: [
      { title: "Redonda", body: "Vale 4 tiempos en 4/4. Oval abierta sin plica.", example: "○ — dura todo el compás de 4/4." },
      { title: "Blanca", body: "Vale 2 tiempos. Oval abierta con plica.", example: "𝅗𝅥 — dos blancas llenan un compás de 4/4." },
      { title: "Negra", body: "Vale 1 tiempo. Oval rellena con plica.", example: "♩ — cuatro negras llenan un compás de 4/4." },
    ],
    graphic: "○ = 4 | 𝅗𝅥 𝅗𝅥 = 4 | ♩ ♩ ♩ ♩ = 4",
    audioExample: "Redonda C4, luego dos blancas, luego cuatro negras.",
    video_url: "https://www.youtube.com/results?search_query=figuras+musicales+redonda+blanca+negra",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos tiempos vale una redonda en 4/4?", opciones: ["4","2","1","8"], respuesta: "4" },
      q2: { pregunta: "¿Qué diferencia visual tiene la blanca respecto a la negra?", opciones: ["Oval abierta vs oval rellena","Sin plica vs con plica","Con punto vs sin punto","Línea doble vs línea simple"], respuesta: "Oval abierta vs oval rellena" },
      a1: { pregunta: "Escucha la nota larga: ¿cuál es?", nota: "C4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Qué nota se repite cuatro veces (negras)?", nota: "E4", opciones: ["C4","D4","E4","F4"] },
      m1: { pregunta: "Coloca cuatro negras (C4) en el editor.", notas: ["C4","C4","C4","C4"] },
      m2: { pregunta: "Construye: blanca (E4) + dos negras (G4).", notas: ["E4","E4","G4","G4"] },
      q3: { pregunta: "¿Cuántas blancas caben en un compás de 4/4?", opciones: ["2","4","1","3"], respuesta: "2" },
    },
  },
  // ── Lección 2: Corcheas y semicorcheas ──────────────────────────────────
  {
    titulo: "Corcheas y semicorcheas",
    descripcion: "Divide el tiempo en partes más pequeñas para crear velocidad.",
    intro:
      "Dividir el pulso en partes iguales da acceso a ritmos más ágiles. La corchea vale medio tiempo; la semicorchea, un cuarto. Entender su relación es clave para leer ritmos más complejos.",
    sections: [
      { title: "Corchea", body: "Vale medio tiempo. En pares forman una negra.", example: "♪♪ = ♩ — dos corcheas = una negra." },
      { title: "Semicorchea", body: "Vale un cuarto de tiempo. Cuatro forman una negra.", example: "♬♬♬♬ = ♩" },
      { title: "Grupos de corcheas", body: "Las corcheas se agrupan con una viga horizontal para facilitar la lectura.", example: "♩♫♩ — la viga une las corcheas del mismo grupo." },
    ],
    graphic: "♩ = ♪♪ = ♬♬♬♬",
    audioExample: "Negra, dos corcheas, cuatro semicorcheas (igual duración total).",
    video_url: "https://www.youtube.com/results?search_query=corcheas+semicorcheas+ritmo+musical",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántas corcheas caben en una negra?", opciones: ["2","4","1","8"], respuesta: "2" },
      q2: { pregunta: "¿Cuántas semicorcheas equivalen a una blanca?", opciones: ["8","4","2","16"], respuesta: "8" },
      a1: { pregunta: "Escucha el par de corcheas: ¿qué nota son?", nota: "D4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Cuál nota suena como grupo de semicorcheas?", nota: "G4", opciones: ["C4","E4","G4","B4"] },
      m1: { pregunta: "Construye dos grupos de dos corcheas (D4-D4-D4-D4).", notas: ["D4","D4","D4","D4"] },
      m2: { pregunta: "Alterna una negra y dos corcheas: C4-E4-G4.", notas: ["C4","E4","G4"] },
      q3: { pregunta: "Al leer corcheas agrupadas con viga, ¿qué indica la viga?", opciones: ["Que pertenecen al mismo grupo rítmico","Que son más fuertes","Que duran más","Que son silencios"], respuesta: "Que pertenecen al mismo grupo rítmico" },
    },
  },
  // ── Lección 3: Silencios ─────────────────────────────────────────────────
  {
    titulo: "Silencios",
    descripcion: "Los silencios son música: aprende su valor y su poder expresivo.",
    intro:
      "El silencio no es ausencia de música; es parte del discurso musical. Los silencios tienen los mismos valores que las figuras: el silencio de redonda llena un compás entero de 4/4.",
    sections: [
      { title: "Silencio de redonda", body: "Dura 4 tiempos. Se representa como un rectángulo colgante.", example: "𝄻 — todo el compás de 4/4 en silencio." },
      { title: "Silencio de negra", body: "Dura 1 tiempo. Es el más común en ritmos populares.", example: "𝄽 — un tiempo de pausa." },
      { title: "Expresividad", body: "Un silencio en el lugar correcto puede ser más poderoso que una nota.", example: "La pausa antes del clímax de una canción." },
    ],
    graphic: "𝄻=4t | 𝄼 𝄼=4t | 𝄽 𝄽 𝄽 𝄽=4t",
    audioExample: "Patrón: nota-silencio-nota-silencio en C4.",
    video_url: "https://www.youtube.com/results?search_query=silencios+musicales+valores+ritmo",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos tiempos dura el silencio de redonda?", opciones: ["4","2","1","3"], respuesta: "4" },
      q2: { pregunta: "¿Por qué los silencios son importantes en la música?", opciones: ["Dan forma al fraseo y tensión expresiva","Son errores que se deben evitar","Solo aparecen al final","Indican repetición"], respuesta: "Dan forma al fraseo y tensión expresiva" },
      a1: { pregunta: "Escucha: ¿qué nota viene DESPUÉS del silencio?", nota: "C4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "Identifica la nota que suena tras la pausa larga.", nota: "G4", opciones: ["C4","E4","G4","A4"] },
      m1: { pregunta: "Coloca el patrón: C4 en tiempos 1 y 3 (deja vacíos 2 y 4).", notas: ["C4","C4"] },
      m2: { pregunta: "Crea: nota-silencio-nota-nota. Usa E4.", notas: ["E4","E4","E4"] },
      q3: { pregunta: "Un silencio de negra dentro de un compás de 4/4 ocupa:", opciones: ["1 tiempo","2 tiempos","Todo el compás","Medio tiempo"], respuesta: "1 tiempo" },
    },
  },
];

const ritmo_u4 = [
  // ── Lección 1: Lectura rítmica ───────────────────────────────────────────
  {
    titulo: "Lectura rítmica",
    descripcion: "Convierte las figuras escritas en sonido real con el metrónomo.",
    intro:
      "Leer ritmo es traducir los símbolos del papel a movimiento físico: vocalizando, aplaudiendo o tocando. La clave es mantener el pulso mientras asocias cada figura a su duración.",
    sections: [
      { title: "Método de sílabas", body: "Usa sílabas para representar figuras: 'ta'=negra, 'ti-ti'=dos corcheas, 'ta-a'=blanca.", example: "| ta ti-ti ta ta | → ♩♪♪♩♩" },
      { title: "Lectura a primera vista", body: "Mira el ritmo completo antes de tocar. Identifica el compás, el tempo y las figuras.", example: "Escanea dos compases, luego toca." },
      { title: "Subdivisión", body: "Contar subdivisiones internas ayuda con ritmos complejos.", example: "1-y-2-y-3-y-4-y (la 'y' = la corchea intermedia)." },
    ],
    graphic: "♩=ta | ♪♪=ti-ti | 𝅗𝅥=ta-a | ○=ta-a-a-a",
    audioExample: "ta ti-ti ta-a en C4 a 80 BPM.",
    video_url: "https://www.youtube.com/results?search_query=lectura+ritmica+solfeo+silabas",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Qué sílaba corresponde a una negra en lectura rítmica?", opciones: ["ta","ti-ti","ta-a","ta-a-a-a"], respuesta: "ta" },
      q2: { pregunta: "Antes de tocar a primera vista, ¿qué se debe hacer?", opciones: ["Escanear el ritmo completo","Tocar inmediatamente","Ignorar el compás","Subir el tempo"], respuesta: "Escanear el ritmo completo" },
      a1: { pregunta: "Escucha el patrón 'ta ti-ti': ¿qué nota es la negra?", nota: "C4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Qué nota forman las corcheas del patrón?", nota: "E4", opciones: ["C4","D4","E4","G4"] },
      m1: { pregunta: "Construye: ta ti-ti ta ta (C4 para negras, E4-G4 para corcheas).", notas: ["C4","E4","G4","C4","C4"] },
      m2: { pregunta: "Escribe: ta-a ta-a (dos blancas en D4).", notas: ["D4","D4","D4","D4"] },
      q3: { pregunta: "La subdivisión '1-y-2-y' indica:", opciones: ["Dividir cada tiempo en dos corcheas","Solo corcheas sin pulso","Aumentar el tempo","Cambiar de compás"], respuesta: "Dividir cada tiempo en dos corcheas" },
    },
  },
  // ── Lección 2: Dictado rítmico ───────────────────────────────────────────
  {
    titulo: "Dictado rítmico",
    descripcion: "Escucha un patrón y transcríbelo: entrena el oído y la memoria.",
    intro:
      "El dictado rítmico desarrolla la memoria auditiva. Al escuchar un patrón sin verlo escrito, el cerebro debe reconocer duraciones, acentos y silencios, y representarlos en papel.",
    sections: [
      { title: "Proceso", body: "Escucha el patrón completo, identifica el compás, canta el ritmo en sílabas y luego escríbelo.", example: "Escucha → ta ti-ti ta ta → ♩♪♪♩♩." },
      { title: "Estrategia", body: "Identifica primero los acentos fuertes: marcan el inicio de cada compás.", example: "El acento del primer tiempo es tu ancla." },
      { title: "Práctica gradual", body: "Comienza con patrones de una figura, luego mezcla dos y tres figuras.", example: "Semana 1: solo negras. Semana 2: negras y corcheas." },
    ],
    graphic: "Escucha → Canta → Escribe → Compara",
    audioExample: "Dictado: ta ti-ti ta-a (¿lo puedes escribir antes de ver la respuesta?).",
    video_url: "https://www.youtube.com/results?search_query=dictado+ritmico+ejercicios+principiantes",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Cuál es el primer paso en el dictado rítmico?", opciones: ["Escuchar el patrón completo","Escribirlo inmediatamente","Buscar el tempo exacto","Ignorar los silencios"], respuesta: "Escuchar el patrón completo" },
      q2: { pregunta: "¿Para qué sirve identificar el acento fuerte al dictar?", opciones: ["Marca el inicio de cada compás","Indica el fin de la obra","Señala las notas más agudas","Define el tempo"], respuesta: "Marca el inicio de cada compás" },
      a1: { pregunta: "Escucha y reconoce la primera nota del dictado.", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "¿Cuál nota cierra el patrón del dictado?", nota: "G4", opciones: ["C4","D4","G4","B4"] },
      m1: { pregunta: "Reconstruye el patrón escuchado: C4-E4-E4-G4.", notas: ["C4","E4","E4","G4"] },
      m2: { pregunta: "Escribe el dictado: dos negras y una blanca en F4.", notas: ["F4","F4","F4","F4"] },
      q3: { pregunta: "Para mejorar en dictado rítmico, ¿qué se recomienda?", opciones: ["Practicar con patrones graduales de menor a mayor complejidad","Comenzar directamente con ritmos complejos","Escuchar solo una vez y escribir","Ignorar el compás"], respuesta: "Practicar con patrones graduales de menor a mayor complejidad" },
    },
  },
  // ── Lección 3: Creación de patrones ─────────────────────────────────────
  {
    titulo: "Creación de patrones rítmicos",
    descripcion: "Compón tus propios ritmos combinando todo lo aprendido.",
    intro:
      "Crear ritmos propios consolida todos los conceptos anteriores. Al componer un patrón, aplicas el compás, las figuras, los silencios y el tempo de forma integrada.",
    sections: [
      { title: "Principio de variación", body: "Toma un patrón base y varíalo: cambia una figura, añade un silencio o desplaza el acento.", example: "Base: ♩♩♩♩ → Variación: ♩♪♪♩𝄽♩" },
      { title: "Motivo rítmico", body: "Un motivo de 2-4 figuras que se repite crea cohesión.", example: "♩♪♪ repetido tres veces = frase rítmica." },
      { title: "Contraste", body: "Alternaar secciones densas y ligeras da forma a la música.", example: "Compás lleno → compás con silencios → compás lleno." },
    ],
    graphic: "Motivo → Repetición → Variación → Contraste",
    audioExample: "Patrón: ta ti-ti ta (silencio) | repetido dos veces.",
    video_url: "https://www.youtube.com/results?search_query=creacion+patrones+ritmicos+composicion",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Qué es un motivo rítmico?", opciones: ["Un patrón corto que se repite","Una figura sola","Un compás entero","El tempo de la obra"], respuesta: "Un patrón corto que se repite" },
      q2: { pregunta: "¿Cómo se crea variación en un patrón rítmico?", opciones: ["Cambiando una figura o añadiendo un silencio","Repitiendo exactamente igual siempre","Aumentando el volumen","Cambiando de instrumento"], respuesta: "Cambiando una figura o añadiendo un silencio" },
      a1: { pregunta: "Escucha el motivo rítmico: ¿qué nota lo compone?", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "¿Qué nota introduce el contraste en el patrón?", nota: "A4", opciones: ["C4","D4","G4","A4"] },
      m1: { pregunta: "Crea un motivo: C4-E4-G4 y repítelo.", notas: ["C4","E4","G4","C4","E4","G4"] },
      m2: { pregunta: "Varía el motivo: C4-E4 (silencio) C4-G4.", notas: ["C4","E4","C4","G4"] },
      q3: { pregunta: "El contraste en un patrón rítmico (denso vs. ligero) sirve para:", opciones: ["Dar forma y dirección musical","Evitar el pulso","Reemplazar el compás","Eliminar silencios"], respuesta: "Dar forma y dirección musical" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2: MELODÍA
// ═══════════════════════════════════════════════════════════════════════════════

const melodia_u1 = [
  {
    titulo: "Notas musicales",
    descripcion: "Aprende los nombres de las siete notas y su ubicación en el teclado.",
    intro: "Las siete notas (Do-Re-Mi-Fa-Sol-La-Si / C-D-E-F-G-A-B) son los bloques con los que se construye toda la música occidental. Conocerlas de los dos sistemas (latino y anglosajón) te permite comunicarte con cualquier músico.",
    sections: [
      { title: "Las siete notas", body: "Do-Re-Mi-Fa-Sol-La-Si en sistema latino; C-D-E-F-G-A-B en anglosajón.", example: "Do=C, Re=D, Mi=E, Fa=F, Sol=G, La=A, Si=B." },
      { title: "En el teclado", body: "Las teclas blancas corresponden a las notas naturales. Las teclas negras son alteraciones.", example: "C D E F G A B son todas teclas blancas." },
      { title: "Octavas", body: "Las notas se repiten en diferentes alturas llamadas octavas. C4 es el Do central.", example: "C3-C4-C5 son el mismo nombre en distintas octavas." },
    ],
    graphic: "C D E F G A B C (una octava completa)",
    audioExample: "Escala C mayor ascendente.",
    video_url: "https://www.youtube.com/results?search_query=notas+musicales+do+re+mi+principiantes",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es el equivalente anglosajón de 'Sol'?", opciones: ["G","A","F","E"], respuesta: "G" },
      q2: { pregunta: "¿Qué nota es C4?", opciones: ["El Do central del teclado","La nota más grave","La nota más aguda","Re en sistema latino"], respuesta: "El Do central del teclado" },
      a1: { pregunta: "Escucha y selecciona la nota.", nota: "C4", opciones: ["C4","D4","E4","F4"] },
      a2: { pregunta: "¿Cuál de estas notas es más aguda?", nota: "E4", opciones: ["C4","D4","E4","F4"] },
      m1: { pregunta: "Coloca C4-D4-E4 en el editor.", notas: ["C4","D4","E4"] },
      m2: { pregunta: "Escribe C4-E4-G4 (Do-Mi-Sol).", notas: ["C4","E4","G4"] },
      q3: { pregunta: "¿Por qué es útil conocer tanto el sistema latino como el anglosajón?", opciones: ["Para comunicarse con músicos de distintas tradiciones","Solo para leer partituras antiguas","No tiene utilidad práctica","Solo lo usan los pianistas"], respuesta: "Para comunicarse con músicos de distintas tradiciones" },
    },
  },
  {
    titulo: "Sistema anglosajón",
    descripcion: "Domina la notación en letras que usan los músicos profesionales.",
    intro: "El sistema anglosajón (A-B-C-D-E-F-G) es el estándar internacional en partituras, tablaturas y software musical. Añade sostenidos (#) y bemoles (b) para las alteraciones.",
    sections: [
      { title: "Letras y alteraciones", body: "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B", example: "C# = Do sostenido = mismo sonido que Db (Re bemol)." },
      { title: "Enarmonía", body: "Dos notas con distinto nombre pero el mismo sonido (C# = Db).", example: "En el teclado, la misma tecla negra puede llamarse C# o Db." },
      { title: "Uso en software", body: "DAW, MIDI y apps de notación usan sistema anglosajón.", example: "En TeoLearn, C4=Do central; A4=La de 440 Hz." },
    ],
    graphic: "C - C# - D - D# - E - F - F# - G - G# - A - A# - B",
    audioExample: "C4, C#4, D4 en secuencia.",
    video_url: "https://www.youtube.com/results?search_query=sistema+anglosajón+notas+musicales",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué nombre reciben las notas con el mismo sonido pero distinto nombre?", opciones: ["Enarmónicas","Diatónicas","Cromáticas","Tónicas"], respuesta: "Enarmónicas" },
      q2: { pregunta: "¿Cuántas notas hay en una octava cromática (incluyendo sostenidos)?", opciones: ["12","7","8","5"], respuesta: "12" },
      a1: { pregunta: "Escucha: ¿es C4 o C#4?", nota: "C4", opciones: ["C4","C#4","D4","Db4"] },
      a2: { pregunta: "Identifica la nota alterada.", nota: "D4", opciones: ["C4","D4","E4","F4"] },
      m1: { pregunta: "Escribe C4-D4-E4-G4.", notas: ["C4","D4","E4","G4"] },
      m2: { pregunta: "Construye C4-E4-G4-B4 (tétrada de C mayor).", notas: ["C4","E4","G4","B4"] },
      q3: { pregunta: "C# y Db son enarmónicas porque:", opciones: ["Suenan igual pero se escriben diferente","Son la misma nota escrita igual","Tienen distinta altura","Son de octavas distintas"], respuesta: "Suenan igual pero se escriben diferente" },
    },
  },
  {
    titulo: "Octavas",
    descripcion: "Entiende cómo la misma nota cambia de registro según la octava.",
    intro: "Una octava es la distancia entre dos notas con el mismo nombre: la frecuencia se duplica exactamente. El sonido más 'brillante' o más 'profundo' de una misma nota es cuestión de registro (octava).",
    sections: [
      { title: "¿Qué es una octava?", body: "La nota C5 vibra al doble de frecuencia que C4.", example: "C4 = 261.6 Hz; C5 = 523.2 Hz." },
      { title: "Registros", body: "Bajo (C2-C3), Medio (C3-C5), Agudo (C5-C7).", example: "La voz de bajo canta en C2-C3; el flautín en C6-C7." },
      { title: "Identificación auditiva", body: "La diferencia entre octavas es inconfundible: mismo nombre, doble altura.", example: "Canta 'Do' muy grave y luego muy agudo: eso es una octava." },
    ],
    graphic: "C2 - C3 - C4(central) - C5 - C6",
    audioExample: "C4 luego C5: escucha la octava.",
    video_url: "https://www.youtube.com/results?search_query=octavas+musicales+frecuencia+registro",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué sucede con la frecuencia al subir una octava?", opciones: ["Se duplica","Se triplica","Se mantiene igual","Se reduce a la mitad"], respuesta: "Se duplica" },
      q2: { pregunta: "C4 se conoce como:", opciones: ["Do central","Do grave","La de 440 Hz","El si bemol"], respuesta: "Do central" },
      a1: { pregunta: "¿Es C4 o C5 la nota que escuchas?", nota: "C4", opciones: ["C4","C5","G4","G5"] },
      a2: { pregunta: "Escucha la nota más aguda: ¿cuál es?", nota: "C5", opciones: ["C4","C5","G4","A4"] },
      m1: { pregunta: "Coloca C4 y C5 en el editor.", notas: ["C4","C5"] },
      m2: { pregunta: "Construye: C4-E4-G4-C5 (arpegio de Do mayor).", notas: ["C4","E4","G4","C5"] },
      q3: { pregunta: "Un cantante de bajo y uno de soprano cantando 'Do' al mismo tiempo producen:", opciones: ["Un intervalo de octava","El mismo sonido exacto","Un acorde de dos notas","Disonancia"],  respuesta: "Un intervalo de octava" },
    },
  },
];

const melodia_u2 = [
  {
    titulo: "Pentagrama",
    descripcion: "Lee la herramienta visual que lleva la música al papel.",
    intro: "El pentagrama son las cinco líneas horizontales donde se escribe la música. La posición de las notas (línea o espacio) y la clave determinan el nombre de cada nota.",
    sections: [
      { title: "Las cinco líneas", body: "Se numeran de abajo (1) hacia arriba (5). Las notas también ocupan los cuatro espacios.", example: "Línea 1: Mi (E4) | Espacio 1: Fa (F4) | Línea 2: Sol (G4)..." },
      { title: "Líneas adicionales", body: "Para notas fuera del rango del pentagrama se añaden líneas cortas.", example: "Do central (C4) está debajo de la línea 1 en clave de Sol." },
      { title: "Lectura progresiva", body: "Memoriza las notas de las líneas primero: Mi-Sol-Si-Re-Fa (Every Good Boy Does Fine).", example: "Líneas en clave de Sol: E-G-B-D-F." },
    ],
    graphic: "─── F ─── D ─── B ─── G ─── E ─── (de arriba a abajo)",
    audioExample: "Mi-Sol-Si-Re-Fa en clave de Sol (E4-G4-B4-D5-F5).",
    video_url: "https://www.youtube.com/results?search_query=pentagrama+lectura+notas+clave+sol",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántas líneas tiene el pentagrama?", opciones: ["5","4","6","7"], respuesta: "5" },
      q2: { pregunta: "Las notas de las líneas en clave de Sol son:", opciones: ["E-G-B-D-F","C-D-E-F-G","A-B-C-D-E","F-A-C-E-G"], respuesta: "E-G-B-D-F" },
      a1: { pregunta: "Escucha la nota de la primera línea (clave Sol).", nota: "E4", opciones: ["C4","D4","E4","F4"] },
      a2: { pregunta: "¿Qué nota ocupa el primer espacio?", nota: "F4", opciones: ["E4","F4","G4","A4"] },
      m1: { pregunta: "Escribe las notas de las líneas: E4-G4-B4.", notas: ["E4","G4","B4"] },
      m2: { pregunta: "Construye: C4-E4-G4-C5 leyendo el pentagrama imaginario.", notas: ["C4","E4","G4","C5"] },
      q3: { pregunta: "¿Para qué sirven las líneas adicionales en el pentagrama?", opciones: ["Notar notas fuera del rango normal","Indicar el tempo","Separar los compases","Marcar el acento"], respuesta: "Notar notas fuera del rango normal" },
    },
  },
  {
    titulo: "Clave de Sol",
    descripcion: "La clave más usada en música aguda: piano, guitarra, voz.",
    intro: "La clave de Sol (𝄞) se coloca al inicio del pentagrama y establece que la segunda línea es Sol (G4). Todo lo demás se deriva de esta referencia.",
    sections: [
      { title: "La clave", body: "El símbolo 𝄞 rodea la segunda línea, que queda fija como G4.", example: "2ª línea = G4 → por encima: A4 B4 C5..." },
      { title: "Notas del pentagrama", body: "E4-F4-G4-A4-B4-C5-D5-E5-F5 (de línea 1 a línea 5 más espacios).", example: "Espacio 2 = A4; Línea 3 = B4." },
      { title: "Uso", body: "Instrumentos de registro medio-agudo: piano (mano derecha), guitarra, violín, voz.", example: "La melodía de una canción pop se escribe en clave de Sol." },
    ],
    graphic: "𝄞 E F G A B C D E F (líneas 1→5 y espacios)",
    audioExample: "Escala C4-G4 en clave de Sol.",
    video_url: "https://www.youtube.com/results?search_query=clave+de+sol+lectura+pentagrama",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué línea del pentagrama fija la clave de Sol?", opciones: ["Segunda","Primera","Tercera","Cuarta"], respuesta: "Segunda" },
      q2: { pregunta: "¿En qué línea se sitúa G4 en clave de Sol?", opciones: ["2ª línea","1ª línea","3ª línea","4ª línea"], respuesta: "2ª línea" },
      a1: { pregunta: "Escucha la nota de referencia de la clave de Sol.", nota: "G4", opciones: ["E4","F4","G4","A4"] },
      a2: { pregunta: "¿Qué nota suena una línea encima de G4?", nota: "A4", opciones: ["F4","G4","A4","B4"] },
      m1: { pregunta: "Escribe G4-A4-B4 (líneas 2, espacio 2, línea 3).", notas: ["G4","A4","B4"] },
      m2: { pregunta: "Construye la escala C4-D4-E4-F4-G4.", notas: ["C4","D4","E4","F4","G4"] },
      q3: { pregunta: "¿Qué tipo de instrumento usa principalmente la clave de Sol?", opciones: ["Instrumentos de registro agudo como violín o trompeta","Solo percusión","Solo bajo eléctrico","Solo voz grave"], respuesta: "Instrumentos de registro agudo como violín o trompeta" },
    },
  },
  {
    titulo: "Clave de Fa",
    descripcion: "La clave del registro grave: bajo, cello, mano izquierda del piano.",
    intro: "La clave de Fa (𝄢) establece que la cuarta línea es F3 (Fa 3). Es la clave del bajo y de la mano izquierda del piano. Comprender ambas claves te da acceso a toda la partitura.",
    sections: [
      { title: "La clave", body: "El símbolo 𝄢 indica que la 4ª línea = F3.", example: "4ª línea = F3 → por debajo: E3 D3 C3..." },
      { title: "Notas del pentagrama", body: "G2-A2-B2-C3-D3-E3-F3-G3-A3 (de línea 1 a espacio 4).", example: "Do central (C4) está UNA LÍNEA ADICIONAL por encima de la 5ª línea." },
      { title: "Gran pentagrama", body: "Piano combina clave de Sol (mano derecha) y clave de Fa (mano izquierda).", example: "Mano derecha: clave de Sol. Mano izquierda: clave de Fa." },
    ],
    graphic: "𝄢 G A B C D E F G A (líneas 1→5 y espacios)",
    audioExample: "C3-G3 en clave de Fa.",
    video_url: "https://www.youtube.com/results?search_query=clave+de+fa+lectura+bajo+piano",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué línea del pentagrama fija la clave de Fa?", opciones: ["Cuarta","Segunda","Tercera","Primera"], respuesta: "Cuarta" },
      q2: { pregunta: "¿Qué instrumento usa principalmente la clave de Fa?", opciones: ["Bajo eléctrico","Violín","Flauta","Trompeta"], respuesta: "Bajo eléctrico" },
      a1: { pregunta: "Escucha la nota de referencia de la clave de Fa.", nota: "C4", opciones: ["C3","C4","G3","G4"] },
      a2: { pregunta: "¿Qué nota grave suena en el bajo?", nota: "C4", opciones: ["C3","C4","E3","G3"] },
      m1: { pregunta: "Escribe C4-G4 (las notas más comunes del bajo en TeoLearn).", notas: ["C4","G4"] },
      m2: { pregunta: "Construye el bajo: C4-E4-G4-C5.", notas: ["C4","E4","G4","C5"] },
      q3: { pregunta: "En el gran pentagrama del piano, la clave de Fa corresponde a:", opciones: ["La mano izquierda","La mano derecha","Ambas manos","La melodía principal"], respuesta: "La mano izquierda" },
    },
  },
];

const melodia_u3 = [
  {
    titulo: "Intervalos",
    descripcion: "Mide la distancia entre notas: el vocabulario de la melodía.",
    intro: "Un intervalo es la distancia en altura entre dos notas. Es el vocabulario con el que analizamos y componemos melodías: una segunda es un paso, una quinta es un salto amplio.",
    sections: [
      { title: "Tipos de intervalo", body: "Unísono (0), segunda (2), tercera (3), cuarta (4), quinta (5), octava (8).", example: "C→D = 2ª; C→E = 3ª; C→G = 5ª." },
      { title: "Movimiento por grado", body: "Las melodías que se mueven de nota en nota (segundas) son más fáciles de cantar.", example: "C-D-E-F-G es movimiento por grado." },
      { title: "Saltos", body: "Los saltos (3ª o más) añaden energía y tensión a la melodía.", example: "C-E-G-C es una melodía con saltos." },
    ],
    graphic: "C D E F G A B C | 2ª 3ª 4ª 5ª 6ª 7ª 8ª",
    audioExample: "2ª (C-D), 3ª (C-E), 5ª (C-G) comparadas.",
    video_url: "https://www.youtube.com/results?search_query=intervalos+musicales+teoria+practica",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué intervalo hay entre C y G?", opciones: ["5ª (quinta)","3ª (tercera)","4ª (cuarta)","6ª (sexta)"], respuesta: "5ª (quinta)" },
      q2: { pregunta: "¿Qué tipo de movimiento melódico usa solo segundas?", opciones: ["Movimiento por grado","Salto de octava","Movimiento cromático","Arpeggio"], respuesta: "Movimiento por grado" },
      a1: { pregunta: "Escucha el intervalo: ¿es una 2ª o una 5ª?", nota: "D4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Qué nota forma una 3ª con C4?", nota: "E4", opciones: ["D4","E4","F4","G4"] },
      m1: { pregunta: "Construye el intervalo de 5ª: C4-G4.", notas: ["C4","G4"] },
      m2: { pregunta: "Escribe una melodía por grado: C4-D4-E4-F4.", notas: ["C4","D4","E4","F4"] },
      q3: { pregunta: "Un salto de octava en una melodía produce:", opciones: ["Energía y contraste dramático","Reposo total","Reducción del tempo","Acorde mayor"], respuesta: "Energía y contraste dramático" },
    },
  },
  {
    titulo: "Escala mayor",
    descripcion: "La escala fundamental de la música occidental: su construcción y sonido.",
    intro: "La escala mayor es la columna vertebral de la armonía tonal. Su fórmula de tonos y semitonos (T-T-S-T-T-T-S) es el molde del que nacen acordes, melodías y progresiones.",
    sections: [
      { title: "Fórmula", body: "Tono-Tono-Semitono-Tono-Tono-Tono-Semitono.", example: "C mayor: C-D-E-F-G-A-B-C (sin alteraciones)." },
      { title: "Grados", body: "Cada nota de la escala tiene un número (1-7) y un nombre funcional.", example: "1=Tónica, 5=Dominante, 7=Sensible." },
      { title: "Carácter", body: "La escala mayor se asocia con estabilidad, alegría y claridad.", example: "La canción 'Happy Birthday' está en escala mayor." },
    ],
    graphic: "C-D-E-F-G-A-B-C | T T S T T T S",
    audioExample: "Escala de C mayor ascendente y descendente.",
    video_url: "https://www.youtube.com/results?search_query=escala+mayor+teoria+construccion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es la fórmula de la escala mayor?", opciones: ["T-T-S-T-T-T-S","T-S-T-T-S-T-T","S-T-T-T-S-T-T","T-T-T-S-T-T-S"], respuesta: "T-T-S-T-T-T-S" },
      q2: { pregunta: "¿Qué grado de la escala mayor se llama 'Dominante'?", opciones: ["5to","3er","7mo","1ro"], respuesta: "5to" },
      a1: { pregunta: "Escucha la tónica de la escala mayor.", nota: "C4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Cuál es el 5to grado (Dominante) de C mayor?", nota: "G4", opciones: ["E4","F4","G4","A4"] },
      m1: { pregunta: "Escribe los primeros 4 grados de C mayor: C4-D4-E4-F4.", notas: ["C4","D4","E4","F4"] },
      m2: { pregunta: "Completa la escala: E4-F4-G4-A4-B4-C5.", notas: ["E4","F4","G4","A4","B4","C5"] },
      q3: { pregunta: "¿Por qué el 7mo grado se llama 'Sensible'?", opciones: ["Tiende a resolver hacia la tónica","Es el más grave","Siempre es bemol","Define el modo"], respuesta: "Tiende a resolver hacia la tónica" },
    },
  },
  {
    titulo: "Escala menor",
    descripcion: "El modo que añade tensión, melancolía y color a la música.",
    intro: "La escala menor natural cambia el color sonoro respecto a la mayor: la 3ª, 6ª y 7ª son un semitono más bajas. Este pequeño cambio transforma completamente el carácter musical.",
    sections: [
      { title: "Fórmula menor natural", body: "T-S-T-T-S-T-T.", example: "A menor: A-B-C-D-E-F-G-A (sin alteraciones)." },
      { title: "Relativa menor", body: "Cada escala mayor tiene una escala menor relativa que usa las mismas notas.", example: "C mayor y A menor comparten C-D-E-F-G-A-B." },
      { title: "Carácter", body: "Se asocia con melancolía, tensión o misterio, aunque no siempre es 'triste'.", example: "El 'Vals de las flores' de Tchaikovsky es en menor." },
    ],
    graphic: "A-B-C-D-E-F-G-A | T S T T S T T",
    audioExample: "Escala de A menor natural ascendente.",
    video_url: "https://www.youtube.com/results?search_query=escala+menor+natural+teoria",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es la relativa menor de C mayor?", opciones: ["A menor","E menor","D menor","G menor"], respuesta: "A menor" },
      q2: { pregunta: "¿Qué grados de la escala menor son un semitono más bajos que en la mayor?", opciones: ["3ro, 6to y 7mo","1ro y 5to","2do y 4to","Solo el 3ro"], respuesta: "3ro, 6to y 7mo" },
      a1: { pregunta: "Escucha la tónica de A menor.", nota: "A4", opciones: ["G4","A4","B4","C5"] },
      a2: { pregunta: "¿Cuál es la 3ª de A menor?", nota: "C5", opciones: ["B4","C5","D5","E5"] },
      m1: { pregunta: "Escribe A4-B4-C5-D5 (inicio de A menor).", notas: ["A4","B4","C5","D5"] },
      m2: { pregunta: "Construye: E4-F4-G4-A4 (mitad de la escala).", notas: ["E4","F4","G4","A4"] },
      q3: { pregunta: "Escala mayor y su relativa menor:", opciones: ["Usan las mismas notas pero empiezan diferente","Son completamente distintas","Solo difieren en el tempo","No tienen relación"], respuesta: "Usan las mismas notas pero empiezan diferente" },
    },
  },
];

const melodia_u4 = [
  {
    titulo: "Dictado melódico",
    descripcion: "Escucha una melodía y transcribe sus notas: entrena el oído musical.",
    intro: "El dictado melódico combina la escucha activa con el conocimiento de notas. Al transcribir lo que escuchas, consolidas los intervalos, las escalas y la ubicación de notas en el pentagrama.",
    sections: [
      { title: "Proceso", body: "Escucha completo → identifica la tónica → canta el inicio → identifica intervalos → escribe nota por nota.", example: "Melodía: C-D-E-G → escucho Do, paso, tercera, salto." },
      { title: "Intervalos como herramienta", body: "Reconocer si el movimiento es de 2ª, 3ª o 5ª acelera la transcripción.", example: "Subida pequeña = 2ª; subida grande = 5ª." },
      { title: "Revisión", body: "Canta la melodía escrita y compara con el original: ¿coincide?", example: "Canta lo que escribiste: si no suena igual, busca el error." },
    ],
    graphic: "Escuchar → Cantar → Comparar intervalos → Escribir → Revisar",
    audioExample: "Melodía C4-D4-E4-G4 para dictar.",
    video_url: "https://www.youtube.com/results?search_query=dictado+melodico+ejercicios+solfeo",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Cuál es el primer paso del dictado melódico?", opciones: ["Escuchar la melodía completa","Escribir inmediatamente","Identificar el tempo","Contar los compases"], respuesta: "Escuchar la melodía completa" },
      q2: { pregunta: "¿Qué herramienta facilita la transcripción de una melodía?", opciones: ["Reconocer los intervalos entre notas","Solo memorizar alturas","Ignorar el ritmo","Escribir sílabas"], respuesta: "Reconocer los intervalos entre notas" },
      a1: { pregunta: "Escucha la primera nota de la melodía.", nota: "C4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "¿Qué nota cierra el fragmento melódico?", nota: "G4", opciones: ["E4","F4","G4","A4"] },
      m1: { pregunta: "Reconstruye el dictado: C4-D4-E4-G4.", notas: ["C4","D4","E4","G4"] },
      m2: { pregunta: "Transcribe: E4-D4-C4 (melodía descendente).", notas: ["E4","D4","C4"] },
      q3: { pregunta: "Después de escribir el dictado, la mejor forma de verificarlo es:", opciones: ["Cantarlo y comparar con el original","Contarlo en silencio","Preguntarle a alguien","Solo revisarlo visualmente"], respuesta: "Cantarlo y comparar con el original" },
    },
  },
  {
    titulo: "Reconocimiento de intervalos",
    descripcion: "Identifica de oído si dos notas están cerca o lejos.",
    intro: "Reconocer intervalos de oído es una de las habilidades más poderosas del músico. Permite leer a primera vista, improvisar y componer con intención, sin depender de la escritura.",
    sections: [
      { title: "Asociación con canciones conocidas", body: "Cada intervalo tiene una canción emblemática que lo ilustra.", example: "2ª mayor = inicio de 'Happy Birthday'; 5ª justa = intro de 'Star Wars'." },
      { title: "Ascendente vs descendente", body: "El mismo intervalo suena diferente subiendo o bajando.", example: "3ª mayor subiendo: C-E (alegre). 3ª mayor bajando: C-A (más calmado)." },
      { title: "Práctica diaria", body: "Canta un intervalo desde C cada día. Empieza por 2ª, luego 3ª, luego 5ª.", example: "C→D (2ª), C→E (3ª), C→G (5ª), C→C (8ª)." },
    ],
    graphic: "2ª=paso | 3ª=salto pequeño | 5ª=salto amplio | 8ª=octava",
    audioExample: "2ª, 3ª y 5ª ascendentes desde C4.",
    video_url: "https://www.youtube.com/results?search_query=reconocimiento+intervalos+oído+musical",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Qué intervalo hay en el inicio de 'Star Wars'?", opciones: ["5ª justa","2ª mayor","3ª menor","7ª mayor"], respuesta: "5ª justa" },
      q2: { pregunta: "¿En qué difiere un intervalo ascendente de uno descendente?", opciones: ["La dirección del movimiento melódico","La duración de las notas","La clave musical","El tempo"], respuesta: "La dirección del movimiento melódico" },
      a1: { pregunta: "Escucha: ¿es una 2ª o una 5ª?", nota: "G4", opciones: ["C4","D4","E4","G4"] },
      a2: { pregunta: "Identifica la nota que forma una 3ª con C4.", nota: "E4", opciones: ["D4","E4","F4","G4"] },
      m1: { pregunta: "Construye el intervalo de 5ª justa: C4-G4.", notas: ["C4","G4"] },
      m2: { pregunta: "Construye: 2ª (C4-D4) y luego 3ª (C4-E4).", notas: ["C4","D4","C4","E4"] },
      q3: { pregunta: "Para desarrollar el reconocimiento de intervalos de oído, la mejor práctica es:", opciones: ["Cantar un intervalo diariamente desde una nota fija","Solo leerlos en partituras","Ignorar la melodía y concentrarse en el ritmo","Aprenderlos todos de golpe"], respuesta: "Cantar un intervalo diariamente desde una nota fija" },
    },
  },
  {
    titulo: "Creación de melodías",
    descripcion: "Compón tu primera melodía aplicando escalas, intervalos y ritmo.",
    intro: "Crear una melodía es el punto de llegada del módulo de Melodía. Aquí usarás escalas, intervalos y ritmo juntos, con intención musical: frase, clímax, cierre.",
    sections: [
      { title: "Frase melódica", body: "Grupo de notas con inicio, desarrollo y cierre. Como una oración gramatical.", example: "C-D-E-F-G-F-E-C (sube y baja simétricamente)." },
      { title: "Clímax", body: "La nota más aguda de la melodía crea el punto de máxima tensión.", example: "El clímax de 'La Marsellaise' es en la nota más alta." },
      { title: "Cierre (cadencia melódica)", body: "Terminar en la tónica da sensación de reposo y conclusión.", example: "...F-E-D-C (resolución en tónica)." },
    ],
    graphic: "Inicio → Ascenso → Clímax → Descenso → Cierre en tónica",
    audioExample: "Melodía simple: C4-E4-G4-E4-C4.",
    video_url: "https://www.youtube.com/results?search_query=como+crear+melodia+composicion+principiante",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Qué es una frase melódica?", opciones: ["Un grupo de notas con inicio, desarrollo y cierre","Una nota sola repetida","Un compás sin ritmo","Un acorde arpeggiado"], respuesta: "Un grupo de notas con inicio, desarrollo y cierre" },
      q2: { pregunta: "¿Qué efecto produce terminar la melodía en la tónica?", opciones: ["Sensación de reposo y conclusión","Tensión sin resolver","Inicio de una nueva sección","Cambio de tonalidad"], respuesta: "Sensación de reposo y conclusión" },
      a1: { pregunta: "Escucha: ¿cuál es la tónica de la melodía?", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "¿Qué nota es el clímax (más aguda) de la melodía?", nota: "G4", opciones: ["E4","F4","G4","A4"] },
      m1: { pregunta: "Compón una frase ascendente: C4-D4-E4-F4-G4.", notas: ["C4","D4","E4","F4","G4"] },
      m2: { pregunta: "Añade el cierre descendente: G4-F4-E4-D4-C4.", notas: ["G4","F4","E4","D4","C4"] },
      q3: { pregunta: "El 'clímax' de una melodía es:", opciones: ["La nota de mayor tensión y altura de la frase","El inicio de la melodía","El acorde de acompañamiento","El tempo más rápido"], respuesta: "La nota de mayor tensión y altura de la frase" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3: ARMONÍA
// ═══════════════════════════════════════════════════════════════════════════════

const armonia_u1 = [
  {
    titulo: "Intervalos armónicos",
    descripcion: "Dos notas sonando juntas: el punto de partida de la armonía.",
    intro: "Un intervalo armónico ocurre cuando dos notas suenan simultáneamente. La combinación puede sonar estable (consonante) o tensa (disonante), y eso es el lenguaje de la armonía.",
    sections: [
      { title: "Consonancia", body: "Intervalos que suenan estables: unísono, 3ª, 5ª, 6ª, 8ª.", example: "C+E (3ª mayor) → consonante." },
      { title: "Disonancia", body: "Intervalos que suenan tensos y quieren resolver: 2ª, 7ª, tritono.", example: "B+F (tritono) → máxima disonancia." },
      { title: "Resolución", body: "La disonancia quiere moverse hacia la consonancia. Ese movimiento es la base del lenguaje tonal.", example: "B-F (tritono) → C-E (3ª consonante)." },
    ],
    graphic: "Consonante: 3ª 5ª 8ª | Disonante: 2ª 7ª tritono",
    audioExample: "3ª mayor (C+E) vs 7ª mayor (C+B) comparadas.",
    video_url: "https://www.youtube.com/results?search_query=intervalos+armonicos+consonancia+disonancia",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué intervalos se consideran consonantes?", opciones: ["3ª, 5ª y 8ª","2ª y 7ª","Tritono","Solo el unísono"], respuesta: "3ª, 5ª y 8ª" },
      q2: { pregunta: "¿Qué hace la disonancia en el lenguaje tonal?", opciones: ["Genera tensión que busca resolver hacia la consonancia","Estabiliza la armonía","Define el tempo","Es siempre un error"], respuesta: "Genera tensión que busca resolver hacia la consonancia" },
      a1: { pregunta: "Escucha el intervalo: ¿suena consonante o disonante?", nota: "E4", opciones: ["C4","D4","E4","F4"] },
      a2: { pregunta: "¿Cuál es la nota que resuelve la disonancia?", nota: "C4", opciones: ["C4","D4","B4","G4"] },
      m1: { pregunta: "Construye el intervalo consonante de 3ª: C4-E4.", notas: ["C4","E4"] },
      m2: { pregunta: "Construye la resolución: B4-C5 (7ª → 8ª).", notas: ["B4","C5"] },
      q3: { pregunta: "El tritono (C-F#) se llama 'el diablo en la música' porque:", opciones: ["Es el intervalo más disonante y tenso","Es el más consonante","Define el modo mayor","Solo aparece en música moderna"], respuesta: "Es el intervalo más disonante y tenso" },
    },
  },
  {
    titulo: "Tríadas",
    descripcion: "Construye acordes de tres notas: la base de toda armonía.",
    intro: "Una tríada es un acorde de tres notas construido por terceras. La tríada mayor tiene 3ª mayor + 5ª justa; la menor tiene 3ª menor + 5ª justa. La diferencia es solo un semitono, pero cambia todo el color.",
    sections: [
      { title: "Construcción", body: "Tónica + 3ª + 5ª desde cualquier nota.", example: "C mayor: C-E-G | A menor: A-C-E." },
      { title: "Mayor vs menor", body: "Mayor: 3ª mayor (4 semitonos). Menor: 3ª menor (3 semitonos).", example: "C-E = 4 st (mayor). A-C = 3 st (menor)." },
      { title: "Arpeggio", body: "Tocar las notas del acorde de forma sucesiva es un arpegio.", example: "C-E-G arpegiado = sucesión de notas del acorde." },
    ],
    graphic: "Triada = Tónica + 3ª + 5ª",
    audioExample: "Arpegio C-E-G (mayor) y A-C-E (menor) comparados.",
    video_url: "https://www.youtube.com/results?search_query=triadas+musicales+mayor+menor+construccion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué notas forman la tríada de C mayor?", opciones: ["C-E-G","C-D-E","C-F-A","C-G-B"], respuesta: "C-E-G" },
      q2: { pregunta: "¿En qué se diferencia una tríada mayor de una menor?", opciones: ["En la 3ª (mayor o menor)","En el ritmo","En la octava","En el timbre"], respuesta: "En la 3ª (mayor o menor)" },
      a1: { pregunta: "Escucha el arpegio: ¿qué nota inicia el acorde?", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "¿Qué nota es la 5ª del acorde de C mayor?", nota: "G4", opciones: ["E4","F4","G4","A4"] },
      m1: { pregunta: "Construye el arpegio de C mayor: C4-E4-G4.", notas: ["C4","E4","G4"] },
      m2: { pregunta: "Construye el arpegio de A menor: A4-C5-E4.", notas: ["A4","C5","E4"] },
      q3: { pregunta: "¿Qué es un arpegio?", opciones: ["Las notas del acorde tocadas sucesivamente","Un acorde de cuatro notas","Un intervalo de octava","Una escala cromática"], respuesta: "Las notas del acorde tocadas sucesivamente" },
    },
  },
  {
    titulo: "Inversiones",
    descripcion: "Cambia el bajo del acorde sin cambiar las notas: variedad sin complejidad.",
    intro: "Una inversión ocurre cuando la tónica no es la nota más grave del acorde. El acorde suena diferente aunque tenga las mismas notas, lo que permite hacer el bajo más melódico.",
    sections: [
      { title: "Estado fundamental", body: "La tónica está en el bajo: C-E-G.", example: "C es la nota más grave." },
      { title: "Primera inversión", body: "La 3ª está en el bajo: E-G-C.", example: "E es la nota más grave del acorde de C." },
      { title: "Segunda inversión", body: "La 5ª está en el bajo: G-C-E.", example: "G es la nota más grave del acorde de C." },
    ],
    graphic: "Fund: C-E-G | 1ª inv: E-G-C | 2ª inv: G-C-E",
    audioExample: "C mayor en tres posiciones comparado.",
    video_url: "https://www.youtube.com/results?search_query=inversiones+acordes+primera+segunda+inversion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué nota está en el bajo en la primera inversión de C mayor?", opciones: ["E","C","G","B"], respuesta: "E" },
      q2: { pregunta: "¿Las inversiones cambian las notas del acorde?", opciones: ["No, solo cambia cuál nota está en el bajo","Sí, cambian la 3ª","Sí, añaden una nota nueva","Depende del modo"], respuesta: "No, solo cambia cuál nota está en el bajo" },
      a1: { pregunta: "Escucha el acorde: ¿es estado fundamental o inversión?", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "En la 2ª inversión de C mayor, ¿qué nota escuchas en el bajo?", nota: "G4", opciones: ["C4","E4","G4","B4"] },
      m1: { pregunta: "Escribe C mayor en estado fundamental: C4-E4-G4.", notas: ["C4","E4","G4"] },
      m2: { pregunta: "Escribe la 1ª inversión: E4-G4-C5.", notas: ["E4","G4","C5"] },
      q3: { pregunta: "¿Para qué sirven las inversiones en práctica?", opciones: ["Para hacer líneas de bajo más melódicas y conectadas","Solo para añadir notas nuevas","Para cambiar la tonalidad","Para aumentar el tempo"], respuesta: "Para hacer líneas de bajo más melódicas y conectadas" },
    },
  },
];

const armonia_u2 = [
  {
    titulo: "Acordes mayores",
    descripcion: "El color brillante y estable de la armonía mayor.",
    intro: "Los acordes mayores son los más usados en música popular, folclórica y clásica. Su estructura (tónica-3ª mayor-5ª justa) crea el color brillante y estable que asociamos con la alegría.",
    sections: [
      { title: "Construcción", body: "Tónica + 4 semitonos (3ª mayor) + 3 semitonos (5ª justa).", example: "C major = C(0) + E(4st) + G(7st)." },
      { title: "Acordes mayores comunes", body: "C-G-D-A-E-F son los más usados en guitarra y piano.", example: "La progresión I-IV-V usa tres acordes mayores." },
      { title: "En el teclado", body: "Busca la nota blanca, salta dos teclas blancas (con una negra entre ellas), salta una tecla blanca.", example: "C→E: C-C#-D-D#-E (4 semitonos). E→G: E-F-F#-G (3 st)." },
    ],
    graphic: "C major: C + E + G | 4st + 3st",
    audioExample: "C-F-G mayores comparados.",
    video_url: "https://www.youtube.com/results?search_query=acordes+mayores+piano+guitarra+construccion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos semitonos hay entre la tónica y la 3ª de un acorde mayor?", opciones: ["4","3","5","2"], respuesta: "4" },
      q2: { pregunta: "¿Cuáles son los acordes más usados en música popular mayor?", opciones: ["C-G-D-A-E-F","A-B-C-D-E-F","C#-D#-F#-G#","Solo C y G"], respuesta: "C-G-D-A-E-F" },
      a1: { pregunta: "Escucha el acorde: ¿cuál es la tónica?", nota: "C4", opciones: ["C4","D4","E4","F4"] },
      a2: { pregunta: "¿Qué nota es la 3ª mayor de G?", nota: "B4", opciones: ["A4","B4","C5","D5"] },
      m1: { pregunta: "Construye el arpegio de G mayor: G4-B4-D5.", notas: ["G4","B4","D5"] },
      m2: { pregunta: "Construye F mayor: F4-A4-C5.", notas: ["F4","A4","C5"] },
      q3: { pregunta: "G mayor y C mayor en secuencia crean:", opciones: ["Movimiento de V→I (dominante a tónica)","Un intervalo de 2ª","Una escala menor","Solo relleno armónico"], respuesta: "Movimiento de V→I (dominante a tónica)" },
    },
  },
  {
    titulo: "Acordes menores",
    descripcion: "El color introspectivo y tenso de la armonía menor.",
    intro: "Los acordes menores tienen la 3ª un semitono más baja que en los mayores. Ese pequeño cambio transforma completamente el color emocional, asociado con melancolía, tensión o profundidad.",
    sections: [
      { title: "Construcción", body: "Tónica + 3 semitonos (3ª menor) + 4 semitonos (5ª justa).", example: "A minor = A(0) + C(3st) + E(7st)." },
      { title: "Menores comunes", body: "Am-Em-Dm son los más usados. Aparecen en casi toda música popular en modo menor.", example: "Am-F-C-G es una de las progresiones más comunes." },
      { title: "Mayor vs menor en contexto", body: "El mismo acorde en mayor o menor crea emociones radicalmente distintas.", example: "C major vs C minor (C-Eb-G) — compáralos." },
    ],
    graphic: "A minor: A + C + E | 3st + 4st",
    audioExample: "Am-Em-Dm comparados con sus versiones mayores.",
    video_url: "https://www.youtube.com/results?search_query=acordes+menores+am+em+dm+guitarra",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos semitonos hay entre la tónica y la 3ª de un acorde menor?", opciones: ["3","4","5","2"], respuesta: "3" },
      q2: { pregunta: "¿Qué acorde resulta de A-C-E?", opciones: ["A menor","A mayor","C mayor","E menor"], respuesta: "A menor" },
      a1: { pregunta: "Escucha el acorde menor: ¿cuál es su tónica?", nota: "A4", opciones: ["G4","A4","B4","C5"] },
      a2: { pregunta: "¿Qué nota es la 3ª menor de A?", nota: "C5", opciones: ["B4","C5","D5","E5"] },
      m1: { pregunta: "Construye A menor: A4-C5-E4.", notas: ["A4","C5","E4"] },
      m2: { pregunta: "Construye E menor: E4-G4-B4.", notas: ["E4","G4","B4"] },
      q3: { pregunta: "La diferencia entre C mayor (C-E-G) y C menor (C-Eb-G) es:", opciones: ["Solo la 3ª (mayor o menor)","La 5ª","La tónica","El ritmo"], respuesta: "Solo la 3ª (mayor o menor)" },
    },
  },
  {
    titulo: "Acordes disminuidos",
    descripcion: "El acorde de máxima tensión: 3ª menor + 5ª disminuida.",
    intro: "El acorde disminuido (diminished) tiene la 3ª y la 5ª reducidas. Su sonido inestable y tenso lo convierte en el acorde de la anticipación y la resolución por excelencia.",
    sections: [
      { title: "Construcción", body: "Tónica + 3ª menor (3st) + 5ª disminuida (3st más).", example: "B diminished = B-D-F (3st + 3st)." },
      { title: "Uso funcional", body: "El VIIo (acorde disminuido del 7mo grado) es el acorde de mayor tensión y quiere resolver en I.", example: "Bdim → C major (VII° → I)." },
      { title: "Tritono", body: "La 5ª disminuida es el tritono: el intervalo más disonante.", example: "B-F = tritono dentro de Bdim." },
    ],
    graphic: "Bdim: B + D + F | 3st + 3st",
    audioExample: "Bdim resolviendo a C major.",
    video_url: "https://www.youtube.com/results?search_query=acorde+disminuido+teoria+uso",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos semitonos separan las notas de un acorde disminuido?", opciones: ["3st + 3st","4st + 3st","3st + 4st","2st + 5st"], respuesta: "3st + 3st" },
      q2: { pregunta: "¿Qué intervalo contiene un acorde disminuido que lo hace tan tenso?", opciones: ["El tritono (5ª disminuida)","La 3ª mayor","La 5ª justa","La 6ª menor"], respuesta: "El tritono (5ª disminuida)" },
      a1: { pregunta: "Escucha el acorde disminuido: ¿hacia dónde quiere resolver?", nota: "B4", opciones: ["B4","C5","D5","E5"] },
      a2: { pregunta: "¿Qué nota es la 5ª disminuida de B?", nota: "F4", opciones: ["E4","F4","G4","A4"] },
      m1: { pregunta: "Construye Bdim: B4-D5-F5.", notas: ["B4","D5","F5"] },
      m2: { pregunta: "Escribe la resolución: Bdim → C major (C4-E4-G4).", notas: ["C4","E4","G4"] },
      q3: { pregunta: "El acorde VII° (disminuido) tiende a resolver hacia:", opciones: ["El acorde I (tónica)","El acorde IV","El acorde VI","El acorde II"], respuesta: "El acorde I (tónica)" },
    },
  },
];

const armonia_u3 = [
  {
    titulo: "Tónica, subdominante y dominante",
    descripcion: "Las tres funciones que mueven toda la música tonal.",
    intro: "En el sistema tonal, cada acorde cumple una función: la Tónica es el hogar (reposo), la Subdominante prepara el movimiento y la Dominante genera la máxima tensión antes del reposo.",
    sections: [
      { title: "Tónica (I)", body: "El acorde de reposo. Inicio y final natural de una pieza.", example: "En C major: el acorde I = C-E-G." },
      { title: "Subdominante (IV)", body: "Prepara el movimiento. Salir de la tónica.", example: "En C major: IV = F-A-C. Se siente 'partiendo'." },
      { title: "Dominante (V)", body: "Máxima tensión. Quiere resolver urgentemente en la tónica.", example: "En C major: V = G-B-D. La sensible (B) empuja hacia C." },
    ],
    graphic: "I=reposo | IV=preparación | V=tensión → I=reposo",
    audioExample: "I-IV-V-I en C major.",
    video_url: "https://www.youtube.com/results?search_query=tonica+subdominante+dominante+funciones+tonales",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué función armónica da sensación de reposo y hogar?", opciones: ["Tónica (I)","Dominante (V)","Subdominante (IV)","Sensible (VII)"], respuesta: "Tónica (I)" },
      q2: { pregunta: "¿Qué nota de V7 genera la tensión que quiere resolver en I?", opciones: ["La sensible (7mo grado)","La tónica","La dominante","La subdominante"], respuesta: "La sensible (7mo grado)" },
      a1: { pregunta: "Escucha el acorde: ¿es I o V?", nota: "C4", opciones: ["C4","G4","F4","E4"] },
      a2: { pregunta: "¿Qué acorde es el V en C major?", nota: "G4", opciones: ["C4","F4","G4","A4"] },
      m1: { pregunta: "Construye I-IV en C: C4-E4-G4 → F4-A4-C5.", notas: ["C4","E4","G4","F4","A4","C5"] },
      m2: { pregunta: "Construye V-I: G4-B4-D5 → C4-E4-G4.", notas: ["G4","B4","D5","C4","E4","G4"] },
      q3: { pregunta: "La progresión I→IV→V→I crea:", opciones: ["Un ciclo completo de reposo-movimiento-tensión-reposo","Solo tensión sin resolver","Solo movimiento sin inicio","Una escala ascendente"], respuesta: "Un ciclo completo de reposo-movimiento-tensión-reposo" },
    },
  },
  {
    titulo: "Cadencias",
    descripcion: "Los puntos de puntuación de la música: comas, puntos suspensivos y puntos finales.",
    intro: "Una cadencia es una fórmula armónica que concluye (o semipunctuaría) una frase musical. Las cadencias organizan el discurso armónico como la puntuación en un texto.",
    sections: [
      { title: "Cadencia auténtica (V→I)", body: "El cierre más firme: tensión total seguida de reposo.", example: "G major → C major: la cadencia definitiva." },
      { title: "Cadencia plagal (IV→I)", body: "Cierre suave, reposado. El 'Amén' de la iglesia.", example: "F major → C major: sensación de paz." },
      { title: "Semicadencia (→V)", body: "Terminar en V, sin resolver. Como una pregunta sin respuesta.", example: "...→ G major: 'algo más va a pasar'." },
    ],
    graphic: "Auténtica V→I | Plagal IV→I | Semi ...→V",
    audioExample: "Cadencia auténtica G→C y plagal F→C comparadas.",
    video_url: "https://www.youtube.com/results?search_query=cadencias+musicales+autentica+plagal+semicadencia",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cómo se llama la cadencia V→I?", opciones: ["Auténtica","Plagal","Semi-cadencia","Rota"], respuesta: "Auténtica" },
      q2: { pregunta: "La semicadencia termina en:", opciones: ["V (sin resolver)","I (reposo)","IV (preparación)","VII (disminuido)"], respuesta: "V (sin resolver)" },
      a1: { pregunta: "Escucha: ¿termina la cadencia en reposo?", nota: "C4", opciones: ["C4","G4","F4","E4"] },
      a2: { pregunta: "¿Qué acorde cierra la cadencia plagal?", nota: "C4", opciones: ["G4","F4","C4","A4"] },
      m1: { pregunta: "Construye cadencia auténtica: G4-B4-D5 → C4-E4-G4.", notas: ["G4","B4","D5","C4","E4","G4"] },
      m2: { pregunta: "Construye cadencia plagal: F4-A4-C5 → C4-E4-G4.", notas: ["F4","A4","C5","C4","E4","G4"] },
      q3: { pregunta: "El 'Amén' al final de los himnos religiosos es un ejemplo de:", opciones: ["Cadencia plagal (IV→I)","Cadencia auténtica","Semicadencia","Cadencia rota"], respuesta: "Cadencia plagal (IV→I)" },
    },
  },
  {
    titulo: "Progresiones armónicas",
    descripcion: "Conecta acordes con intención: el lenguaje del acompañamiento.",
    intro: "Una progresión es una secuencia de acordes con dirección funcional. Las progresiones crean expectativa, movimiento y cierre; son el esqueleto rítmico-armónico de una canción.",
    sections: [
      { title: "I-IV-V-I", body: "La progresión más clásica: blues, rock, folk, pop.", example: "C-F-G-C en C major." },
      { title: "I-V-vi-IV", body: "La progresión del pop moderno: usada en miles de canciones.", example: "C-G-Am-F en C major." },
      { title: "ii-V-I (jazz)", body: "La progresión fundamental del jazz. Tensión máxima antes del reposo.", example: "Dm-G-C en C major." },
    ],
    graphic: "I-IV-V-I | I-V-vi-IV | ii-V-I",
    audioExample: "I-V-vi-IV en C: C-G-Am-F.",
    video_url: "https://www.youtube.com/results?search_query=progresiones+armonicas+basicas+pop+jazz",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué acorde es el 'vi' en C major?", opciones: ["A menor","F mayor","G mayor","D menor"], respuesta: "A menor" },
      q2: { pregunta: "La progresión ii-V-I es el estándar de:", opciones: ["Jazz","Blues de 12 compases","Flamenco","Música barroca"], respuesta: "Jazz" },
      a1: { pregunta: "Escucha la tónica de la progresión.", nota: "C4", opciones: ["C4","E4","G4","A4"] },
      a2: { pregunta: "¿Qué acorde sigue después de I en I-V-vi-IV?", nota: "G4", opciones: ["C4","F4","G4","A4"] },
      m1: { pregunta: "Construye I-IV: C4-E4-G4 → F4-A4-C5.", notas: ["C4","E4","G4","F4","A4","C5"] },
      m2: { pregunta: "Construye V-vi: G4-B4-D5 → A4-C5-E5.", notas: ["G4","B4","D5","A4","C5","E5"] },
      q3: { pregunta: "¿Por qué la progresión I-V-vi-IV es tan efectiva en pop?", opciones: ["Combina reposo, tensión y movimiento de forma natural y memorable","Es completamente disonante","Evita la tónica durante toda la canción","Usa solo acordes disminuidos"], respuesta: "Combina reposo, tensión y movimiento de forma natural y memorable" },
    },
  },
];

const armonia_u4 = [
  {
    titulo: "Armonización",
    descripcion: "Añade acordes a una melodía: el arte de crear acompañamiento.",
    intro: "Armonizar es elegir acordes que complementen una melodía sin ahogarla. El principio básico: la nota melódica debe ser parte del acorde elegido o sonar bien sobre él.",
    sections: [
      { title: "Principio de la nota pivote", body: "La nota de la melodía que cae en un tiempo fuerte debe pertenecer al acorde.", example: "Si la melodía tiene E en el tiempo 1, usar C major (C-E-G) es coherente." },
      { title: "Opciones de acorde", body: "Cada nota puede pertenecer a varios acordes; elige según el contexto y la función.", example: "E pertenece a C major (3ª), A minor (5ª) y E major (tónica)." },
      { title: "Movimiento del bajo", body: "Un bajo bien armonizado se mueve de forma melódica y conecta los acordes.", example: "C→F→G→C: bajo por grado y salto." },
    ],
    graphic: "Melodía: C-E-G | Acordes: I-I-V",
    audioExample: "Melodía simple con armonización I-IV-V-I.",
    video_url: "https://www.youtube.com/results?search_query=armonizacion+melodia+acordes+principiante",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Qué indica el 'principio de la nota pivote' en armonización?", opciones: ["La nota fuerte de la melodía debe pertenecer al acorde","El bajo siempre va en la tónica","Solo se usa el acorde I","La melodía no importa"], respuesta: "La nota fuerte de la melodía debe pertenecer al acorde" },
      q2: { pregunta: "La nota E puede pertenecer a:", opciones: ["C major, A minor y E major","Solo C major","Solo A minor","Ningún acorde mayor"], respuesta: "C major, A minor y E major" },
      a1: { pregunta: "Escucha la melodía: ¿qué acorde la armoniza mejor?", nota: "C4", opciones: ["C4","F4","G4","D4"] },
      a2: { pregunta: "¿Qué nota del acorde suena como 5ª en C major?", nota: "G4", opciones: ["C4","E4","G4","B4"] },
      m1: { pregunta: "Armoniza E con el acorde C major: C4-E4-G4.", notas: ["C4","E4","G4"] },
      m2: { pregunta: "Armoniza A con A minor: A4-C5-E4.", notas: ["A4","C5","E4"] },
      q3: { pregunta: "En armonización, ¿por qué es importante el movimiento del bajo?", opciones: ["Conecta los acordes de forma melódica y fluida","Solo define el tempo","Indica la tonalidad","Reemplaza la melodía"], respuesta: "Conecta los acordes de forma melódica y fluida" },
    },
  },
  {
    titulo: "Análisis armónico",
    descripcion: "Lee una progresión y entiende su lógica funcional.",
    intro: "El análisis armónico es el proceso de identificar los acordes y sus funciones dentro de una tonalidad. Con números romanos puedes describir cualquier progresión independientemente de la tonalidad.",
    sections: [
      { title: "Numeración romana", body: "I-II-III-IV-V-VI-VII representa los grados de la escala. Mayúsculas = mayor; minúsculas = menor.", example: "En C: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am, VII°=Bdim." },
      { title: "Proceso de análisis", body: "Identifica la tónica → nombra cada acorde → asigna su número romano → describe su función.", example: "C-Am-F-G = I-vi-IV-V en C major." },
      { title: "Transporte", body: "La misma progresión en distintas tonalidades suena igual funcionalmente.", example: "I-IV-V-I en C = C-F-G-C; en G = G-C-D-G." },
    ],
    graphic: "C major: I=C | ii=Dm | iii=Em | IV=F | V=G | vi=Am | VII°=Bdim",
    audioExample: "I-vi-IV-V en C: C-Am-F-G.",
    video_url: "https://www.youtube.com/results?search_query=análisis+armónico+numeros+romanos+funciones",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Qué acorde es 'vi' en C major?", opciones: ["Am","Dm","Em","Bdim"], respuesta: "Am" },
      q2: { pregunta: "Si analizas C-F-G-C en C major, ¿qué progresión es?", opciones: ["I-IV-V-I","I-V-IV-I","I-vi-IV-V","ii-V-I-IV"], respuesta: "I-IV-V-I" },
      a1: { pregunta: "Escucha el acorde I de la tonalidad.", nota: "C4", opciones: ["C4","F4","G4","A4"] },
      a2: { pregunta: "¿Qué acorde es el 'vi' que escuchas?", nota: "A4", opciones: ["C4","E4","G4","A4"] },
      m1: { pregunta: "Construye I-vi: C4-E4-G4 → A4-C5-E4.", notas: ["C4","E4","G4","A4","C5","E4"] },
      m2: { pregunta: "Construye IV-V: F4-A4-C5 → G4-B4-D5.", notas: ["F4","A4","C5","G4","B4","D5"] },
      q3: { pregunta: "La utilidad de analizar con números romanos es:", opciones: ["Describir progresiones independientemente de la tonalidad","Solo para música clásica","Reemplazar los nombres de los acordes","Indicar el tempo"], respuesta: "Describir progresiones independientemente de la tonalidad" },
    },
  },
  {
    titulo: "Construcción de progresiones",
    descripcion: "Crea tus propias progresiones con intención funcional: el punto de llegada.",
    intro: "Construir progresiones propias integra todo el módulo de Armonía. Aplicarás funciones tonales, cadencias y movimiento armónico para componer acompañamientos originales.",
    sections: [
      { title: "Elige una función de inicio", body: "Casi toda progresión comienza en I. También puedes empezar en vi para un inicio menor.", example: "Inicio en I: C major. Inicio en vi: Am." },
      { title: "Diseña el movimiento", body: "Usa IV para alejarte y V para crear tensión. El oyente espera el regreso a I.", example: "I→IV→V→I: el ciclo más natural." },
      { title: "Añade color", body: "Introduce vi o ii para variar sin perder la lógica funcional.", example: "I→vi→IV→V→I: más dramático." },
    ],
    graphic: "Inicio (I/vi) → Movimiento (IV/ii) → Tensión (V) → Reposo (I)",
    audioExample: "I-vi-IV-V-I: C-Am-F-G-C.",
    video_url: "https://www.youtube.com/results?search_query=construccion+progresiones+armonicas+composicion",
    xp: 80,
    ejercicios: {
      q1: { pregunta: "¿Por qué la mayoría de progresiones comienzan en I?", opciones: ["Establece la tónica y el centro tonal","Es una norma obligatoria","Solo el I puede iniciar progresiones","El I es el acorde más grave"], respuesta: "Establece la tónica y el centro tonal" },
      q2: { pregunta: "¿Qué acorde añade 'color dramático' a la progresión I-IV-V-I?", opciones: ["vi (sexto menor)","II mayor","VII disminuido solo","III mayor"], respuesta: "vi (sexto menor)" },
      a1: { pregunta: "Escucha la tónica que abre la progresión.", nota: "C4", opciones: ["C4","A4","F4","G4"] },
      a2: { pregunta: "¿Qué acorde cierra la progresión en reposo?", nota: "C4", opciones: ["G4","F4","A4","C4"] },
      m1: { pregunta: "Construye I-IV-V: C4-E4-G4 → F4-A4-C5 → G4-B4-D5.", notas: ["C4","E4","G4","F4","A4","C5","G4","B4","D5"] },
      m2: { pregunta: "Crea I-vi-IV-V: añade Am antes de F.", notas: ["C4","E4","G4","A4","C5","E4","F4","A4","C5","G4","B4","D5"] },
      q3: { pregunta: "Al componer una progresión, ¿cuál es la estrategia más efectiva?", opciones: ["Planificar la función de cada acorde (reposo, movimiento, tensión)","Elegir acordes al azar","Usar solo acordes mayores","Repetir el mismo acorde todo el tiempo"], respuesta: "Planificar la función de cada acorde (reposo, movimiento, tensión)" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENSAMBLAJE FINAL
// ═══════════════════════════════════════════════════════════════════════════════

export const learningPath = [
  {
    slug: "ritmo",
    titulo: "Ritmo",
    descripcion: "Pulso, tempo, compás, figuras, silencios y creación de patrones rítmicos.",
    imagen: moduleImages.ritmo,
    orden: 1,
    unidades: [
      unit("Fundamentos temporales",       "Pulso, tempo y metrónomo: la base de todo lo demás.",            1, ritmo_u1, "ritmo"),
      unit("Organización del tiempo",      "Compás, acentos y barras: cómo se agrupa el tiempo.",            2, ritmo_u2, "ritmo"),
      unit("Figuras y silencios",          "Redondas, blancas, negras, corcheas y sus silencios.",           3, ritmo_u3, "ritmo"),
      unit("Aplicación rítmica",           "Lectura, dictado y creación de patrones propios.",               4, ritmo_u4, "ritmo"),
    ],
  },
  {
    slug: "melodia",
    titulo: "Melodía",
    descripcion: "Notas, lectura musical, intervalos, escalas y composición melódica.",
    imagen: moduleImages.melodia,
    orden: 2,
    unidades: [
      unit("Notas y octavas",             "Los nombres de las notas y cómo se organizan en el espacio.",    1, melodia_u1, "melodia"),
      unit("Lectura musical",             "Pentagrama, clave de Sol y clave de Fa.",                         2, melodia_u2, "melodia"),
      unit("Construcción melódica",       "Intervalos, escala mayor y escala menor.",                        3, melodia_u3, "melodia"),
      unit("Entrenamiento auditivo",      "Dictado melódico, reconocimiento de intervalos y composición.",   4, melodia_u4, "melodia"),
    ],
  },
  {
    slug: "armonia",
    titulo: "Armonía",
    descripcion: "Acordes, inversiones, funciones tonales, cadencias y progresiones.",
    imagen: moduleImages.armonia,
    orden: 3,
    unidades: [
      unit("Fundamentos armónicos",       "Intervalos armónicos, tríadas e inversiones.",                    1, armonia_u1, "armonia"),
      unit("Tipos de acordes",            "Acordes mayores, menores y disminuidos.",                         2, armonia_u2, "armonia"),
      unit("Funciones tonales",           "Tónica, subdominante, dominante y cadencias.",                    3, armonia_u3, "armonia"),
      unit("Aplicación armónica",         "Armonización, análisis y construcción de progresiones propias.",  4, armonia_u4, "armonia"),
    ],
  },
];

// ── Validación de mínimo de ejercicios ────────────────────────────────────────
export const totalExercises = learningPath.reduce(
  (modTotal, mod) =>
    modTotal +
    mod.unidades.reduce(
      (unitTotal, u) =>
        unitTotal + u.lecciones.reduce((lesTotal, l) => lesTotal + l.ejercicios.length, 0),
      0
    ),
  0
);

if (totalExercises < 100) {
  throw new Error(
    `La ruta debe tener al menos 100 ejercicios. Total actual: ${totalExercises}`
  );
}

// console.log(`✅ Currículo cargado: ${totalExercises} ejercicios en 36 lecciones.`);