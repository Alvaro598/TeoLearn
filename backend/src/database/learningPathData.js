const moduleImages = {
  ritmo: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  melodia: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=1200&q=80",
  armonia: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80",
};

// ─── Constructores de contenido ───────────────────────────────────────────────
function content({ intro, sections, graphic }) {
  return [
    intro,
    "",
    ...sections.flatMap((s) => [
      `## ${s.title}`,
      s.body,
      s.example ? `Ejemplo: ${s.example}` : "",
      "",
    ]),
    graphic ? `Gráfico textual: ${graphic}` : "",
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

function agruparNotasComoAcordes(notas = []) {
  const grupos = [];
  for (let i = 0; i < notas.length; i += 3) {
    grupos.push(notas.slice(i, i + 3));
  }
  return grupos.filter((grupo) => grupo.length > 0);
}

function notaASemitonos(nota = "C4") {
  const m = nota.match(/^([A-G]#?)(\d)$/);
  if (!m) return 0;
  const [, letra, octavaStr] = m;
  return CROMATICA.indexOf(letra) + Number(octavaStr) * 12;
}

function calidadDeAcorde(acorde = []) {
  const [raiz, tercera, quinta] = acorde;
  const semisTercera = ((notaASemitonos(tercera) - notaASemitonos(raiz)) % 12 + 12) % 12;
  const semisQuinta = ((notaASemitonos(quinta) - notaASemitonos(raiz)) % 12 + 12) % 12;

  if (semisTercera === 4 && semisQuinta === 7) return "mayor";
  if (semisTercera === 3 && semisQuinta === 7) return "menor";
  if (semisTercera === 3 && semisQuinta === 6) return "disminuido";
  return "mayor";
}

function gradoRomanoDesdeAcorde(tonicaBase, acorde = []) {
  const grado = Number(gradoDiatonico(tonicaBase, acorde[0] || tonicaBase));
  const numeral = ["I", "II", "III", "IV", "V", "VI", "VII"][grado - 1] || "I";
  const calidad = calidadDeAcorde(acorde);

  if (calidad === "menor") return numeral.toLowerCase();
  if (calidad === "disminuido") return `${numeral.toLowerCase()}°`;
  return numeral;
}

function progresionDesdeStack(stack = [], tonicaBase = "C4") {
  if (!stack.length) return [];
  const referencia = stack[0]?.[0] || tonicaBase;
  return stack.map((acorde) => gradoRomanoDesdeAcorde(referencia, acorde));
}

function extraerGradosRomanos(texto = "") {
  const grados = texto.match(/(?<![A-Za-z])(?:vii°|VII°|iii|III|ii|II|vi|VI|iv|IV|v|V|i|I)(?![A-Za-z])/g);
  return grados || [];
}

function notasDisponiblesParaArmonia(notas = []) {
  return Array.from(
    new Set([...notas, "F5", "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "G3"])
  ).sort((a, b) => {
    const parse = (nota) => {
      const m = nota.match(/^([A-G]#?)(\d)$/);
      if (!m) return 0;
      return Number(m[2]) * 12 + CROMATICA.indexOf(m[1]);
    };
    return parse(b) - parse(a);
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
  const semisNota = CROMATICA.indexOf(m2[1]) + Number(m2[2]) * 12;
  const distancia = ((semisNota - semisTonica) % 12 + 12) % 12;

  let mejorGrado = 1;
  let mejorDif = Infinity;
  SEMITONOS_ESCALA_MAYOR.forEach((semis, i) => {
    const dif = Math.abs(semis - distancia);
    if (dif < mejorDif) { mejorDif = dif; mejorGrado = i + 1; }
  });

  return String(mejorGrado);
}

// ─── Constructor AUDITIVO consciente de categoría ─────────────────────────────
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
function midi(order, def, categoria = "melodia", variante = 0, points = 20) {
  if (categoria === "ritmo") {
    const compas = def.compas || 4;
    const figuraBase = def.figura || "negra";
    const tiemposPatron = def.tiempos || { kick: [1, 3], snare: [2, 4] };
    const tiemposFuertes = def.tiemposFuertes || [1];

    const instrumentos = [
      { id: "kick", nota: "C3", label: "Bombo (Kick)" },
      { id: "snare", nota: "D3", label: "Caja (Snare)" },
    ];
    if (tiemposPatron.hihat !== undefined) {
      instrumentos.push({ id: "hihat", nota: "F#3", label: "Hi-Hat" });
    }

    return {
      tipo: "midi",
      pregunta: def.instrucciones,
      contenido: {
        categoria: "ritmo",
        compas,
        figuraBase,
        instrumentos,
        tiemposFuertes,
        instrucciones: def.instrucciones,
      },
      respuesta_correcta: { patron: tiemposPatron },
      puntos: points,
      orden: order,
    };
  }

  if (categoria === "armonia") {
    const stack = agruparNotasComoAcordes(def.notas || []);
    const gradosDelPrompt = extraerGradosRomanos(def.pregunta);
    const progresion = gradosDelPrompt.length === stack.length
      ? gradosDelPrompt
      : progresionDesdeStack(stack, def.notas?.[0] || "C4");

    return {
      tipo: "midi",
      pregunta: def.pregunta,
      contenido: {
        categoria: "armonia",
        tonalidad: def.notas?.[0] || "C4",
        progresion,
        notasDisponibles: notasDisponiblesParaArmonia(def.notas || []),
        instrucciones: def.pregunta,
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
        notasDisponibles: ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
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
      notasDisponibles: ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
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
 *  1. quiz conceptual · 2. quiz aplicado · 3. auditivo básico · 4. auditivo comparativo
 *  5. MIDI replicar · 6. MIDI crear · 7. quiz de síntesis
 */
function ejercicios7(def, categoria = "melodia", variante = 0, base = 1) {
  return [
    quiz(base, def.q1.pregunta, def.q1.opciones, def.q1.respuesta),
    quiz(base + 1, def.q2.pregunta, def.q2.opciones, def.q2.respuesta),
    audio(base + 2, def.a1, categoria, variante),
    audio(base + 3, def.a2, categoria, variante + 1),
    midi(base + 4, def.m1, categoria, variante),
    midi(base + 5, def.m2, categoria, variante + 1),
    quiz(base + 6, def.q3.pregunta, def.q3.opciones, def.q3.respuesta, 15),
  ];
}

function lesson(def, order, categoria = "melodia", variante = 0) {
  return {
    titulo: def.titulo,
    descripcion: def.descripcion,
    contenido: content(def),
    video_url: def.video_url,
    imagen_url: def.imagen_url || null,
    orden: order,
    xp_recompensa: def.xp || 70,
    ejercicios: ejercicios7(def.ejercicios, categoria, variante),
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
// MÓDULO 1: RITMO (2 unidades, 6 lecciones)
// ═══════════════════════════════════════════════════════════════════════════════

const ritmo_u1 = [
  // ── Lección 1: Pulso ─────────────────────────────────────────────────────
  {
    titulo: "Pulso",
    imagen_url: "https://images.unsplash.com/photo-1724185773486-0b39642e607e?q=80&w=1333&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Siente el latido constante que sostiene toda la música.",
    intro:
      "El pulso es la unidad de tiempo más pequeña y constante en la música. Como el latido del corazón, no se detiene y no acelera: simplemente continúa. Antes de leer figuras o compases, necesitas sentir el pulso en tu cuerpo.",
    sections: [
      { title: "¿Qué es el pulso?", body: "Una sucesión regular de tiempos iguales. Puedes marcarlo con el pie, palmas o un metrónomo.", example: "| 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 |" },
      { title: "Pulso corporal", body: "Antes de tocar cualquier instrumento, siente el pulso: camina al ritmo, aplaude, balancea la cabeza.", example: "Caminar: izq-der-izq-der al mismo tiempo que pasa la música." },
      { title: "Tempo", body: "La velocidad del pulso se llama tempo. Un pulso lento es adagio; uno rápido es allegro.", example: "60 BPM = 1 pulso por segundo." },
    ],
    graphic: "→ · · · → · · · → (cada → es el pulso fuerte)",
    video_url: "https://www.youtube.com/embed/F6yLU43aPlg",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué describe mejor el pulso musical?", opciones: ["Un tiempo constante e igual", "Una nota aguda", "Un acorde mayor", "Un cambio de volumen"], respuesta: "Un tiempo constante e igual" },
      q2: { pregunta: "¿Qué nombre recibe la velocidad del pulso?", opciones: ["Tempo", "Timbre", "Compás", "Dinámica"], respuesta: "Tempo" },
      a1: { pregunta: "Escucha y selecciona la nota del pulso.", nota: "C4", opciones: ["C4", "D4", "E4", "G4"] },
      a2: { pregunta: "¿Cuál de estas notas suena más grave?", nota: "C4", opciones: ["C4", "C5", "E4", "G4"] },
      m1: { instrucciones: "Coloca un golpe de bombo en cada uno de los 4 tiempos del compás.", compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Coloca bombo en los tiempos 1 y 3 (tiempos fuertes) y caja en 2 y 4 (contratiempos).", compas: 4, figura: "negra", tiempos: { kick: [1, 3], snare: [2, 4] }, tiemposFuertes: [1, 3] },
      q3: { pregunta: "Un músico que 'pierde el pulso' significa que:", opciones: ["Acelera o frena sin control", "Toca muy suave", "Cambia de instrumento", "Añade más notas"], respuesta: "Acelera o frena sin control" },
    },
  },
  // ── Lección 2: Tempo (incluye metrónomo) ─────────────────────────────────
  {
    titulo: "Tempo",
    imagen_url: "https://images.unsplash.com/photo-1591025810539-a321000cda85?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Controla la velocidad de la música y aprende a practicar con metrónomo.",
    intro:
      "El tempo determina qué tan rápido o lento fluye la música. Es la primera indicación que aparece en una partitura y afecta el carácter de la pieza. Para medirlo y practicarlo usamos el metrónomo.",
    sections: [
      { title: "BPM", body: "BPM significa 'pulsos por minuto'. 60 BPM = 1 pulso por segundo; 120 BPM = 2 pulsos por segundo.", example: "Canción lenta: 60-80 BPM. Canción rápida: 140-180 BPM." },
      { title: "Términos de tempo", body: "Largo (40-60), Andante (76-108), Allegro (120-156), Presto (168+).", example: "Una marcha fúnebre es Largo; una danza folklórica puede ser Presto." },
      { title: "El metrónomo", body: "Marca el pulso a un BPM exacto. Escucha dos compases antes de tocar y ajústate siempre al click, no al revés. Empieza lento y sube la velocidad poco a poco.", example: "Practica a 60% del tempo objetivo antes de subir velocidad." },
    ],
    graphic: "Largo ←────── Andante ──── Allegro ──── Presto →",
    // TODO: reemplazar por tu propio video (el original repetía el de "Pulso")
    video_url: "https://www.youtube.com/results?search_query=tempo+bpm+metronomo+musica",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué significa 120 BPM?", opciones: ["120 pulsos por minuto", "120 notas por compás", "120 compases por hora", "120 decibeles"], respuesta: "120 pulsos por minuto" },
      q2: { pregunta: "¿Para qué sirve el metrónomo?", opciones: ["Mantener un pulso constante y exacto", "Afinar el instrumento", "Indicar la dinámica", "Escribir partituras"], respuesta: "Mantener un pulso constante y exacto" },
      a1: { pregunta: "Escucha: ¿qué nota suena durante el pulso lento?", nota: "E4", opciones: ["C4", "E4", "G4", "A4"] },
      a2: { pregunta: "Identifica la nota del pulso rápido.", nota: "G4", opciones: ["C4", "E4", "G4", "B4"] },
      m1: { instrucciones: "Coloca un golpe de bombo en cada tiempo del compás de 4/4 a tempo moderado (80 BPM).", compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Coloca bombo en tiempos 1 y 2, luego caja en tiempos 3 y 4. Siente la diferencia de densidad rítmica.", compas: 4, figura: "negra", tiempos: { kick: [1, 2], snare: [3, 4] }, tiemposFuertes: [1] },
      q3: { pregunta: "Al estudiar con metrónomo, ¿qué estrategia es más efectiva?", opciones: ["Comenzar lento y subir gradualmente", "Siempre al máximo para acostumbrarse", "Cambiar el tempo cada compás", "Apagarlo cuando se complica"], respuesta: "Comenzar lento y subir gradualmente" },
    },
  },
  // ── Lección 3: Compás (incluye acento natural y barras) ──────────────────
  {
    titulo: "Compás",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDMYfNX4n7OuD9pNPiwd4HC_QxGKLyEwlLnbHFXnK-0S2Wru41RMbSj-Q&s=10",
    descripcion: "Agrupa pulsos en 4/4, 3/4 y 2/4 y aprende a leer las barras de compás.",
    intro:
      "El compás organiza los pulsos en grupos regulares con un acento natural al inicio. La indicación de compás (numerador/denominador) dice cuántos pulsos hay y qué figura vale uno. Las barras de compás separan visualmente cada grupo en la partitura.",
    sections: [
      { title: "4/4 y su acento natural", body: "Cuatro tiempos por compás. El tiempo 1 es el más fuerte, el 3 medio y el 2 y 4 débiles.", example: "FUERTE-débil-medio-débil | 1-2-3-4 |" },
      { title: "3/4 y 2/4", body: "3/4 tiene tres tiempos y sensación de vals; 2/4 tiene dos y es común en marchas y polkas. En ambos el primer tiempo es el fuerte.", example: "3/4: FUERTE-débil-débil | 2/4: FUERTE-débil" },
      { title: "Barras de compás", body: "La barra simple separa compases; la doble marca el final de una sección; la de repetición indica tocar de nuevo.", example: "| c1 | c2 || — |: sección A :| → tocar dos veces." },
    ],
    graphic: "4/4: ⬤ · ◉ · | ⬤ · ◉ · (⬤=fuerte, ◉=medio, ·=débil)",
    video_url: "https://www.youtube.com/results?search_query=compas+musical+4/4+3/4+explicacion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "En un compás de 4/4, ¿cuántos tiempos hay?", opciones: ["4", "3", "2", "6"], respuesta: "4" },
      q2: { pregunta: "¿Qué compás tiene sensación de vals?", opciones: ["3/4", "4/4", "2/4", "6/8"], respuesta: "3/4" },
      a1: { pregunta: "Escucha el acento fuerte: ¿qué nota lo marca?", nota: "C4", opciones: ["C4", "E4", "G4", "A4"] },
      a2: { pregunta: "¿Qué nota marca el inicio del segundo compás?", nota: "G4", opciones: ["C4", "E4", "G4", "A4"] },
      m1: { instrucciones: "Compás de 4/4: coloca bombo solo en el tiempo 1 (tiempo fuerte). Los tiempos 2, 3 y 4 quedan en silencio.", compas: 4, figura: "negra", tiempos: { kick: [1], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Compás de 3/4 (vals): coloca bombo en el tiempo 1 (acento) y caja en 2 y 3 (tiempos débiles).", compas: 3, figura: "negra", tiempos: { kick: [1], snare: [2, 3] }, tiemposFuertes: [1] },
      q3: { pregunta: "¿Qué indica una barra doble en la partitura?", opciones: ["Fin de sección o cambio", "Silencio largo", "Repetición obligatoria", "Cambio de instrumento"], respuesta: "Fin de sección o cambio" },
    },
  },
];

const ritmo_u2 = [
  // ── Lección 4: Redonda, blanca y negra ──────────────────────────────────
  {
    titulo: "Redonda, blanca y negra",
    imagen_url: "https://laguitarraflamenca.net/wp-content/uploads/2022/05/17_Figuras_silencios.jpg",
    descripcion: "Conoce las figuras de mayor duración.",
    intro:
      "Las figuras rítmicas representan la duración de los sonidos. La redonda es la más larga (4 tiempos), la blanca dura 2, y la negra 1.",
    sections: [
      { title: "Redonda", body: "Vale 4 tiempos en 4/4. Oval abierta sin plica.", example: "○ — dura todo el compás de 4/4." },
      { title: "Blanca", body: "Vale 2 tiempos. Oval abierta con plica.", example: "𝅗𝅥 — dos blancas llenan un compás de 4/4." },
      { title: "Negra", body: "Vale 1 tiempo. Oval rellena con plica.", example: "♩ — cuatro negras llenan un compás de 4/4." },
    ],
    graphic: "○ = 4 | 𝅗𝅥 𝅗𝅥 = 4 | ♩ ♩ ♩ ♩ = 4",
    video_url: "https://www.youtube.com/results?search_query=figuras+musicales+redonda+blanca+negra",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos tiempos vale una redonda en 4/4?", opciones: ["4", "2", "1", "8"], respuesta: "4" },
      q2: { pregunta: "¿Qué diferencia visual tiene la blanca respecto a la negra?", opciones: ["Oval abierta vs oval rellena", "Sin plica vs con plica", "Con punto vs sin punto", "Línea doble vs línea simple"], respuesta: "Oval abierta vs oval rellena" },
      a1: { pregunta: "Escucha la nota larga: ¿cuál es?", nota: "C4", opciones: ["C4", "D4", "E4", "G4"] },
      a2: { pregunta: "¿Qué nota se repite cuatro veces (negras)?", nota: "E4", opciones: ["C4", "D4", "E4", "F4"] },
      m1: { instrucciones: "Coloca cuatro golpes de bombo en negra (♩): uno en cada tiempo del compás de 4/4.", compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Representa una blanca como un golpe de bombo al inicio del tiempo 1 y deja libre el tiempo 2; luego coloca caja en los tiempos 3 y 4 como negras.", compas: 4, figura: "negra", tiempos: { kick: [1], snare: [3, 4] }, tiemposFuertes: [1] },
      q3: { pregunta: "¿Cuántas blancas caben en un compás de 4/4?", opciones: ["2", "4", "1", "3"], respuesta: "2" },
    },
  },
  // ── Lección 5: Corcheas ──────────────────────────────────────────────────
  {
    titulo: "Corcheas",
    imagen_url: "https://laguitarraflamenca.net/wp-content/uploads/2022/05/17_Figuras_silencios.jpg",
    descripcion: "Divide el tiempo en dos partes iguales para crear movimiento.",
    intro:
      "Dividir el pulso en partes iguales da acceso a ritmos más ágiles. La corchea vale medio tiempo: dos corcheas forman una negra. Es la subdivisión base para leer casi cualquier ritmo popular.",
    sections: [
      { title: "Corchea", body: "Vale medio tiempo. En pares forman una negra.", example: "♪♪ = ♩ — dos corcheas = una negra." },
      { title: "Grupos de corcheas", body: "Las corcheas se agrupan con una viga horizontal para facilitar la lectura.", example: "♩♫♩ — la viga une las corcheas del mismo grupo." },
      { title: "Y la semicorchea", body: "Es aún más rápida: vale un cuarto de tiempo (cuatro forman una negra). Por ahora basta con reconocerla.", example: "♬♬♬♬ = ♩" },
    ],
    graphic: "♩ = ♪♪ = ♬♬♬♬",
    video_url: "https://www.youtube.com/results?search_query=corcheas+ritmo+musical",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántas corcheas caben en una negra?", opciones: ["2", "4", "1", "8"], respuesta: "2" },
      q2: { pregunta: "¿Cuántas corcheas equivalen a una blanca?", opciones: ["4", "2", "8", "16"], respuesta: "4" },
      a1: { pregunta: "Escucha el par de corcheas: ¿qué nota son?", nota: "D4", opciones: ["C4", "D4", "E4", "G4"] },
      a2: { pregunta: "¿Cuál nota suena como grupo de corcheas?", nota: "G4", opciones: ["C4", "E4", "G4", "B4"] },
      m1: { instrucciones: "Divide el compás en corcheas (♪): coloca hi-hat en cada corchea (8 golpes en 4 tiempos) para sentir la subdivisión.", compas: 8, figura: "corchea", tiempos: { kick: [1, 5], snare: [3, 7], hihat: [1, 2, 3, 4, 5, 6, 7, 8] }, tiemposFuertes: [1, 5] },
      m2: { instrucciones: "Patrón mixto simplificado: coloca bombo en 1 y 3, y caja en 2 y 4 para sentir alternancia de pulsos antes de subdividir en corcheas.", compas: 4, figura: "negra", tiempos: { kick: [1, 3], snare: [2, 4] }, tiemposFuertes: [1] },
      q3: { pregunta: "Al leer corcheas agrupadas con viga, ¿qué indica la viga?", opciones: ["Que pertenecen al mismo grupo rítmico", "Que son más fuertes", "Que duran más", "Que son silencios"], respuesta: "Que pertenecen al mismo grupo rítmico" },
    },
  },
  // ── Lección 6: Silencios ─────────────────────────────────────────────────
  {
    titulo: "Silencios",
    imagen_url: "https://laguitarraflamenca.net/wp-content/uploads/2022/05/17_Figuras_silencios.jpg",
    descripcion: "Los silencios son música: aprende su valor y su poder expresivo.",
    intro:
      "El silencio no es ausencia de música; es parte del discurso musical. Los silencios tienen los mismos valores que las figuras: el silencio de redonda llena un compás entero de 4/4.",
    sections: [
      { title: "Silencio de redonda", body: "Dura 4 tiempos. Se representa como un rectángulo colgante.", example: "𝄻 — todo el compás de 4/4 en silencio." },
      { title: "Silencio de negra", body: "Dura 1 tiempo. Es el más común en ritmos populares.", example: "𝄽 — un tiempo de pausa." },
      { title: "Expresividad", body: "Un silencio en el lugar correcto puede ser más poderoso que una nota.", example: "La pausa antes del clímax de una canción." },
    ],
    graphic: "𝄻=4t | 𝄼 𝄼=4t | 𝄽 𝄽 𝄽 𝄽=4t",
    video_url: "https://www.youtube.com/results?search_query=silencios+musicales+valores+ritmo",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos tiempos dura el silencio de redonda?", opciones: ["4", "2", "1", "3"], respuesta: "4" },
      q2: { pregunta: "¿Por qué los silencios son importantes en la música?", opciones: ["Dan forma al fraseo y tensión expresiva", "Son errores que se deben evitar", "Solo aparecen al final", "Indican repetición"], respuesta: "Dan forma al fraseo y tensión expresiva" },
      a1: { pregunta: "Escucha: ¿qué nota viene DESPUÉS del silencio?", nota: "C4", opciones: ["C4", "D4", "E4", "G4"] },
      a2: { pregunta: "Identifica la nota que suena tras la pausa larga.", nota: "G4", opciones: ["C4", "E4", "G4", "A4"] },
      m1: { instrucciones: "Patrón con silencios: coloca bombo en tiempos 1 y 3. Los tiempos 2 y 4 son SILENCIO. El silencio forma parte del ritmo.", compas: 4, figura: "negra", tiempos: { kick: [1, 3], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Patrón nota-silencio-nota-nota: bombo en tiempo 1, silencio en 2, caja en 3 y 4. El silencio en el tiempo 2 crea tensión.", compas: 4, figura: "negra", tiempos: { kick: [1], snare: [3, 4] }, tiemposFuertes: [1] },
      q3: { pregunta: "Un silencio de negra dentro de un compás de 4/4 ocupa:", opciones: ["1 tiempo", "2 tiempos", "Todo el compás", "Medio tiempo"], respuesta: "1 tiempo" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2: MELODÍA (2 unidades, 6 lecciones)
// ═══════════════════════════════════════════════════════════════════════════════

const melodia_u1 = [
  // ── Lección 7: Notas musicales (incluye octavas) ─────────────────────────
  {
    titulo: "Notas musicales",
    descripcion: "Aprende los nombres de las siete notas, su ubicación en el teclado y las octavas.",
    intro: "Las siete notas (Do-Re-Mi-Fa-Sol-La-Si / C-D-E-F-G-A-B) son los bloques con los que se construye toda la música occidental. Se repiten en distintas alturas llamadas octavas.",
    sections: [
      { title: "Las siete notas", body: "Do-Re-Mi-Fa-Sol-La-Si en sistema latino; C-D-E-F-G-A-B en anglosajón.", example: "Do=C, Re=D, Mi=E, Fa=F, Sol=G, La=A, Si=B." },
      { title: "En el teclado", body: "Las teclas blancas corresponden a las notas naturales. Las teclas negras son alteraciones.", example: "C D E F G A B son todas teclas blancas." },
      { title: "Octavas", body: "Una octava es la distancia entre dos notas con el mismo nombre: la frecuencia se duplica. C4 es el Do central.", example: "C4 = 261.6 Hz; C5 = 523.2 Hz (el doble)." },
    ],
    graphic: "C D E F G A B C (una octava completa)",
    video_url: "https://www.youtube.com/results?search_query=notas+musicales+do+re+mi+octavas+principiantes",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es el equivalente anglosajón de 'Sol'?", opciones: ["G", "A", "F", "E"], respuesta: "G" },
      q2: { pregunta: "¿Qué sucede con la frecuencia al subir una octava?", opciones: ["Se duplica", "Se triplica", "Se mantiene igual", "Se reduce a la mitad"], respuesta: "Se duplica" },
      a1: { pregunta: "Escucha y selecciona la nota.", nota: "C4", opciones: ["C4", "D4", "E4", "F4"] },
      a2: { pregunta: "¿Cuál de estas notas es más aguda?", nota: "E4", opciones: ["C4", "D4", "E4", "F4"] },
      m1: { pregunta: "Coloca C4-D4-E4 en el editor.", notas: ["C4", "D4", "E4"] },
      m2: { pregunta: "Construye: C4-E4-G4-C5 (Do-Mi-Sol-Do agudo).", notas: ["C4", "E4", "G4", "C5"] },
      q3: { pregunta: "¿Por qué es útil conocer tanto el sistema latino como el anglosajón?", opciones: ["Para comunicarse con músicos de distintas tradiciones", "Solo para leer partituras antiguas", "No tiene utilidad práctica", "Solo lo usan los pianistas"], respuesta: "Para comunicarse con músicos de distintas tradiciones" },
    },
  },
  // ── Lección 8: Sistema anglosajón y alteraciones ─────────────────────────
  {
    titulo: "Sistema anglosajón y alteraciones",
    descripcion: "Domina la notación en letras y las notas con sostenidos y bemoles.",
    intro: "El sistema anglosajón (A-B-C-D-E-F-G) es el estándar internacional en partituras, tablaturas y software musical. Añade sostenidos (#) y bemoles (b) para las alteraciones.",
    sections: [
      { title: "Letras y alteraciones", body: "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B", example: "C# = Do sostenido = mismo sonido que Db (Re bemol)." },
      { title: "Enarmonía", body: "Dos notas con distinto nombre pero el mismo sonido (C# = Db).", example: "En el teclado, la misma tecla negra puede llamarse C# o Db." },
      { title: "Uso en software", body: "DAW, MIDI y apps de notación usan sistema anglosajón.", example: "En TeoLearn, C4=Do central; A4=La de 440 Hz." },
    ],
    graphic: "C - C# - D - D# - E - F - F# - G - G# - A - A# - B",
    video_url: "https://www.youtube.com/results?search_query=sistema+anglosajón+notas+musicales",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué nombre reciben las notas con el mismo sonido pero distinto nombre?", opciones: ["Enarmónicas", "Diatónicas", "Cromáticas", "Tónicas"], respuesta: "Enarmónicas" },
      q2: { pregunta: "¿Cuántas notas hay en una octava cromática (incluyendo sostenidos)?", opciones: ["12", "7", "8", "5"], respuesta: "12" },
      a1: { pregunta: "Escucha: ¿es C4 o C#4?", nota: "C4", opciones: ["C4", "C#4", "D4", "Db4"] },
      a2: { pregunta: "Identifica la nota alterada.", nota: "D4", opciones: ["C4", "D4", "E4", "F4"] },
      m1: { pregunta: "Escribe C4-D4-E4-G4.", notas: ["C4", "D4", "E4", "G4"] },
      m2: { pregunta: "Construye C4-E4-G4-B4 (tétrada de C mayor).", notas: ["C4", "E4", "G4", "B4"] },
      q3: { pregunta: "C# y Db son enarmónicas porque:", opciones: ["Suenan igual pero se escriben diferente", "Son la misma nota escrita igual", "Tienen distinta altura", "Son de octavas distintas"], respuesta: "Suenan igual pero se escriben diferente" },
    },
  },
  // ── Lección 9: Pentagrama y clave de Sol ─────────────────────────────────
  {
    titulo: "Pentagrama y clave de Sol",
    descripcion: "Lee la herramienta visual que lleva la música al papel.",
    intro: "El pentagrama son las cinco líneas horizontales donde se escribe la música. La clave de Sol (𝄞) se coloca al inicio y fija la segunda línea como G4; de ahí se deduce el nombre de todas las notas.",
    sections: [
      { title: "Líneas y espacios", body: "Cinco líneas numeradas de abajo (1) hacia arriba (5), con cuatro espacios entre ellas. Las notas se escriben en líneas o espacios.", example: "Línea 1: E4 | Espacio 1: F4 | Línea 2: G4..." },
      { title: "La clave de Sol", body: "El símbolo 𝄞 rodea la segunda línea, que queda fija como G4. Se usa en piano (mano derecha), guitarra, violín y voz.", example: "Líneas en clave de Sol: E-G-B-D-F (Every Good Boy Does Fine)." },
      { title: "Líneas adicionales", body: "Para notas fuera del rango del pentagrama se añaden líneas cortas.", example: "Do central (C4) está en una línea adicional debajo de la línea 1." },
    ],
    graphic: "𝄞 ─── F ─── D ─── B ─── G ─── E ─── (líneas, de arriba a abajo)",
    video_url: "https://www.youtube.com/results?search_query=pentagrama+clave+de+sol+lectura+notas",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántas líneas tiene el pentagrama?", opciones: ["5", "4", "6", "7"], respuesta: "5" },
      q2: { pregunta: "Las notas de las líneas en clave de Sol son:", opciones: ["E-G-B-D-F", "C-D-E-F-G", "A-B-C-D-E", "F-A-C-E-G"], respuesta: "E-G-B-D-F" },
      a1: { pregunta: "Escucha la nota de la primera línea (clave de Sol).", nota: "E4", opciones: ["C4", "D4", "E4", "F4"] },
      a2: { pregunta: "Escucha la nota de referencia de la clave de Sol.", nota: "G4", opciones: ["E4", "F4", "G4", "A4"] },
      m1: { pregunta: "Escribe las notas de las líneas: E4-G4-B4.", notas: ["E4", "G4", "B4"] },
      m2: { pregunta: "Escribe G4-A4-B4 (línea 2, espacio 2, línea 3).", notas: ["G4", "A4", "B4"] },
      q3: { pregunta: "¿Qué línea del pentagrama fija la clave de Sol?", opciones: ["Segunda", "Primera", "Tercera", "Cuarta"], respuesta: "Segunda" },
    },
  },
];

const melodia_u2 = [
  // ── Lección 10: Intervalos ───────────────────────────────────────────────
  {
    titulo: "Intervalos",
    descripcion: "Mide la distancia entre notas: el vocabulario de la melodía.",
    intro: "Un intervalo es la distancia en altura entre dos notas. Es el vocabulario con el que analizamos y componemos melodías: una segunda es un paso, una quinta es un salto amplio. También determina si dos notas suenan estables o tensas.",
    sections: [
      { title: "Tipos de intervalo", body: "Unísono (0), segunda (2), tercera (3), cuarta (4), quinta (5), octava (8).", example: "C→D = 2ª; C→E = 3ª; C→G = 5ª." },
      { title: "Grados y saltos", body: "Moverse de nota en nota (segundas) es movimiento por grado y es fácil de cantar. Los saltos (3ª o más) añaden energía y tensión.", example: "C-D-E-F-G es por grado; C-E-G-C tiene saltos." },
      { title: "Consonancia y disonancia", body: "Los intervalos de 3ª, 5ª y 8ª suenan estables (consonantes). Los de 2ª y 7ª suenan tensos (disonantes) y piden resolver.", example: "B→C (7ª resolviendo a 8ª): la tensión se relaja." },
    ],
    graphic: "C D E F G A B C | 2ª 3ª 4ª 5ª 6ª 7ª 8ª",
    video_url: "https://www.youtube.com/results?search_query=intervalos+musicales+teoria+practica",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué intervalo hay entre C y G?", opciones: ["5ª (quinta)", "3ª (tercera)", "4ª (cuarta)", "6ª (sexta)"], respuesta: "5ª (quinta)" },
      q2: { pregunta: "¿Qué tipo de movimiento melódico usa solo segundas?", opciones: ["Movimiento por grado", "Salto de octava", "Movimiento cromático", "Arpegio"], respuesta: "Movimiento por grado" },
      a1: { pregunta: "Escucha el intervalo: ¿es una 2ª o una 5ª?", nota: "D4", opciones: ["C4", "D4", "E4", "G4"] },
      a2: { pregunta: "¿Qué nota forma una 3ª con C4?", nota: "E4", opciones: ["D4", "E4", "F4", "G4"] },
      m1: { pregunta: "Construye el intervalo de 5ª: C4-G4.", notas: ["C4", "G4"] },
      m2: { pregunta: "Escribe una melodía por grado: C4-D4-E4-F4.", notas: ["C4", "D4", "E4", "F4"] },
      q3: { pregunta: "¿Qué intervalos se consideran consonantes?", opciones: ["3ª, 5ª y 8ª", "2ª y 7ª", "Solo la 2ª", "Ninguno"], respuesta: "3ª, 5ª y 8ª" },
    },
  },
  // ── Lección 11: Escala mayor ─────────────────────────────────────────────
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
    video_url: "https://www.youtube.com/results?search_query=escala+mayor+teoria+construccion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es la fórmula de la escala mayor?", opciones: ["T-T-S-T-T-T-S", "T-S-T-T-S-T-T", "S-T-T-T-S-T-T", "T-T-T-S-T-T-S"], respuesta: "T-T-S-T-T-T-S" },
      q2: { pregunta: "¿Qué grado de la escala mayor se llama 'Dominante'?", opciones: ["5to", "3er", "7mo", "1ro"], respuesta: "5to" },
      a1: { pregunta: "Escucha la tónica de la escala mayor.", nota: "C4", opciones: ["C4", "D4", "E4", "G4"] },
      a2: { pregunta: "¿Cuál es el 5to grado (Dominante) de C mayor?", nota: "G4", opciones: ["E4", "F4", "G4", "A4"] },
      m1: { pregunta: "Escribe los primeros 4 grados de C mayor: C4-D4-E4-F4.", notas: ["C4", "D4", "E4", "F4"] },
      m2: { pregunta: "Completa la escala: E4-F4-G4-A4-B4-C5.", notas: ["E4", "F4", "G4", "A4", "B4", "C5"] },
      q3: { pregunta: "¿Por qué el 7mo grado se llama 'Sensible'?", opciones: ["Tiende a resolver hacia la tónica", "Es el más grave", "Siempre es bemol", "Define el modo"], respuesta: "Tiende a resolver hacia la tónica" },
    },
  },
  // ── Lección 12: Escala menor ─────────────────────────────────────────────
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
    video_url: "https://www.youtube.com/results?search_query=escala+menor+natural+teoria",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es la relativa menor de C mayor?", opciones: ["A menor", "E menor", "D menor", "G menor"], respuesta: "A menor" },
      q2: { pregunta: "¿Qué grados de la escala menor son un semitono más bajos que en la mayor?", opciones: ["3ro, 6to y 7mo", "1ro y 5to", "2do y 4to", "Solo el 3ro"], respuesta: "3ro, 6to y 7mo" },
      a1: { pregunta: "Escucha la tónica de A menor.", nota: "A4", opciones: ["G4", "A4", "B4", "C5"] },
      a2: { pregunta: "¿Cuál es la 3ª de A menor?", nota: "C5", opciones: ["B4", "C5", "D5", "E5"] },
      m1: { pregunta: "Escribe A4-B4-C5-D5 (inicio de A menor).", notas: ["A4", "B4", "C5", "D5"] },
      m2: { pregunta: "Construye: E4-F4-G4-A4 (mitad de la escala).", notas: ["E4", "F4", "G4", "A4"] },
      q3: { pregunta: "Escala mayor y su relativa menor:", opciones: ["Usan las mismas notas pero empiezan diferente", "Son completamente distintas", "Solo difieren en el tempo", "No tienen relación"], respuesta: "Usan las mismas notas pero empiezan diferente" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3: ARMONÍA (2 unidades, 5 lecciones)
// ═══════════════════════════════════════════════════════════════════════════════

const armonia_u1 = [
  // ── Lección 13: Tríadas ──────────────────────────────────────────────────
  {
    titulo: "Tríadas",
    descripcion: "Construye acordes de tres notas: la base de toda armonía.",
    intro: "Una tríada es un acorde de tres notas construido por terceras: tónica, 3ª y 5ª. Es la pieza básica con la que se construye toda la armonía.",
    sections: [
      { title: "Construcción", body: "Tónica + 3ª + 5ª desde cualquier nota.", example: "C mayor: C-E-G | A menor: A-C-E." },
      { title: "Notas simultáneas y arpegio", body: "Las tres notas pueden sonar a la vez (acorde) o una tras otra (arpegio).", example: "C-E-G arpegiado = sucesión de notas del acorde." },
      { title: "Consonancia", body: "Las tríadas mayores y menores son estables porque se forman con terceras y quintas, intervalos consonantes.", example: "C-E (3ª) y C-G (5ª) suenan estables juntos." },
    ],
    graphic: "Tríada = Tónica + 3ª + 5ª",
    video_url: "https://www.youtube.com/results?search_query=triadas+musicales+construccion",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué notas forman la tríada de C mayor?", opciones: ["C-E-G", "C-D-E", "C-F-A", "C-G-B"], respuesta: "C-E-G" },
      q2: { pregunta: "¿Cuántas notas tiene una tríada?", opciones: ["3", "2", "4", "5"], respuesta: "3" },
      a1: { pregunta: "Escucha el arpegio: ¿qué nota inicia el acorde?", nota: "C4", opciones: ["C4", "E4", "G4", "A4"] },
      a2: { pregunta: "¿Qué nota es la 5ª del acorde de C mayor?", nota: "G4", opciones: ["E4", "F4", "G4", "A4"] },
      m1: { pregunta: "Construye el acorde de C mayor: C4-E4-G4.", notas: ["C4", "E4", "G4"] },
      m2: { pregunta: "Construye el acorde de A menor: A4-C5-E5.", notas: ["A4", "C5", "E5"] },
      q3: { pregunta: "¿Qué es un arpegio?", opciones: ["Las notas del acorde tocadas sucesivamente", "Un acorde de cuatro notas", "Un intervalo de octava", "Una escala cromática"], respuesta: "Las notas del acorde tocadas sucesivamente" },
    },
  },
  // ── Lección 14: Acordes mayores y menores ────────────────────────────────
  {
    titulo: "Acordes mayores y menores",
    descripcion: "Distingue el color brillante del mayor y el color introspectivo del menor.",
    intro: "La diferencia entre un acorde mayor y uno menor es un solo semitono en la 3ª, pero cambia por completo la emoción: el mayor suena brillante y estable; el menor, melancólico o profundo.",
    sections: [
      { title: "Acorde mayor", body: "Tónica + 4 semitonos (3ª mayor) + 3 semitonos (5ª justa).", example: "C mayor = C + E + G (4st + 3st)." },
      { title: "Acorde menor", body: "Tónica + 3 semitonos (3ª menor) + 4 semitonos (5ª justa).", example: "A menor = A + C + E (3st + 4st)." },
      { title: "Comparar", body: "El mismo acorde en mayor o menor crea emociones distintas. Solo cambia la 3ª.", example: "C mayor (C-E-G) vs C menor (C-Eb-G)." },
    ],
    graphic: "Mayor: 4st + 3st | Menor: 3st + 4st",
    video_url: "https://www.youtube.com/results?search_query=acordes+mayores+y+menores+diferencia",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos semitonos hay entre la tónica y la 3ª de un acorde mayor?", opciones: ["4", "3", "5", "2"], respuesta: "4" },
      q2: { pregunta: "¿Qué acorde resulta de A-C-E?", opciones: ["A menor", "A mayor", "C mayor", "E menor"], respuesta: "A menor" },
      a1: { pregunta: "Escucha el acorde mayor: ¿cuál es su tónica?", nota: "C4", opciones: ["C4", "D4", "E4", "F4"] },
      a2: { pregunta: "¿Qué nota es la 3ª menor de A?", nota: "C5", opciones: ["B4", "C5", "D5", "E5"] },
      m1: { pregunta: "Construye G mayor: G4-B4-D5.", notas: ["G4", "B4", "D5"] },
      m2: { pregunta: "Construye E menor: E4-G4-B4.", notas: ["E4", "G4", "B4"] },
      q3: { pregunta: "La diferencia entre C mayor (C-E-G) y C menor (C-Eb-G) es:", opciones: ["Solo la 3ª (mayor o menor)", "La 5ª", "La tónica", "El ritmo"], respuesta: "Solo la 3ª (mayor o menor)" },
    },
  },
];

const armonia_u2 = [
  // ── Lección 15: Tónica, subdominante y dominante ─────────────────────────
  {
    titulo: "Tónica, subdominante y dominante",
    descripcion: "Las tres funciones que mueven toda la música tonal.",
    intro: "En el sistema tonal, cada acorde cumple una función: la Tónica es el hogar (reposo), la Subdominante prepara el movimiento y la Dominante genera la máxima tensión antes del reposo.",
    sections: [
      { title: "Tónica (I)", body: "El acorde de reposo. Inicio y final natural de una pieza.", example: "En C mayor: el acorde I = C-E-G." },
      { title: "Subdominante (IV)", body: "Prepara el movimiento. Salir de la tónica.", example: "En C mayor: IV = F-A-C. Se siente 'partiendo'." },
      { title: "Dominante (V)", body: "Máxima tensión. Quiere resolver urgentemente en la tónica.", example: "En C mayor: V = G-B-D. La sensible (B) empuja hacia C." },
    ],
    graphic: "I=reposo | IV=preparación | V=tensión → I=reposo",
    video_url: "https://www.youtube.com/results?search_query=tonica+subdominante+dominante+funciones+tonales",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué función armónica da sensación de reposo y hogar?", opciones: ["Tónica (I)", "Dominante (V)", "Subdominante (IV)", "Sensible (VII)"], respuesta: "Tónica (I)" },
      q2: { pregunta: "¿Qué nota de V7 genera la tensión que quiere resolver en I?", opciones: ["La sensible (7mo grado)", "La tónica", "La dominante", "La subdominante"], respuesta: "La sensible (7mo grado)" },
      a1: { pregunta: "Escucha el acorde: ¿es I o V?", nota: "C4", opciones: ["C4", "G4", "F4", "E4"] },
      a2: { pregunta: "¿Qué acorde es el V en C mayor?", nota: "G4", opciones: ["C4", "F4", "G4", "A4"] },
      m1: { pregunta: "Construye I-IV en C: C4-E4-G4 → F4-A4-C5.", notas: ["C4", "E4", "G4", "F4", "A4", "C5"] },
      m2: { pregunta: "Construye V-I: G4-B4-D5 → C4-E4-G4.", notas: ["G4", "B4", "D5", "C4", "E4", "G4"] },
      q3: { pregunta: "La progresión I→IV→V→I crea:", opciones: ["Un ciclo completo de reposo-movimiento-tensión-reposo", "Solo tensión sin resolver", "Solo movimiento sin inicio", "Una escala ascendente"], respuesta: "Un ciclo completo de reposo-movimiento-tensión-reposo" },
    },
  },
  // ── Lección 16: Cadencias ────────────────────────────────────────────────
  {
    titulo: "Cadencias",
    descripcion: "Los puntos de puntuación de la música: comas, puntos suspensivos y puntos finales.",
    intro: "Una cadencia es una fórmula armónica que concluye o marca una pausa en una frase musical. Las cadencias organizan el discurso armónico como la puntuación en un texto.",
    sections: [
      { title: "Cadencia auténtica (V→I)", body: "El cierre más firme: tensión total seguida de reposo.", example: "G mayor → C mayor: la cadencia definitiva." },
      { title: "Cadencia plagal (IV→I)", body: "Cierre suave, reposado. El 'Amén' de la iglesia.", example: "F mayor → C mayor: sensación de paz." },
      { title: "Semicadencia (→V)", body: "Terminar en V, sin resolver. Como una pregunta sin respuesta.", example: "...→ G mayor: 'algo más va a pasar'." },
    ],
    graphic: "Auténtica V→I | Plagal IV→I | Semi ...→V",
    video_url: "https://www.youtube.com/results?search_query=cadencias+musicales+autentica+plagal+semicadencia",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cómo se llama la cadencia V→I?", opciones: ["Auténtica", "Plagal", "Semicadencia", "Rota"], respuesta: "Auténtica" },
      q2: { pregunta: "La semicadencia termina en:", opciones: ["V (sin resolver)", "I (reposo)", "IV (preparación)", "VII (disminuido)"], respuesta: "V (sin resolver)" },
      a1: { pregunta: "Escucha: ¿termina la cadencia en reposo?", nota: "C4", opciones: ["C4", "G4", "F4", "E4"] },
      a2: { pregunta: "¿Qué acorde cierra la cadencia plagal?", nota: "C4", opciones: ["G4", "F4", "C4", "A4"] },
      m1: { pregunta: "Construye cadencia auténtica: G4-B4-D5 → C4-E4-G4.", notas: ["G4", "B4", "D5", "C4", "E4", "G4"] },
      m2: { pregunta: "Construye cadencia plagal: F4-A4-C5 → C4-E4-G4.", notas: ["F4", "A4", "C5", "C4", "E4", "G4"] },
      q3: { pregunta: "El 'Amén' al final de los himnos religiosos es un ejemplo de:", opciones: ["Cadencia plagal (IV→I)", "Cadencia auténtica", "Semicadencia", "Cadencia rota"], respuesta: "Cadencia plagal (IV→I)" },
    },
  },
  // ── Lección 17: Progresiones armónicas ───────────────────────────────────
  {
    titulo: "Progresiones armónicas",
    descripcion: "Conecta acordes con intención y aprende a leerlos con números romanos.",
    intro: "Una progresión es una secuencia de acordes con dirección funcional. Las progresiones crean expectativa, movimiento y cierre; son el esqueleto de una canción. Se describen con números romanos para que valgan en cualquier tonalidad.",
    sections: [
      { title: "Números romanos", body: "I-II-III-IV-V-VI-VII son los grados de la escala. Mayúscula = acorde mayor; minúscula = menor.", example: "En C: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am." },
      { title: "I-IV-V-I", body: "La progresión más clásica: blues, rock, folk, pop.", example: "C-F-G-C en C mayor." },
      { title: "I-V-vi-IV", body: "La progresión del pop moderno: usada en miles de canciones.", example: "C-G-Am-F en C mayor." },
      { title: "ii-V-I (jazz)", body: "La progresión fundamental del jazz. Tensión máxima antes del reposo.", example: "Dm-G-C en C mayor." },
    ],
    graphic: "I-IV-V-I | I-V-vi-IV | ii-V-I",
    video_url: "https://www.youtube.com/results?search_query=progresiones+armonicas+basicas+pop+jazz",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué acorde es el 'vi' en C mayor?", opciones: ["A menor", "F mayor", "G mayor", "D menor"], respuesta: "A menor" },
      q2: { pregunta: "Si analizas C-F-G-C en C mayor, ¿qué progresión es?", opciones: ["I-IV-V-I", "I-V-IV-I", "I-vi-IV-V", "ii-V-I-IV"], respuesta: "I-IV-V-I" },
      a1: { pregunta: "Escucha la tónica de la progresión.", nota: "C4", opciones: ["C4", "E4", "G4", "A4"] },
      a2: { pregunta: "¿Qué acorde sigue después de I en I-V-vi-IV?", nota: "G4", opciones: ["C4", "F4", "G4", "A4"] },
      m1: { pregunta: "Construye I-IV: C4-E4-G4 → F4-A4-C5.", notas: ["C4", "E4", "G4", "F4", "A4", "C5"] },
      m2: { pregunta: "Construye V-vi: G4-B4-D5 → A4-C5-E5.", notas: ["G4", "B4", "D5", "A4", "C5", "E5"] },
      q3: { pregunta: "¿Por qué la progresión I-V-vi-IV es tan efectiva en pop?", opciones: ["Combina reposo, tensión y movimiento de forma natural y memorable", "Es completamente disonante", "Evita la tónica durante toda la canción", "Usa solo acordes disminuidos"], respuesta: "Combina reposo, tensión y movimiento de forma natural y memorable" },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENSAMBLAJE FINAL: 3 módulos · 6 unidades · 17 lecciones · 119 ejercicios
// ═══════════════════════════════════════════════════════════════════════════════

export const learningPath = [
  {
    slug: "ritmo",
    titulo: "Ritmo",
    descripcion: "Pulso, tempo, compás, figuras y silencios.",
    imagen: moduleImages.ritmo,
    orden: 1,
    unidades: [
      unit("Fundamentos temporales", "Pulso, tempo (con metrónomo) y compás: cómo se organiza el tiempo.", 1, ritmo_u1, "ritmo"),
      unit("Figuras y silencios", "Redondas, blancas, negras, corcheas y silencios.", 2, ritmo_u2, "ritmo"),
    ],
  },
  {
    slug: "melodia",
    titulo: "Melodía",
    descripcion: "Notas, lectura en el pentagrama, intervalos y escalas.",
    imagen: moduleImages.melodia,
    orden: 2,
    unidades: [
      unit("Notas y lectura", "Nombres de las notas, sistema anglosajón y lectura en clave de Sol.", 1, melodia_u1, "melodia"),
      unit("Construcción melódica", "Intervalos, escala mayor y escala menor.", 2, melodia_u2, "melodia"),
    ],
  },
  {
    slug: "armonia",
    titulo: "Armonía",
    descripcion: "Tríadas, acordes mayores y menores, funciones tonales, cadencias y progresiones.",
    imagen: moduleImages.armonia,
    orden: 3,
    unidades: [
      unit("Acordes", "Tríadas y acordes mayores y menores.", 1, armonia_u1, "armonia"),
      unit("Funciones tonales", "Tónica, subdominante, dominante, cadencias y progresiones.", 2, armonia_u2, "armonia"),
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

// console.log(`✅ Currículo cargado: ${totalExercises} ejercicios en 17 lecciones.`);