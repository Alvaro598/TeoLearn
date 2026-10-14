const moduleImages = {
  ritmo: "https://plus.unsplash.com/premium_photo-1682745685000-e608a614bef5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

function notasDisponiblesParaMelodia(notas = []) {
  const base = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"];
  return Array.from(new Set([...base, ...notas])).sort(
    (a, b) => notaASemitonos(b) - notaASemitonos(a)
  );
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


const AUDIO_PRACTICAS = {
  "Pulso": [
    { pregunta: "Escucha A y B: ¿cuál mantiene pulsos a intervalos iguales?", subtipo: "secuencia-rítmica", referencia: "Un pulso estable mantiene la misma distancia entre golpes; el timbre no cambia la respuesta.", ejemplos: [{ id: "A", bpm: 80, golpes: [{ beat: 0 }, { beat: 1 }, { beat: 2 }, { beat: 3 }, { beat: 4 }] }, { id: "B", bpm: 80, golpes: [{ beat: 0 }, { beat: 1 }, { beat: 2.35 }, { beat: 3.6 }, { beat: 4.6 }] }], opciones: ["A", "B"], respuesta: "A" },
    { pregunta: "Después de cuatro pulsos guía, marca el siguiente pulso sin escucharlo.", subtipo: "reloj-interno", bpm: 80, pulsosGuia: 4, referencia: "Cuenta cada clic como un pulso y conserva el mismo espacio entre ellos.", respuesta: "sincronizado" },
  ],
  "Tempo": [
    { pregunta: "Escucha los dos ejemplos: ¿cuál tiene mayor tempo?", subtipo: "secuencia-rítmica", referencia: "El patrón conserva las mismas cuatro negras; solo cambia su velocidad.", ejemplos: [{ id: "A", bpm: 60, golpes: [0, 1, 2, 3].map((beat) => ({ beat })) }, { id: "B", bpm: 100, golpes: [0, 1, 2, 3].map((beat) => ({ beat })) }], opciones: ["A", "B"], respuesta: "B" },
    { pregunta: "Compara 60 y 100 BPM: ¿cuál mantiene menor espacio entre pulsos?", subtipo: "secuencia-rítmica", referencia: "Los patrones tienen los mismos cuatro golpes; en el más rápido, el espacio entre pulsos es menor.", ejemplos: [{ id: "A", bpm: 60, golpes: [0, 1, 2, 3].map((beat) => ({ beat })) }, { id: "B", bpm: 100, golpes: [0, 1, 2, 3].map((beat) => ({ beat })) }], opciones: ["A", "B"], respuesta: "B" },
  ],
  "Metrónomo": [
    { pregunta: "Escucha cuatro clics y marca el quinto cuando debería sonar.", subtipo: "reloj-interno", bpm: 72, pulsosGuia: 4, referencia: "Un metrónomo marca intervalos iguales. Sigue la distancia entre los clics, no su volumen.", respuesta: "sincronizado" },
    { pregunta: "¿Qué ejecución coincide con los clics del metrónomo?", subtipo: "secuencia-rítmica", referencia: "En A, las palmas caen junto con cada clic; en B, se adelantan medio pulso.", ejemplos: [{ id: "A", bpm: 80, golpes: [0, 1, 2, 3].flatMap((beat) => [{ beat, instrumento: "kick" }, { beat, instrumento: "snare" }]) }, { id: "B", bpm: 80, golpes: [0, 1, 2, 3].flatMap((beat) => [{ beat, instrumento: "kick" }, { beat: beat + 0.5, instrumento: "snare" }]) }], opciones: ["A", "B"], respuesta: "A" },
  ],
  "Compás": [
    { pregunta: "¿Cuál de los ejemplos agrupa los pulsos de tres en tres?", subtipo: "secuencia-rítmica", referencia: "Escucha el acento grave que reinicia cada grupo y cuenta los clics hasta el siguiente acento.", ejemplos: [{ id: "A", bpm: 80, golpes: Array.from({ length: 6 }, (_, i) => ({ beat: i, instrumento: i % 3 === 0 ? "kick" : "snare" })) }, { id: "B", bpm: 80, golpes: Array.from({ length: 8 }, (_, i) => ({ beat: i, instrumento: i % 4 === 0 ? "kick" : "snare" })) }], opciones: ["A: 3/4", "B: 4/4"], respuesta: "A: 3/4" },
    { pregunta: "En el compás de 4/4, ¿en qué pulso vuelve el acento principal?", subtipo: "secuencia-rítmica", referencia: "Cada acento grave inicia un nuevo grupo de cuatro pulsos.", ejemplos: [{ id: "A", bpm: 80, golpes: Array.from({ length: 8 }, (_, i) => ({ beat: i, instrumento: i % 4 === 0 ? "kick" : "snare" })) }], opciones: ["Pulso 1", "Pulso 2", "Pulso 3", "Pulso 4"], respuesta: "Pulso 1" },
  ],
  "Redonda, blanca y negra": [
    { pregunta: "Escucha el sonido sostenido y elige su duración en pulsos.", subtipo: "duracion-auditiva", referencia: "Referencia: negra = 1 pulso, blanca = 2 pulsos, redonda = 4 pulsos. Los ejemplos usan la misma nota.", duracionPulsos: 2, bpm: 80, opciones: ["1 pulso (negra)", "2 pulsos (blanca)", "4 pulsos (redonda)"], respuesta: "2 pulsos (blanca)" },
    { pregunta: "¿Cuál dura más: A o B?", subtipo: "duracion-comparar", referencia: "Compara cuánto se sostiene la misma nota en cada ejemplo.", ejemplos: [{ id: "A", duracionPulsos: 1 }, { id: "B", duracionPulsos: 4 }], bpm: 80, opciones: ["A", "B"], respuesta: "B" },
  ],
  "Corcheas": [
    { pregunta: "¿Qué ejemplo divide cada pulso en dos golpes iguales?", subtipo: "secuencia-rítmica", referencia: "Una negra tiene un golpe por pulso; dos corcheas caben en el mismo pulso.", ejemplos: [{ id: "A", bpm: 80, golpes: [0, 1, 2, 3].map((beat) => ({ beat })) }, { id: "B", bpm: 80, golpes: Array.from({ length: 8 }, (_, i) => ({ beat: i / 2 })) }], opciones: ["A: una negra por pulso", "B: dos corcheas por pulso"], respuesta: "B: dos corcheas por pulso" },
    { pregunta: "En el ejemplo subdividido, ¿cuántos golpes oyes por cada pulso?", subtipo: "secuencia-rítmica", referencia: "Cuenta ‘1 y 2 y’: el número y la palabra ‘y’ son las dos mitades del pulso.", ejemplos: [{ id: "A", bpm: 80, golpes: Array.from({ length: 8 }, (_, i) => ({ beat: i / 2 })) }], opciones: ["1", "2", "4"], respuesta: "2" },
  ],
  "Silencios": [
    { pregunta: "Cuenta cuatro pulsos: ¿en cuál falta el golpe?", subtipo: "secuencia-rítmica", referencia: "Mantén el conteo aunque no suene nada; el silencio ocupa su lugar en el pulso.", ejemplos: [{ id: "A", bpm: 80, golpes: [{ beat: 0 }, { beat: 1 }, { beat: 3 }] }], opciones: ["Pulso 1", "Pulso 2", "Pulso 3", "Pulso 4"], respuesta: "Pulso 3" },
    { pregunta: "¿Qué patrón contiene una pausa de un pulso?", subtipo: "secuencia-rítmica", referencia: "Ambos patrones mantienen cuatro pulsos de duración; uno omite el sonido del segundo pulso.", ejemplos: [{ id: "A", bpm: 80, golpes: [0, 1, 2, 3].map((beat) => ({ beat })) }, { id: "B", bpm: 80, golpes: [{ beat: 0 }, { beat: 2 }, { beat: 3 }] }], opciones: ["A", "B"], respuesta: "B" },
  ],
  "Notas musicales": [
    { pregunta: "Después de escuchar la referencia, identifica la nota del sonido objetivo.", subtipo: "nota-individual", referencia: "Usa esta secuencia de notas como referencia: Do4-Re4-Mi4-Fa4. Luego escucha el sonido objetivo.", nota: "E4", referenciaNotas: ["C4", "D4", "E4", "F4"], opciones: ["C4", "D4", "E4", "G4"], respuesta: "E4" },
    { pregunta: "¿La secuencia sube o baja de altura?", subtipo: "direccion-melodica", referencia: "Escucha la primera y la última nota; aquí interesa la dirección del contorno.", notas: ["C4", "E4", "G4", "C5"], opciones: ["Sube", "Baja", "Se mantiene igual"], respuesta: "Sube" },
  ],
  "Altura musical: graves y agudos": [
    { pregunta: "Escucha los dos sonidos. ¿Cuál es más agudo?", subtipo: "comparar-alturas", referencia: "Escucha ambos sonidos en orden y compara su altura.", notas: ["C4", "G4"], opciones: ["El primero", "El segundo"], respuesta: "El segundo" },
    { pregunta: "Escucha la secuencia Do → Re → Mi. ¿La melodía está ascendiendo o descendiendo?", subtipo: "direccion-melodica", referencia: "Compara la altura de cada nota con la anterior.", notas: ["C4", "D4", "E4"], opciones: ["Ascendiendo", "Descendiendo", "Mantiene la misma altura"], respuesta: "Ascendiendo" },
    { pregunta: "Escucha la secuencia Sol → Fa → Mi. ¿La melodía está ascendiendo o descendiendo?", subtipo: "direccion-melodica", referencia: "Compara la altura de cada nota con la anterior.", notas: ["G4", "F4", "E4"], opciones: ["Ascendiendo", "Descendiendo", "Mantiene la misma altura"], respuesta: "Descendiendo" },
    { pregunta: "Escucha los dos Do. ¿Qué ocurre?", subtipo: "comparar-alturas", referencia: "Las dos notas comparten el mismo nombre, pero están en registros distintos.", notas: ["C4", "C5"], opciones: ["Son la misma nota en diferentes alturas", "Son notas con nombres diferentes", "El segundo es un Re", "El primero es un Si"], respuesta: "Son la misma nota en diferentes alturas" },
  ],
  "Sistema anglosajón y alteraciones": [
    { pregunta: "Con Fa natural como referencia, identifica el sonido elevado un semitono.", subtipo: "nota-individual", referencia: "Fa sostenido está un semitono por encima de Fa natural.", nota: "F#4", notaReferencia: "F4", opciones: ["F4", "F#4", "G4", "E4"], respuesta: "F#4" },
    { pregunta: "Con Mi natural como referencia, identifica el sonido bajado un semitono.", subtipo: "nota-individual", referencia: "Mi bemol está un semitono por debajo de Mi natural.", nota: "D#4", notaReferencia: "E4", opciones: ["D4", "D#4", "E4", "F4"], respuesta: "D#4" },
  ],
 
  "Intervalos": [
    { pregunta: "¿Qué intervalo oyes entre Do4 y Sol4?", subtipo: "intervalo", referencia: "Compara la distancia desde la nota inicial; la quinta es un salto más amplio que la segunda.", notas: ["C4", "G4"], opciones: ["2ª", "3ª", "5ª", "8ª"], respuesta: "5ª" },
    { pregunta: "¿Cuál de estas distancias es una tercera mayor desde Do4?", subtipo: "intervalo", referencia: "Escucha Do4 seguido de Mi4 y compara ese salto con las opciones.", notas: ["C4", "E4"], opciones: ["2ª", "3ª mayor", "4ª", "5ª"], respuesta: "3ª mayor" },
  ],
  "Escala mayor": [
    { pregunta: "Compara A y B: ¿cuál sigue la fórmula de la escala mayor?", subtipo: "comparar-escalas", referencia: "Escucha el patrón de tonos y semitonos; en Do mayor, los semitonos quedan entre Mi-Fa y Si-Do.", ejemplos: [{ id: "A", notas: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"] }, { id: "B", notas: ["C4", "D4", "D#4", "F4", "G4", "G#4", "A#4", "C5"] }], opciones: ["A", "B"], respuesta: "A" },
    { tipo: "quiz", pregunta: "En Do mayor, ¿qué pareja de notas queda separada por un semitono al final de la escala?", opciones: ["Si4-Do5", "La4-Si4", "Sol4-La4", "Fa4-Sol4"], respuesta: "Si4-Do5" },
  ],
  "Escala menor": [
    { pregunta: "Compara las escalas A y B desde La: ¿cuál es menor natural?", subtipo: "comparar-escalas", referencia: "La menor natural usa la fórmula tono-semitono-tono-tono-semitono-tono-tono.", ejemplos: [{ id: "A", notas: ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"] }, { id: "B", notas: ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"] }], opciones: ["A", "B"], respuesta: "A" },
    { pregunta: "¿Qué intervalo forma la tercera de La menor con su tónica?", subtipo: "intervalo", referencia: "La y Do forman la tercera menor que distingue la escala menor natural desde su tónica.", notas: ["A4", "C5"], opciones: ["2ª mayor", "3ª menor", "3ª mayor", "4ª justa"], respuesta: "3ª menor" },
  ],
  "Tríadas": [
    { pregunta: "¿Cuál ejemplo toca la tríada de Do mayor como arpegio?", subtipo: "textura-acorde", referencia: "La misma tríada puede sonar simultánea como acorde o nota por nota como arpegio.", ejemplos: [{ id: "A", notas: ["C4", "E4", "G4"], modo: "acorde" }, { id: "B", notas: ["C4", "E4", "G4"], modo: "arpegio" }], opciones: ["A", "B"], respuesta: "B" },
    { pregunta: "¿Cuántas notas distintas oyes en el arpegio de la tríada?", subtipo: "contar-notas", referencia: "Una tríada contiene tónica, tercera y quinta; se oyen una tras otra en este ejemplo.", notas: ["C4", "E4", "G4"], opciones: ["2", "3", "4"], respuesta: "3" },
  ],
  "Acordes mayores y menores": [
    { pregunta: "Compara los dos acordes con la misma tónica: ¿cuál es menor?", subtipo: "comparar-acordes", referencia: "La raíz y la quinta se mantienen; solo cambia la tercera, que baja un semitono en el acorde menor.", ejemplos: [{ id: "A", notas: ["C4", "E4", "G4"] }, { id: "B", notas: ["C4", "D#4", "G4"] }], opciones: ["A", "B"], respuesta: "B" },
    { pregunta: "¿Qué tercera oyes sobre La: mayor o menor?", subtipo: "intervalo", referencia: "Compara La4 con Do5: hay tres semitonos, una tercera menor.", notas: ["A4", "C5"], opciones: ["3ª mayor", "3ª menor"], respuesta: "3ª menor" },
  ],
  "Tónica, subdominante y dominante": [
    { pregunta: "¿Qué progresión termina con una resolución de dominante a tónica?", subtipo: "comparar-progresiones", referencia: "La dominante crea tensión y la tónica ofrece reposo; escucha el acorde final de cada secuencia.", ejemplos: [{ id: "A", acordes: [["G4", "B4", "D5"], ["C4", "E4", "G4"]] }, { id: "B", acordes: [["C4", "E4", "G4"], ["F4", "A4", "C5"]] }], opciones: ["A", "B"], respuesta: "A" },
    { pregunta: "En C mayor, ¿qué función tiene el acorde final G-B-D?", subtipo: "comparar-acordes", referencia: "La referencia de tónica es C-E-G; compárala con G-B-D, el acorde que crea tensión antes del regreso.", ejemplos: [{ id: "A", notas: ["C4", "E4", "G4"] }, { id: "B", notas: ["G4", "B4", "D5"] }], opciones: ["A: tónica / reposo", "B: dominante / tensión"], respuesta: "B: dominante / tensión" },
  ],
  "Progresiones armónicas": [
    { pregunta: "Escucha la secuencia C-G-Am-F: ¿qué progresión representa?", subtipo: "progresion-comun", referencia: "En Do mayor, I-V-vi-IV equivale a Do-Sol-La menor-Fa.", progresion: [["C4", "E4", "G4"], ["G4", "B4", "D5"], ["A4", "C5", "E5"], ["F4", "A4", "C5"]], opciones: ["I-V-vi-IV", "I-IV-V-I", "ii-V-I"], respuesta: "I-V-vi-IV" },
    { pregunta: "¿Qué progresión vuelve al acorde de reposo después de pasar por IV y V?", subtipo: "progresion-comun", referencia: "Escucha C-F-G-C y sigue la tensión de Sol de vuelta al reposo en Do.", progresion: [["C4", "E4", "G4"], ["F4", "A4", "C5"], ["G4", "B4", "D5"], ["C4", "E4", "G4"]], opciones: ["I-IV-V-I", "I-V-vi-IV", "ii-V-I"], respuesta: "I-IV-V-I" },
  ],
};



function audio(order, title, slot, categoria, points = 15) {
  const practica = AUDIO_PRACTICAS[title]?.[slot];
  if (!practica) throw new Error(`Falta una práctica auditiva específica para ${title} (${slot + 1}).`);
  if (practica.tipo === "quiz") {
    return quiz(order, practica.pregunta, practica.opciones, practica.respuesta, points);
  }
  const { pregunta, respuesta, ...contenido } = practica;
  return {
    tipo: "auditivo",
    pregunta,
    contenido: { categoria, ...contenido },
    respuesta_correcta: typeof respuesta === "string" ? { respuesta } : respuesta,
    puntos: points,
    orden: order,
  };
}

// ─── Constructor MIDI consciente de categoría ─────────────────────────────────
function midi(order, def, categoria = "melodia", variante = 0, points = 20) {
  if (categoria === "ritmo") {
    if (def.subtipo === "duracion") {
      return {
        tipo: "midi",
        pregunta: def.instrucciones,
        contenido: {
          categoria: "ritmo",
          subtipo: "duracion",
          bpm: def.bpm || 80,
          referencia: "Compara sonidos de igual altura y timbre; cambia solo el tiempo durante el que se sostienen.",
          opciones: def.opciones || ["1 pulso", "2 pulsos", "4 pulsos"],
          instrucciones: def.instrucciones,
        },
        respuesta_correcta: { duracion: def.respuestaDuracion },
        puntos: points,
        orden: order,
      };
    }
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
        divisionPulso: figuraBase === "corchea" ? 0.5 : 1,
        bpm: def.bpm || 80,
        usarMetronomo: Boolean(def.usarMetronomo),
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
    const progresion = def.progresion || (gradosDelPrompt.length === stack.length
      ? gradosDelPrompt
      : progresionDesdeStack(stack, def.notas?.[0] || "C4"));

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
        notasDisponibles: notasDisponiblesParaMelodia(def.notas),
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
      notasDisponibles: notasDisponiblesParaMelodia(def.notas),
      columnas: Math.max(def.notas.length, 4),
      pista: [],
      instrucciones: def.pregunta,
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
function ejercicios7(def, categoria = "melodia", variante = 0, title = "", base = 1) {
  const practicasAuditivas = AUDIO_PRACTICAS[title] || [];
  if (practicasAuditivas.length > 2) {
    return [
      quiz(base, def.q3.pregunta, def.q3.opciones, def.q3.respuesta, 15),
      ...practicasAuditivas.map((_, slot) => audio(base + slot + 1, title, slot, categoria)),
      midi(base + 5, def.m1, categoria, variante),
      midi(base + 6, def.m2, categoria, variante + 1),
    ];
  }

  return [
    quiz(base, def.q1.pregunta, def.q1.opciones, def.q1.respuesta),
    quiz(base + 1, def.q2.pregunta, def.q2.opciones, def.q2.respuesta),
    audio(base + 2, title, 0, categoria),
    audio(base + 3, title, 1, categoria),
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
    ejercicios: ejercicios7(def.ejercicios, categoria, variante, def.titulo),
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
// MÓDULO 1: RITMO (2 unidades, 7 lecciones)
// ═══════════════════════════════════════════════════════════════════════════════

const ritmo_u1 = [
  // ── Lección 1: Pulso ─────────────────────────────────────────────────────
  {
    titulo: "Pulso",
    imagen_url: "https://images.unsplash.com/photo-1724185773486-0b39642e607e?q=80&w=1333&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Siente el latido constante que sostiene toda la música.",
    intro:
      "El pulso es un latido regular que organiza la música. Puede contener subdivisiones más rápidas, pero sigue siendo la referencia para caminar, palmear o tocar a tiempo.",
    sections: [
      { title: "¿Qué es el pulso?", body: "Una sucesión regular de tiempos iguales. Puedes marcarlo con el pie, palmas o un metrónomo.", example: "| 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 |" },
      { title: "Pulso corporal", body: "Antes de tocar cualquier instrumento, siente el pulso: camina al ritmo, aplaude, balancea la cabeza.", example: "Caminar: izq-der-izq-der al mismo tiempo que pasa la música." },
      { title: "Pulso y ritmo", body: "El pulso es la referencia regular; el ritmo distribuye sonidos y silencios sobre ella.", example: "Puedes caminar cuatro pasos parejos mientras una melodía cambia sus notas encima." },
    ],
    graphic: "→ · · · → · · · → (cada → es el pulso fuerte)",
    video_url: "https://www.youtube.com/embed/rnm5iontzFE",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué describe mejor el pulso musical?", opciones: ["Un tiempo constante e igual", "La distribución de sonidos y silencios", "La velocidad de los pulsos", "La división de un pulso en partes"], respuesta: "Un tiempo constante e igual" },
      q2: { pregunta: "¿Qué concepto describe mejor el pulso?", opciones: ["Un latido regular para orientarse", "La combinación de sonidos y silencios", "La velocidad general del latido", "La agrupación de pulsos en compases"], respuesta: "Un latido regular para orientarse" },
      m1: { instrucciones: "Coloca un golpe de bombo en cada uno de los 4 tiempos del compás.", compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Mantén el bombo en los cuatro pulsos aunque se oigan golpes de caja entre ellos.", compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [2, 4] }, tiemposFuertes: [1] },
      q3: { pregunta: "Un músico que 'pierde el pulso' significa que:", opciones: ["Acelera o frena sin control", "Mantiene estable el espacio entre pulsos", "Agrupa correctamente los tiempos", "Subdivide cada pulso en partes iguales"], respuesta: "Acelera o frena sin control" },
    },
  },
  // ── Lección 2: Tempo ─────────────────────────────────────────────────────
  {
    titulo: "Tempo",
    imagen_url: "https://images.unsplash.com/photo-1591025810539-a321000cda85?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Compara BPM y cambia la velocidad sin alterar el patrón rítmico.",
    intro: "El tempo es la velocidad del pulso y se expresa en pulsos por minuto (BPM). Un patrón conserva su organización rítmica aunque el pulso se acelere o desacelere.",
    sections: [
      { title: "BPM", body: "BPM significa 'pulsos por minuto'. 60 BPM = 1 pulso por segundo; 120 BPM = 2 pulsos por segundo.", example: "Canción lenta: 60-80 BPM. Canción rápida: 140-180 BPM." },
      { title: "Sensación de velocidad", body: "Los BPM describen la velocidad del pulso, pero el carácter también depende del patrón, el timbre y la interpretación.", example: "Un mismo ritmo de negras puede sonar reposado a 60 BPM y enérgico a 120 BPM." },
      { title: "Tempo y ritmo", body: "El tempo cambia la rapidez de los pulsos; el ritmo describe cómo se distribuyen los sonidos y silencios sobre ellos.", example: "Repite cuatro negras a 60 BPM y a 100 BPM: cambian los espacios, no el orden de los golpes." },
    ],
    graphic: "Largo ←────── Andante ──── Allegro ──── Presto →",
    // TODO: reemplazar por tu propio video (el original repetía el de "Pulso")
    video_url: "https://www.youtube.com/embed/139A-ovjygE",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué significa 120 BPM?", opciones: ["120 pulsos por minuto", "120 notas por compás", "120 compases por hora", "120 decibeles"], respuesta: "120 pulsos por minuto" },
      q2: { pregunta: "Si repites cuatro negras a 60 BPM y luego a 100 BPM, ¿qué cambió?", opciones: ["La velocidad del pulso", "El orden de los golpes", "La cantidad de pulsos", "La subdivisión de cada pulso"], respuesta: "La velocidad del pulso" },
      m1: { instrucciones: "Mantén el mismo patrón de cuatro golpes y reprodúcelo primero a 60 BPM.", bpm: 60, compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Coloca los cuatro golpes del kick y sube el tempo a 100 BPM.", bpm: 100, compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      q3: { pregunta: "¿Qué se conserva al aumentar el tempo de un patrón de cuatro negras?", opciones: ["El orden y la cantidad de golpes", "El espacio en segundos entre pulsos", "La cantidad de pulsos por minuto", "La duración total en segundos"], respuesta: "El orden y la cantidad de golpes" },
    },
  },
  {
    titulo: "Metrónomo",
    imagen_url: "https://www.ecured.cu/images/thumb/d/d7/METRONOMO.jpg/1200px-METRONOMO.jpg",
    descripcion: "Usa los clics como referencia y sincroniza tus golpes con un pulso estable.",
    intro: "El metrónomo produce pulsos regulares a un tempo elegido. Escuchar varios clics permite anticipar el siguiente y coordinar una interpretación sin acelerar ni retrasarse.",
    sections: [
      { title: "Escuchar el pulso", body: "Antes de tocar, escucha varios clics y encuentra el espacio regular entre ellos.", example: "A 80 BPM cada clic queda a tres cuartos de segundo del siguiente." },
      { title: "Sincronizarse", body: "Haz coincidir cada golpe con un clic; cuenta en voz baja si pierdes la referencia.", example: "Toca cuatro negras junto a cuatro clics, sin adelantar el siguiente golpe." },
      { title: "Practicar con intención", body: "Empieza a un tempo cómodo y ajusta la velocidad sin cambiar el patrón que practicas.", example: "Mantén el mismo patrón al pasar de 60 a 80 BPM." },
    ],
    graphic: "clic + golpe juntos | clic - silencio - clic - silencio",
    video_url: "https://www.youtube.com/embed/g-A_5znA8lw",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué función cumple el metrónomo al practicar?", opciones: ["Dar una referencia regular de pulso", "Cambiar la distribución del patrón", "Agrupar los pulsos en otro compás", "Dividir cada pulso en más partes"], respuesta: "Dar una referencia regular de pulso" },
      q2: { pregunta: "¿Qué conviene hacer antes de tocar junto al metrónomo?", opciones: ["Escuchar varios clics y encontrar el pulso", "Empezar entre dos clics", "Tocar más rápido que los clics", "Cambiar de tempo en cada golpe"], respuesta: "Escuchar varios clics y encontrar el pulso" },
      m1: { instrucciones: "Inicia el metrónomo a 80 BPM y coloca un golpe de bombo junto a cada uno de los cuatro clics.", bpm: 80, usarMetronomo: true, compas: 4, figura: "negra", tiempos: { kick: [1, 2, 3, 4], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Mantén el metrónomo a 80 BPM. Toca bombo en los clics 1 y 3 y deja los otros dos pulsos en silencio.", bpm: 80, usarMetronomo: true, compas: 4, figura: "negra", tiempos: { kick: [1, 3], snare: [] }, tiemposFuertes: [1, 3] },
      q3: { pregunta: "Si tus golpes se adelantan a los clics, ¿qué debes ajustar?", opciones: ["Tu sincronización con el pulso", "La subdivisión del pulso", "El acento del compás", "La cantidad de tiempos del patrón"], respuesta: "Tu sincronización con el pulso" },
    },
  },
  // ── Lección 4: Compás (incluye acento natural y barras) ──────────────────
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
    video_url: "https://www.youtube.com/embed/g-A_5znA8lw",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "En un compás de 4/4, ¿cuántos tiempos hay?", opciones: ["4", "3", "2", "6"], respuesta: "4" },
      q2: { pregunta: "¿Qué compás tiene sensación de vals?", opciones: ["3/4", "4/4", "2/4", "6/8"], respuesta: "3/4" },
      m1: { instrucciones: "Compás de 4/4: coloca bombo solo en el tiempo 1 (tiempo fuerte). Los tiempos 2, 3 y 4 quedan en silencio.", compas: 4, figura: "negra", tiempos: { kick: [1], snare: [] }, tiemposFuertes: [1] },
      m2: { instrucciones: "Compás de 3/4 (vals): coloca bombo en el tiempo 1 (acento) y caja en 2 y 3 (tiempos débiles).", compas: 3, figura: "negra", tiempos: { kick: [1], snare: [2, 3] }, tiemposFuertes: [1] },
      q3: { pregunta: "¿Qué indica una barra doble en la partitura?", opciones: ["Fin de sección o cambio", "Silencio largo", "Repetición obligatoria", "Cambio de instrumento"], respuesta: "Fin de sección o cambio" },
    },
  },
];

const ritmo_u2 = [
  // ── Lección 5: Redonda, blanca y negra ──────────────────────────────────
  {
    titulo: "Redonda, blanca y negra",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IrQuMyIBTsAn4x9FpZLF-zKK1V1lygZZexC0ARlfJg&s=10",
    descripcion: "Compara sonidos que duran uno, dos y cuatro pulsos.",
    intro:
      "Las figuras rítmicas representan la duración de los sonidos. La redonda es la más larga (4 tiempos), la blanca dura 2, y la negra 1.",
    sections: [
      { title: "Redonda", body: "Vale 4 tiempos en 4/4. Oval abierta sin plica.", example: "○ — dura todo el compás de 4/4." },
      { title: "Blanca", body: "Vale 2 tiempos. Oval abierta con plica.", example: "𝅗𝅥 — dos blancas llenan un compás de 4/4." },
      { title: "Negra", body: "Vale 1 tiempo. Oval rellena con plica.", example: "♩ — cuatro negras llenan un compás de 4/4." },
    ],
    graphic: "○ = 4 | 𝅗𝅥 𝅗𝅥 = 4 | ♩ ♩ ♩ ♩ = 4",
    video_url: "https://www.youtube.com/embed/0-gsoaQwF10",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos tiempos vale una redonda en 4/4?", opciones: ["4", "2", "1", "8"], respuesta: "4" },
      q2: { pregunta: "¿Qué diferencia visual tiene la blanca respecto a la negra?", opciones: ["Oval abierta vs oval rellena", "Sin plica vs con plica", "Con punto vs sin punto", "Línea doble vs línea simple"], respuesta: "Oval abierta vs oval rellena" },
      m1: { instrucciones: "Crea un sonido que dure cuatro pulsos (una redonda).", subtipo: "duracion", respuestaDuracion: "4 pulsos (redonda)", opciones: ["1 pulso (negra)", "2 pulsos (blanca)", "4 pulsos (redonda)"], bpm: 80 },
      m2: { instrucciones: "Crea un sonido que dure dos pulsos (una blanca).", subtipo: "duracion", respuestaDuracion: "2 pulsos (blanca)", opciones: ["1 pulso (negra)", "2 pulsos (blanca)", "4 pulsos (redonda)"], bpm: 80 },
      q3: { pregunta: "¿Cuántas blancas caben en un compás de 4/4?", opciones: ["2", "4", "1", "3"], respuesta: "2" },
    },
  },
  // ── Lección 6: Corcheas ──────────────────────────────────────────────────
  {
    titulo: "Corcheas",
    imagen_url: "https://i0.wp.com/creatumusica.art/wp-content/uploads/2025/01/corchea.png?resize=900%2C900&ssl=1",
    descripcion: "Divide el tiempo en dos partes iguales para crear movimiento.",
    intro:
      "Dividir el pulso en partes iguales da acceso a ritmos más ágiles. La corchea vale medio tiempo: dos corcheas forman una negra. Es la subdivisión base para leer casi cualquier ritmo popular.",
    sections: [
      { title: "Corchea", body: "Vale medio tiempo. En pares forman una negra.", example: "♪♪ = ♩ — dos corcheas = una negra." },
      { title: "Grupos de corcheas", body: "Las corcheas se agrupan con una viga horizontal para facilitar la lectura.", example: "♩♫♩ — la viga une las corcheas del mismo grupo." },
      { title: "Mantener el pulso", body: "Aunque suenen dos ataques por tiempo, el pulso principal conserva la misma distancia.", example: "Cuenta 1 y 2 y: los números caen en el pulso y cada y en su mitad." },
    ],
    graphic: "♩ = ♪♪ = ♬♬♬♬",
    video_url: "https://www.youtube.com/embed/t-RE_6V2Qxo",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántas corcheas caben en una negra?", opciones: ["2", "4", "1", "8"], respuesta: "2" },
      q2: { pregunta: "¿Cuántas corcheas equivalen a una blanca?", opciones: ["4", "2", "8", "16"], respuesta: "4" },
      m1: { instrucciones: "Divide el compás en corcheas (♪): coloca hi-hat en cada corchea (8 golpes en 4 tiempos) para sentir la subdivisión.", compas: 8, figura: "corchea", tiempos: { kick: [1, 5], snare: [3, 7], hihat: [1, 2, 3, 4, 5, 6, 7, 8] }, tiemposFuertes: [1, 5] },
      m2: { instrucciones: "Mantén el bombo en los pulsos 1 y 3 y toca Hi-Hat en las corcheas intermedias 2, 4, 6 y 8.", compas: 8, figura: "corchea", tiempos: { kick: [1, 5], snare: [], hihat: [2, 4, 6, 8] }, tiemposFuertes: [1, 5] },
      q3: { pregunta: "Al leer corcheas agrupadas con viga, ¿qué indica la viga?", opciones: ["Que pertenecen al mismo grupo rítmico", "Que son más fuertes", "Que duran más", "Que son silencios"], respuesta: "Que pertenecen al mismo grupo rítmico" },
    },
  },
  // ── Lección 7: Silencios ─────────────────────────────────────────────────
  {
    titulo: "Silencios",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrnq9iDTWwo0gQ0nQlUNoG5H2lZncVP1-NpcoYAkeueA11fC9JYL1b4FRP&s=10",
    descripcion: "Los silencios son música: aprende su valor y su poder expresivo.",
    intro:
      "El silencio no es ausencia de música; es parte del discurso musical. Los silencios tienen los mismos valores que las figuras: el silencio de redonda llena un compás entero de 4/4.",
    sections: [
      { title: "Silencio de redonda", body: "Dura 4 tiempos. Se representa como un rectángulo colgante.", example: "𝄻 — todo el compás de 4/4 en silencio." },
      { title: "Silencio de negra", body: "Dura 1 tiempo. Es el más común en ritmos populares.", example: "𝄽 — un tiempo de pausa." },
      { title: "Expresividad", body: "Un silencio en el lugar correcto puede ser más poderoso que una nota.", example: "La pausa antes del clímax de una canción." },
    ],
    graphic: "𝄻=4t | 𝄼 𝄼=4t | 𝄽 𝄽 𝄽 𝄽=4t",
    video_url: "https://www.youtube.com/embed/COucQG0TJJY",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos tiempos dura el silencio de redonda?", opciones: ["4", "2", "1", "3"], respuesta: "4" },
      q2: { pregunta: "¿Por qué los silencios son importantes en la música?", opciones: ["Dan forma al fraseo y tensión expresiva", "Son errores que se deben evitar", "Solo aparecen al final", "Indican repetición"], respuesta: "Dan forma al fraseo y tensión expresiva" },
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
  // ── Lección 8: Notas musicales (incluye octavas) ─────────────────────────
  {
    titulo: "Notas musicales",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ittEutkLPgO7nQeJJdrLVyhDcIcyGRjSCK2o_s2UuPEw0Ni8qlP2Rz0&s=10",
    descripcion: "Aprende los nombres de las siete notas, su ubicación en el teclado y las octavas.",
    intro: "Las siete notas (Do-Re-Mi-Fa-Sol-La-Si / C-D-E-F-G-A-B) son los bloques con los que se construye toda la música occidental. Se repiten en distintas alturas llamadas octavas.",
    sections: [
      { title: "Las siete notas", body: "Do-Re-Mi-Fa-Sol-La-Si en sistema latino; C-D-E-F-G-A-B en anglosajón.", example: "Do=C, Re=D, Mi=E, Fa=F, Sol=G, La=A, Si=B." },
      { title: "En el teclado", body: "Las teclas blancas corresponden a las notas naturales. Las teclas negras son alteraciones.", example: "C D E F G A B son todas teclas blancas." },
      { title: "Octavas", body: "Una octava es la distancia entre dos notas con el mismo nombre: la frecuencia se duplica. C4 es el Do central.", example: "C4 = 261.6 Hz; C5 = 523.2 Hz (el doble)." },
    ],
    graphic: "C D E F G A B C (una octava completa)",
    video_url: "https://www.youtube.com/embed/TI54ptywLi0",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántas notas naturales distintas hay antes de que la secuencia vuelva a empezar?", opciones: ["7", "5", "8", "12"], respuesta: "7" },
      q2: { pregunta: "¿Qué sucede con la frecuencia al subir una octava?", opciones: ["Se duplica", "Se triplica", "Se mantiene igual", "Se reduce a la mitad"], respuesta: "Se duplica" },
      m1: { pregunta: "Coloca C4-D4-E4 en el editor.", notas: ["C4", "D4", "E4"] },
      m2: { pregunta: "Construye: C4-E4-G4-C5 (Do-Mi-Sol-Do agudo).", notas: ["C4", "E4", "G4", "C5"] },
      q3: { pregunta: "¿Qué nota natural sigue después de Sol?", opciones: ["La", "Fa", "Si", "Mi"], respuesta: "La" },
    },
  },
  // ── Lección 9: Sistema anglosajón y alteraciones ─────────────────────────
  {
    titulo: "Sistema anglosajón y alteraciones",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT517Z2mklUxLbCQ4RoyHFu2I2wP-EzWmzlAXuGZPZVPzGWWXDvZ6g6kwaq&s=10",
    descripcion: "Domina la notación en letras y las notas con sostenidos y bemoles.",
    intro: "El sistema anglosajón (A-B-C-D-E-F-G) es el estándar internacional en partituras, tablaturas y software musical. Añade sostenidos (#) y bemoles (b) para las alteraciones.",
    sections: [
      { title: "Letras y alteraciones", body: "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B", example: "C# = Do sostenido = mismo sonido que Db (Re bemol)." },
      { title: "Enarmonía", body: "Dos notas con distinto nombre pero el mismo sonido (C# = Db).", example: "En el teclado, la misma tecla negra puede llamarse C# o Db." },
      { title: "Uso en software", body: "DAW, MIDI y apps de notación usan sistema anglosajón.", example: "En TeoLearn, C4=Do central; A4=La de 440 Hz." },
    ],
    graphic: "C - C# - D - D# - E - F - F# - G - G# - A - A# - B",

    video_url: "https://www.youtube.com/embed/H40gOyoNucA",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué nombre reciben las notas con el mismo sonido pero distinto nombre?", opciones: ["Enarmónicas", "Diatónicas", "Cromáticas", "Tónicas"], respuesta: "Enarmónicas" },
      q2: { pregunta: "¿Cuántas notas hay en una octava cromática (incluyendo sostenidos)?", opciones: ["12", "7", "8", "5"], respuesta: "12" },
      m1: { pregunta: "Escribe C4-D4-E4-G4.", notas: ["C4", "D4", "E4", "G4"] },
      m2: { pregunta: "Construye C4-E4-G4-B4 (tétrada de C mayor).", notas: ["C4", "E4", "G4", "B4"] },
      q3: { pregunta: "C# y Db son enarmónicas porque:", opciones: ["Suenan igual pero se escriben diferente", "Son la misma nota escrita igual", "Tienen distinta altura", "Son de octavas distintas"], respuesta: "Suenan igual pero se escriben diferente" },
    },
  },

  // ── Lección 10: Altura musical: graves y agudos ────────────────────────────
  {
    titulo: "Altura musical: graves y agudos",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXFYfWgi1ryfZkowBX7KlnZT0_DSe4sPueoyv5k5kQLPEjbeezTwuPsheD&s=10",
    descripcion: "Reconoce cómo las notas pueden sonar más graves o más agudas y relaciónalas con su posición en el piano.",
    intro: "La altura musical nos permite distinguir si un sonido es más grave o más agudo que otro. En el piano, al desplazarnos hacia la izquierda encontramos sonidos más graves y hacia la derecha sonidos más agudos. Una misma nota también puede aparecer en diferentes alturas, como Do grave y Do agudo.",
    sections: [
      {
        title: "¿Qué es la altura?",
        body: "La altura es la característica que nos permite percibir un sonido como grave o agudo. No debe confundirse con el volumen: un sonido puede ser fuerte y grave, o suave y agudo.",
        example: "Escucha primero un Do grave y después un Do agudo. El nombre de la nota es el mismo, pero la altura es diferente."
      },
      {
        title: "Graves y agudos en el piano",
        body: "En el piano, las notas de la zona izquierda producen sonidos más graves y las de la zona derecha producen sonidos más agudos. Por eso podemos visualizar la altura como un recorrido de izquierda a derecha.",
        example: "Do grave → Do central → Do agudo."
      },
      {
        title: "Subir y bajar de altura",
        body: "Cuando una melodía pasa de una nota a otra más aguda, decimos que la melodía asciende. Cuando pasa hacia una nota más grave, desciende.",
        example: "Do → Re → Mi → Fa: la melodía asciende. Sol → Fa → Mi → Re: la melodía desciende."
      },
      {
        title: "Una misma nota en diferentes alturas",
        body: "Las notas musicales pueden repetirse en diferentes registros. Por ejemplo, podemos encontrar varios Do a lo largo del teclado. Todos se llaman Do, pero no tienen la misma altura.",
        example: "Do grave → Do agudo. El nombre se mantiene, pero el segundo sonido está una octava más arriba."
      }
    ],
    graphic: "GRAVE  ←──────  Do  Re  Mi  Fa  Sol  La  Si  ──────→  AGUDO",
    video_url: "https://www.youtube.com/embed/r36kpteAUDY",
    xp: 70,
    ejercicios: {
      q1: {
        pregunta: "Escucha los dos sonidos. ¿Cuál es más agudo?",
        opciones: ["El segundo", "El primero", "Los dos tienen la misma altura", "No se puede saber"],
        respuesta: "El segundo"
      },

      q2: {
        pregunta: "En un piano, ¿hacia qué lado encontramos generalmente sonidos más graves?",
        opciones: ["Hacia la izquierda", "Hacia la derecha", "En el centro únicamente", "En las teclas negras únicamente"],
        respuesta: "Hacia la izquierda"
      },

      q3: {
        pregunta: "En un piano, ¿hacia qué lado encontramos generalmente sonidos más agudos?",
        opciones: ["Hacia la derecha", "Hacia la izquierda", "En el centro únicamente", "En las teclas negras únicamente"],
        respuesta: "Hacia la derecha"
      },

      q4: {
        pregunta: "Escucha la secuencia Do → Re → Mi. ¿La melodía está ascendiendo o descendiendo?",
        opciones: ["Ascendiendo", "Descendiendo", "Mantiene la misma altura", "No tiene dirección"],
        respuesta: "Ascendiendo"
      },

      q5: {
        pregunta: "Escucha la secuencia Sol → Fa → Mi. ¿La melodía está ascendiendo o descendiendo?",
        opciones: ["Descendiendo", "Ascendiendo", "Mantiene la misma altura", "No tiene dirección"],
        respuesta: "Descendiendo"
      },

      q6: {
        pregunta: "Escucha los dos Do. ¿Qué ocurre?",
        opciones: [
          "Son la misma nota en diferentes alturas",
          "Son notas con nombres diferentes",
          "El segundo es un Re",
          "El primero es un Si"
        ],
        respuesta: "Son la misma nota en diferentes alturas"
      },

      q7: {
        pregunta: "¿Cuál de estas secuencias representa un movimiento ascendente?",
        opciones: [
          "Do → Re → Mi → Fa",
          "Fa → Mi → Re → Do",
          "Sol → Fa → Mi → Re",
          "Mi → Re → Do → Si"
        ],
        respuesta: "Do → Re → Mi → Fa"
      },
      m1: { pregunta: "Construye una secuencia ascendente: Do4-Re4-Mi4-Fa4.", notas: ["C4", "D4", "E4", "F4"] },
      m2: { pregunta: "Construye una secuencia descendente: Sol4-Fa4-Mi4-Do4.", notas: ["G4", "F4", "E4", "C4"] },
    },
  },
];

const melodia_u2 = [
  // ── Lección 11: Intervalos ───────────────────────────────────────────────
  {
    titulo: "Intervalos",
    imagen_url: "https://upload.wikimedia.org/wikipedia/commons/c/c6/5_cz.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original",
    descripcion: "Mide la distancia entre notas: el vocabulario de la melodía.",
    intro: "Un intervalo es la distancia en altura entre dos notas. Es el vocabulario con el que analizamos y componemos melodías: una segunda es un paso, una quinta es un salto amplio. También determina si dos notas suenan estables o tensas.",
    sections: [
      { title: "Tipos de intervalo", body: "Unísono (0), segunda (2), tercera (3), cuarta (4), quinta (5), octava (8).", example: "C→D = 2ª; C→E = 3ª; C→G = 5ª." },
      { title: "Grados y saltos", body: "Moverse de nota en nota (segundas) es movimiento por grado y es fácil de cantar. Los saltos (3ª o más) añaden energía y tensión.", example: "C-D-E-F-G es por grado; C-E-G-C tiene saltos." },
      { title: "Consonancia y disonancia", body: "Los intervalos de 3ª, 5ª y 8ª suenan estables (consonantes). Los de 2ª y 7ª suenan tensos (disonantes) y piden resolver.", example: "B→C (7ª resolviendo a 8ª): la tensión se relaja." },
    ],
    graphic: "C D E F G A B C | 2ª 3ª 4ª 5ª 6ª 7ª 8ª",
    video_url: "https://www.youtube.com/embed/JpGVoaU5SBo",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué intervalo hay entre C y G?", opciones: ["5ª (quinta)", "3ª (tercera)", "4ª (cuarta)", "6ª (sexta)"], respuesta: "5ª (quinta)" },
      q2: { pregunta: "¿Qué tipo de movimiento melódico usa solo segundas?", opciones: ["Movimiento por grado", "Salto de octava", "Movimiento cromático", "Arpegio"], respuesta: "Movimiento por grado" },
      m1: { pregunta: "Construye el intervalo de 5ª: C4-G4.", notas: ["C4", "G4"] },
      m2: { pregunta: "Escribe una melodía por grado: C4-D4-E4-F4.", notas: ["C4", "D4", "E4", "F4"] },
      q3: { pregunta: "¿Qué intervalos se consideran consonantes?", opciones: ["3ª, 5ª y 8ª", "2ª y 7ª", "Solo la 2ª", "Ninguno"], respuesta: "3ª, 5ª y 8ª" },
    },
  },
  // ── Lección 12: Escala mayor ─────────────────────────────────────────────
  {
    titulo: "Escala mayor",
    imagen_url: "https://lh6.googleusercontent.com/proxy/NcLOnJ12XNE6JVCu3iR3YQBt3ndheE0i5CpWiUWmfdEZ60Uxr5HhbBYnKIhb7bdPDgKoP7udYbi5n6kR9LZkVAgVfYNSvAPZc3KODQ",
    descripcion: "La escala fundamental de la música occidental: su construcción y sonido.",
    intro: "La escala mayor es la columna vertebral de la armonía tonal. Su fórmula de tonos y semitonos (T-T-S-T-T-T-S) es el molde del que nacen acordes, melodías y progresiones.",
    sections: [
      { title: "Fórmula", body: "Tono-Tono-Semitono-Tono-Tono-Tono-Semitono.", example: "C mayor: C-D-E-F-G-A-B-C (sin alteraciones)." },
      { title: "Grados", body: "Cada nota de la escala tiene un número (1-7) y un nombre funcional.", example: "1=Tónica, 5=Dominante, 7=Sensible." },
      { title: "Carácter", body: "La escala mayor se asocia con estabilidad, alegría y claridad.", example: "La canción 'Happy Birthday' está en escala mayor." },
    ],
    graphic: "C-D-E-F-G-A-B-C | T T S T T T S",
    video_url: "https://www.youtube.com/embed/TCewqyPG2AQ",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es la fórmula de la escala mayor?", opciones: ["T-T-S-T-T-T-S", "T-S-T-T-S-T-T", "S-T-T-T-S-T-T", "T-T-T-S-T-T-S"], respuesta: "T-T-S-T-T-T-S" },
      q2: { pregunta: "¿Qué grado de la escala mayor se llama 'Dominante'?", opciones: ["5to", "3er", "7mo", "1ro"], respuesta: "5to" },
      m1: { pregunta: "Escribe los primeros 4 grados de C mayor: C4-D4-E4-F4.", notas: ["C4", "D4", "E4", "F4"] },
      m2: { pregunta: "Completa la escala: E4-F4-G4-A4-B4-C5.", notas: ["E4", "F4", "G4", "A4", "B4", "C5"] },
      q3: { pregunta: "¿Por qué el 7mo grado se llama 'Sensible'?", opciones: ["Tiende a resolver hacia la tónica", "Es el más grave", "Siempre es bemol", "Define el modo"], respuesta: "Tiende a resolver hacia la tónica" },
    },
  },
  // ── Lección 13: Escala menor ─────────────────────────────────────────────
  {
    titulo: "Escala menor",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqbRcxMHM1p7IbEuWwbWoXqxq3C9I4vY_4ymkyvhe93H09vUzUrq6sMWOZ&s=10",
    descripcion: "El modo que añade tensión, melancolía y color a la música.",
    intro: "La escala menor natural cambia el color sonoro respecto a la mayor: la 3ª, 6ª y 7ª son un semitono más bajas. Este pequeño cambio transforma completamente el carácter musical.",
    sections: [
      { title: "Fórmula menor natural", body: "T-S-T-T-S-T-T.", example: "A menor: A-B-C-D-E-F-G-A (sin alteraciones)." },
      { title: "Relativa menor", body: "Cada escala mayor tiene una escala menor relativa que usa las mismas notas.", example: "C mayor y A menor comparten C-D-E-F-G-A-B." },
      { title: "Carácter", body: "Se asocia con melancolía, tensión o misterio, aunque no siempre es 'triste'.", example: "El 'Vals de las flores' de Tchaikovsky es en menor." },
    ],
    graphic: "A-B-C-D-E-F-G-A | T S T T S T T",
    video_url: "https://www.youtube.com/embed/VW5WSFOuTpw",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuál es la relativa menor de C mayor?", opciones: ["A menor", "E menor", "D menor", "G menor"], respuesta: "A menor" },
      q2: { pregunta: "¿Qué grados de la escala menor son un semitono más bajos que en la mayor?", opciones: ["3ro, 6to y 7mo", "1ro y 5to", "2do y 4to", "Solo el 3ro"], respuesta: "3ro, 6to y 7mo" },
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
  // ── Lección 14: Tríadas ──────────────────────────────────────────────────
  {
    titulo: "Tríadas",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRacY8b96PGe4W2lP7Oqv3E5fMxA_wm47YS5eMbm8KIl-qu4ZUKk9QosMJ3&s=10",
    descripcion: "Construye acordes de tres notas: la base de toda armonía.",
    intro: "Una tríada es un acorde de tres notas construido por terceras: tónica, 3ª y 5ª. Es la pieza básica con la que se construye toda la armonía.",
    sections: [
      { title: "Construcción", body: "Tónica + 3ª + 5ª desde cualquier nota.", example: "C mayor: C-E-G | A menor: A-C-E." },
      { title: "Notas simultáneas y arpegio", body: "Las tres notas pueden sonar a la vez (acorde) o una tras otra (arpegio).", example: "C-E-G arpegiado = sucesión de notas del acorde." },
      { title: "Consonancia", body: "Las tríadas mayores y menores son estables porque se forman con terceras y quintas, intervalos consonantes.", example: "C-E (3ª) y C-G (5ª) suenan estables juntos." },
    ],
    graphic: "Tríada = Tónica + 3ª + 5ª",
    video_url: "https://www.youtube.com/embed/0t34DpUkQE0",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué notas forman la tríada de C mayor?", opciones: ["C-E-G", "C-D-E", "C-F-A", "C-G-B"], respuesta: "C-E-G" },
      q2: { pregunta: "¿Cuántas notas tiene una tríada?", opciones: ["3", "2", "4", "5"], respuesta: "3" },
      m1: { pregunta: "Construye el acorde de C mayor: C4-E4-G4.", notas: ["C4", "E4", "G4"], progresion: ["I"] },
      m2: { pregunta: "Construye el acorde de A menor: A4-C5-E5.", notas: ["A4", "C5", "E5"], progresion: ["i"] },
      q3: { pregunta: "¿Qué es un arpegio?", opciones: ["Las notas del acorde tocadas sucesivamente", "Un acorde de cuatro notas", "Un intervalo de octava", "Una escala cromática"], respuesta: "Las notas del acorde tocadas sucesivamente" },
    },
  },
  // ── Lección 15: Acordes mayores y menores ────────────────────────────────
  {
    titulo: "Acordes mayores y menores",
    imagen_url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitlrI8SSJOO4l-Ii-YhY9Pe478D8Fa2eDdBRtt78mFZJtA5WQ7sL0xBoLMNwiHj6QDeGk9aCR3_RsmNgvXGcXSqsRRjoxLpJsE7YXIFswj5Ta3PCF3QuiEWfMjRfihBNZN5N1l-WjXixg/s1600/circulo-de-quintas.jpg",
    descripcion: "Distingue el color brillante del mayor y el color introspectivo del menor.",
    intro: "La diferencia entre un acorde mayor y uno menor es un solo semitono en la 3ª, pero cambia por completo la emoción: el mayor suena brillante y estable; el menor, melancólico o profundo.",
    sections: [
      { title: "Acorde mayor", body: "Tónica + 4 semitonos (3ª mayor) + 3 semitonos (5ª justa).", example: "C mayor = C + E + G (4st + 3st)." },
      { title: "Acorde menor", body: "Tónica + 3 semitonos (3ª menor) + 4 semitonos (5ª justa).", example: "A menor = A + C + E (3st + 4st)." },
      { title: "Comparar", body: "El mismo acorde en mayor o menor crea emociones distintas. Solo cambia la 3ª.", example: "C mayor (C-E-G) vs C menor (C-Eb-G)." },
    ],
    graphic: "Mayor: 4st + 3st | Menor: 3st + 4st",
    video_url: "https://www.youtube.com/embed/PChimqo454k",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Cuántos semitonos hay entre la tónica y la 3ª de un acorde mayor?", opciones: ["4", "3", "5", "2"], respuesta: "4" },
      q2: { pregunta: "¿Qué acorde resulta de A-C-E?", opciones: ["A menor", "A mayor", "C mayor", "E menor"], respuesta: "A menor" },
      m1: { pregunta: "Construye G mayor: G4-B4-D5.", notas: ["G4", "B4", "D5"], progresion: ["I"] },
      m2: { pregunta: "Construye E menor: E4-G4-B4.", notas: ["E4", "G4", "B4"], progresion: ["i"] },
      q3: { pregunta: "La diferencia entre C mayor (C-E-G) y C menor (C-Eb-G) es:", opciones: ["Solo la 3ª (mayor o menor)", "La 5ª", "La tónica", "El ritmo"], respuesta: "Solo la 3ª (mayor o menor)" },
    },
  },
];

const armonia_u2 = [
  // ── Lección 16: Tónica, subdominante y dominante ─────────────────────────
  {
    titulo: "Tónica, subdominante y dominante",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-cwuieSRb036BCRBF8xijLKRWFiuuanUodF9sOjADDhwr1O7r2pYA8Lg&s=10",
    descripcion: "Las tres funciones que mueven toda la música tonal.",
    intro: "En el sistema tonal, cada acorde cumple una función: la Tónica es el hogar (reposo), la Subdominante prepara el movimiento y la Dominante genera la máxima tensión antes del reposo.",
    sections: [
      { title: "Tónica (I)", body: "El acorde de reposo. Inicio y final natural de una pieza.", example: "En C mayor: el acorde I = C-E-G." },
      { title: "Subdominante (IV)", body: "Prepara el movimiento. Salir de la tónica.", example: "En C mayor: IV = F-A-C. Se siente 'partiendo'." },
      { title: "Dominante (V)", body: "Máxima tensión. Quiere resolver urgentemente en la tónica.", example: "En C mayor: V = G-B-D. La sensible (B) empuja hacia C." },
    ],
    graphic: "I=reposo | IV=preparación | V=tensión → I=reposo",
    video_url: "https://www.youtube.com/embed/9eSjFWTO7GA",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué función armónica da sensación de reposo y hogar?", opciones: ["Tónica (I)", "Dominante (V)", "Subdominante (IV)", "Sensible (VII)"], respuesta: "Tónica (I)" },
      q2: { pregunta: "¿Qué nota de V7 genera la tensión que quiere resolver en I?", opciones: ["La sensible (7mo grado)", "La tónica", "La dominante", "La subdominante"], respuesta: "La sensible (7mo grado)" },
      m1: { pregunta: "Construye I-IV en C: C4-E4-G4 → F4-A4-C5.", notas: ["C4", "E4", "G4", "F4", "A4", "C5"], progresion: ["I", "IV"] },
      m2: { pregunta: "Construye V-I: G4-B4-D5 → C4-E4-G4.", notas: ["G4", "B4", "D5", "C4", "E4", "G4"], progresion: ["V", "I"] },
      q3: { pregunta: "La progresión I→IV→V→I crea:", opciones: ["Un ciclo completo de reposo-movimiento-tensión-reposo", "Solo tensión sin resolver", "Solo movimiento sin inicio", "Una escala ascendente"], respuesta: "Un ciclo completo de reposo-movimiento-tensión-reposo" },
    },
  },

  // ── Lección 17: Progresiones armónicas ───────────────────────────────────
  {
    titulo: "Progresiones armónicas",
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReMgkTZj7VWnqZH4yWzO2X4KSdWzfic5VEhEyf81pujg&s=10",
    descripcion: "Conecta acordes con intención y aprende a leerlos con números romanos.",
    intro: "Una progresión es una secuencia de acordes con dirección funcional. Las progresiones crean expectativa, movimiento y cierre; son el esqueleto de una canción. Se describen con números romanos para que valgan en cualquier tonalidad.",
    sections: [
      { title: "Números romanos", body: "I-II-III-IV-V-VI-VII son los grados de la escala. Mayúscula = acorde mayor; minúscula = menor.", example: "En C: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am." },
      { title: "I-IV-V-I", body: "La progresión más clásica: blues, rock, folk, pop.", example: "C-F-G-C en C mayor." },
      { title: "I-V-vi-IV", body: "La progresión del pop moderno: usada en miles de canciones.", example: "C-G-Am-F en C mayor." },
      { title: "ii-V-I (jazz)", body: "La progresión fundamental del jazz. Tensión máxima antes del reposo.", example: "Dm-G-C en C mayor." },
    ],
    graphic: "I-IV-V-I | I-V-vi-IV | ii-V-I",
    video_url: "https://www.youtube.com/embed/Q25eEq2bqRo",
    xp: 70,
    ejercicios: {
      q1: { pregunta: "¿Qué acorde es el 'vi' en C mayor?", opciones: ["A menor", "F mayor", "G mayor", "D menor"], respuesta: "A menor" },
      q2: { pregunta: "Si analizas C-F-G-C en C mayor, ¿qué progresión es?", opciones: ["I-IV-V-I", "I-V-IV-I", "I-vi-IV-V", "ii-V-I-IV"], respuesta: "I-IV-V-I" },
      m1: { pregunta: "Construye I-IV: C4-E4-G4 → F4-A4-C5.", notas: ["C4", "E4", "G4", "F4", "A4", "C5"], progresion: ["I", "IV"] },
      m2: { pregunta: "Construye V-vi: G4-B4-D5 → A4-C5-E5.", notas: ["G4", "B4", "D5", "A4", "C5", "E5"], progresion: ["V", "vi"] },
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
    descripcion: "Pulso, tempo, metrónomo, compás, figuras y silencios.",
    imagen: moduleImages.ritmo,
    orden: 1,
    unidades: [
      unit("Fundamentos temporales", "Pulso, tempo, práctica con metrónomo y compás.", 1, ritmo_u1, "ritmo"),
      unit("Figuras y silencios", "Redondas, blancas, negras, corcheas y silencios.", 2, ritmo_u2, "ritmo"),
    ],
  },
  // ── Módulo: Melodía ─────────────────────────────────────────────────────────
  {
    slug: "melodia",
    titulo: "Melodía",
    descripcion: "Notas, alturas, sistema anglosajón, alteraciones, intervalos y escalas.",
    imagen: moduleImages.melodia,
    orden: 2,
    unidades: [
      unit(
        "Notas y lectura",
        "Nombres de las notas, sistema anglosajón, alteraciones y reconocimiento de alturas graves y agudas.",
        1,
        melodia_u1,
        "melodia"
      ),
      unit(
        "Construcción melódica",
        "Intervalos, escala mayor y escala menor.",
        2,
        melodia_u2,
        "melodia"
      ),
    ],
  }, {
    slug: "armonia",
    titulo: "Armonía",
    descripcion: "Tríadas, acordes mayores y menores, funciones tonales y progresiones.",
    imagen: moduleImages.armonia,
    orden: 3,
    unidades: [
      unit("Acordes", "Tríadas y acordes mayores y menores.", 1, armonia_u1, "armonia"),
      unit("Funciones tonales", "Tónica, subdominante, dominante y progresiones.", 2, armonia_u2, "armonia"),
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

// console.log(`✅ Currículo cargado: ${totalExercises} ejercicios en 17/17 lecciones.`);
