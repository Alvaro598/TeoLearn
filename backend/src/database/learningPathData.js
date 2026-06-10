const moduleImages = {
  ritmo: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  melodia: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=1200&q=80",
  armonia: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80",
};

function content({ intro, sections, graphic, audioExample }) {
  return [
    intro,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      section.body,
      section.example ? `Ejemplo: ${section.example}` : "",
      "",
    ]),
    graphic ? `Grafico textual: ${graphic}` : "",
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

function audio(order, question, targetNote, options = ["C4", "D4", "E4", "G4"], points = 15) {
  return {
    tipo: "auditivo",
    pregunta: question,
    contenido: {
      nota: targetNote,
      opciones: options,
      instrucciones: "Escucha el ejemplo y selecciona la respuesta mas cercana.",
    },
    respuesta_correcta: { respuesta: targetNote },
    puntos: points,
    orden: order,
  };
}

function midi(order, question, targetNotes, points = 20) {
  return {
    tipo: "midi",
    pregunta: question,
    contenido: {
      instrucciones: `Construye en el editor: ${targetNotes.join(" - ")}.`,
      notas_objetivo: targetNotes,
      columnas: 16,
    },
    respuesta_correcta: { notas: targetNotes },
    puntos: points,
    orden: order,
  };
}

function generatedPractice(baseOrder, lesson) {
  return [
    quiz(
      baseOrder,
      `Cual idea resume mejor "${lesson.titulo}"?`,
      [lesson.keyAnswer, lesson.distractors[0], lesson.distractors[1], lesson.distractors[2]],
      lesson.keyAnswer
    ),
    quiz(
      baseOrder + 1,
      `Selecciona el ejemplo correcto para ${lesson.shortTopic}.`,
      [lesson.exampleAnswer, ...lesson.exampleDistractors],
      lesson.exampleAnswer
    ),
    quiz(
      baseOrder + 2,
      `Que error debe evitar un principiante al estudiar ${lesson.shortTopic}?`,
      [lesson.commonMistake, "Practicar lento", "Escuchar con atencion", "Repetir con proposito"],
      lesson.commonMistake
    ),
    audio(baseOrder + 3, `Identifica el sonido principal relacionado con ${lesson.shortTopic}.`, lesson.audioNote),
    audio(baseOrder + 4, `Escucha y reconoce una nota de apoyo para ${lesson.shortTopic}.`, lesson.supportNote, ["C4", "E4", "G4", "C5"]),
    midi(baseOrder + 5, `Construye un patron corto de ${lesson.shortTopic}.`, lesson.midiPattern),
    midi(baseOrder + 6, `Reproduce una version simplificada de ${lesson.shortTopic}.`, lesson.simplePattern),
    quiz(
      baseOrder + 7,
      `Como llevarias ${lesson.shortTopic} a un instrumento?`,
      [lesson.instrumentTip, "Memorizando sin tocar", "Saltando la escucha", "Usando solo teoria escrita"],
      lesson.instrumentTip,
      15
    ),
    quiz(
      baseOrder + 8,
      `Que practica favorece la recuperacion activa en ${lesson.shortTopic}?`,
      [lesson.activeRecall, "Leer sin responder", "Copiar la respuesta", "Cambiar de tema inmediatamente"],
      lesson.activeRecall,
      15
    ),
  ];
}

function lesson(definition, order) {
  return {
    titulo: definition.titulo,
    descripcion: definition.descripcion,
    contenido: content(definition),
    video_url: definition.video_url,
    orden: order,
    xp_recompensa: definition.xp || 60,
    ejercicios: generatedPractice(1, definition),
  };
}

const ritmoLessons = [
  {
    titulo: "Pulso y estabilidad temporal",
    descripcion: "Aprende a sentir una referencia constante antes de leer figuras.",
    intro: "El pulso es la base de la organizacion musical. Funciona como una caminata regular que sostiene la cancion aunque cambien las notas o los acordes.",
    sections: [
      { title: "Pulso", body: "Es una sucesion constante de tiempos. Puedes marcarlo con el pie, palmas o un metronomo.", example: "1 - 2 - 3 - 4 | 1 - 2 - 3 - 4" },
      { title: "Acento", body: "Algunos pulsos se sienten mas fuertes. Ese acento ayuda a reconocer el inicio de un grupo ritmico.", example: "FUERTE - suave - suave - suave" },
      { title: "Instrumento", body: "En guitarra o piano, toca una nota por pulso antes de intentar patrones complejos.", example: "C C C C al ritmo del metronomo" },
    ],
    graphic: "| 1 | 2 | 3 | 4 |",
    audioExample: "Pulso constante con nota C4.",
    video_url: "https://www.youtube.com/results?search_query=pulso+musical+explicacion",
    shortTopic: "pulso",
    keyAnswer: "Un tiempo constante que organiza la musica",
    distractors: ["Una nota aguda", "Un acorde mayor", "Un cambio de timbre"],
    exampleAnswer: "1-2-3-4 repetido con regularidad",
    exampleDistractors: ["C-E-G simultaneo", "Subir el volumen", "Cambiar de instrumento"],
    commonMistake: "Acelerar o frenar sin darse cuenta",
    audioNote: "C4",
    supportNote: "G4",
    midiPattern: ["C4", "C4", "C4", "C4"],
    simplePattern: ["C4", "G4", "C4", "G4"],
    instrumentTip: "Tocar una nota por cada pulso del metronomo",
    activeRecall: "Cerrar la explicacion y marcar 8 pulsos de memoria",
  },
  {
    titulo: "Compas y organizacion",
    descripcion: "Agrupa pulsos para entender 2/4, 3/4 y 4/4.",
    intro: "El compas organiza los pulsos en grupos. Esta agrupacion ayuda a sentir donde comienza y termina una idea ritmica.",
    sections: [
      { title: "Compas de 4/4", body: "Tiene cuatro tiempos por compas. Es muy comun en musica popular.", example: "1 2 3 4 | 1 2 3 4" },
      { title: "Compas de 3/4", body: "Tiene tres tiempos y suele sentirse como balanceo.", example: "1 2 3 | 1 2 3" },
      { title: "Lectura", body: "La barra de compas separa grupos de pulsos.", example: "| 1 2 3 4 | 1 2 3 4 |" },
    ],
    graphic: "4/4 = cuatro tiempos; 3/4 = tres tiempos.",
    audioExample: "Acento fuerte en el tiempo 1.",
    video_url: "https://www.youtube.com/results?search_query=compas+musical+4%2F4+3%2F4",
    shortTopic: "compas",
    keyAnswer: "Una agrupacion regular de pulsos",
    distractors: ["Una escala", "Una alteracion", "Una nota larga"],
    exampleAnswer: "1-2-3-4 separado por barras",
    exampleDistractors: ["Do-Re-Mi como escala", "C-E-G como acorde", "Fuerte y suave sin orden"],
    commonMistake: "No reconocer el tiempo 1",
    audioNote: "D4",
    supportNote: "A4",
    midiPattern: ["C4", "D4", "E4", "F4"],
    simplePattern: ["C4", "C4", "G4", "G4"],
    instrumentTip: "Acentuar el primer pulso de cada grupo",
    activeRecall: "Contar en voz alta dos compases sin mirar",
  },
  {
    titulo: "Figuras ritmicas",
    descripcion: "Relaciona redonda, blanca, negra y corchea con duraciones.",
    intro: "Las figuras ritmicas indican cuanto dura un sonido. Entenderlas permite leer y crear patrones con precision.",
    sections: [
      { title: "Negra", body: "Si la negra vale un pulso, funciona como unidad de conteo.", example: "ta ta ta ta" },
      { title: "Blanca", body: "La blanca dura dos pulsos cuando la negra vale uno.", example: "taa taa" },
      { title: "Corcheas", body: "Dos corcheas pueden ocupar el espacio de una negra.", example: "ta-ta ta-ta" },
    ],
    graphic: "Redonda=4, blanca=2, negra=1, corchea=1/2.",
    audioExample: "Negra vs corchea con la misma nota.",
    video_url: "https://www.youtube.com/results?search_query=figuras+ritmicas+redonda+blanca+negra+corchea",
    shortTopic: "figuras ritmicas",
    keyAnswer: "Simbolos que representan duraciones",
    distractors: ["Nombres de instrumentos", "Funciones tonales", "Tipos de voz"],
    exampleAnswer: "Negra igual a un pulso si esa es la unidad",
    exampleDistractors: ["Sostenido baja medio tono", "C-E-G forman escala", "El timbre mide duracion"],
    commonMistake: "Confundir altura con duracion",
    audioNote: "E4",
    supportNote: "C5",
    midiPattern: ["C4", "C4", "E4", "E4"],
    simplePattern: ["C4", "E4", "G4", "C5"],
    instrumentTip: "Tocar negras y luego dividirlas en dos corcheas",
    activeRecall: "Nombrar de memoria cuanto vale cada figura",
  },
  {
    titulo: "Patrones ritmicos",
    descripcion: "Combina pulso, silencios y figuras en motivos cortos.",
    intro: "Un patron ritmico es una combinacion reconocible de duraciones y silencios. Es la materia prima de acompanamientos y melodias.",
    sections: [
      { title: "Motivo", body: "Un motivo ritmico corto puede repetirse y variar.", example: "ta ta-ta ta" },
      { title: "Silencio", body: "El silencio tambien ocupa tiempo y crea respiracion.", example: "ta - silencio - ta ta" },
      { title: "Creacion", body: "Primero crea un patron de dos compases y luego cambiale una figura.", example: "1 2& 3 4" },
    ],
    graphic: "| ta ta-ta ta | ta - ta-ta |",
    audioExample: "Patron corto en C4 y G4.",
    video_url: "https://www.youtube.com/results?search_query=patrones+ritmicos+basicos",
    shortTopic: "patrones ritmicos",
    keyAnswer: "Una combinacion repetible de duraciones y silencios",
    distractors: ["Una sola frecuencia", "Una escala mayor", "Una clave"],
    exampleAnswer: "ta ta-ta ta repetido",
    exampleDistractors: ["C-D-E-F-G-A-B", "I-IV-V", "Do mayor"],
    commonMistake: "Practicar rapido antes de estabilizar el pulso",
    audioNote: "G4",
    supportNote: "E4",
    midiPattern: ["C4", "C4", "G4", "C4"],
    simplePattern: ["C4", "G4", "G4", "C4"],
    instrumentTip: "Palmear primero y luego tocarlo en una nota",
    activeRecall: "Repetir el patron sin escuchar el ejemplo",
  },
];

const melodiaLessons = [
  {
    titulo: "Notas musicales y sistema de letras",
    descripcion: "Relaciona Do-Re-Mi-Fa-Sol-La-Si con C-D-E-F-G-A-B.",
    intro: "La melodia se construye con alturas. En espanol usamos Do, Re, Mi, Fa, Sol, La, Si; en el sistema anglosajon se usan letras.",
    sections: [
      { title: "Nombres", body: "Los nombres se repiten en octavas. Despues de Si vuelve Do mas agudo.", example: "Do Re Mi Fa Sol La Si Do" },
      { title: "Letras", body: "C corresponde a Do, D a Re, E a Mi, F a Fa, G a Sol, A a La y B a Si.", example: "C-D-E-F-G-A-B = Do-Re-Mi-Fa-Sol-La-Si" },
      { title: "Instrumento", body: "En piano, las notas blancas desde C siguen ese orden.", example: "C D E F G A B" },
    ],
    graphic: "C-D-E-F-G-A-B | Do-Re-Mi-Fa-Sol-La-Si",
    audioExample: "Escala ascendente C4 a C5.",
    video_url: "https://www.youtube.com/results?search_query=notas+musicales+C+D+E+F+G+A+B",
    shortTopic: "notas musicales",
    keyAnswer: "Alturas organizadas con nombres",
    distractors: ["Duraciones ritmicas", "Volumen fijo", "Silencios de compas"],
    exampleAnswer: "C-D-E-F-G-A-B",
    exampleDistractors: ["I-IV-V", "ta ta-ta", "Fuerte-suave"],
    commonMistake: "Creer que B corresponde a bemol",
    audioNote: "C4",
    supportNote: "E4",
    midiPattern: ["C4", "D4", "E4", "F4"],
    simplePattern: ["G4", "A4", "B4", "C5"],
    instrumentTip: "Ubicar C y tocar las notas blancas en orden",
    activeRecall: "Decir las notas en letras y luego en solfeo",
  },
  {
    titulo: "Pentagrama y claves",
    descripcion: "Ubica notas segun lineas, espacios y clave.",
    intro: "El pentagrama permite representar alturas en cinco lineas y cuatro espacios. La clave indica como leer esas posiciones.",
    sections: [
      { title: "Lineas y espacios", body: "Mientras mas arriba esta una nota, mas aguda se interpreta.", example: "abajo = grave, arriba = agudo" },
      { title: "Clave de sol", body: "La clave de sol referencia la nota Sol en la segunda linea.", example: "segunda linea = G" },
      { title: "Lectura activa", body: "Conviene leer, cantar y tocar para unir ojo, oido y movimiento.", example: "ver C, cantar Do, tocar C" },
    ],
    graphic: "Linea 1 2 3 4 5 / Espacio 1 2 3 4",
    audioExample: "Nota grave y nota aguda comparadas.",
    video_url: "https://www.youtube.com/results?search_query=pentagrama+clave+de+sol+principiantes",
    shortTopic: "pentagrama",
    keyAnswer: "Sistema de cinco lineas para ubicar notas",
    distractors: ["Secuencia de acordes", "Acento ritmico", "Efecto de audio"],
    exampleAnswer: "Arriba significa mas agudo",
    exampleDistractors: ["Arriba significa mas fuerte", "C siempre es silencio", "La clave no cambia lectura"],
    commonMistake: "Leer solo nombres sin escuchar la altura",
    audioNote: "F4",
    supportNote: "C5",
    midiPattern: ["C4", "E4", "G4", "C5"],
    simplePattern: ["C4", "D4", "E4", "G4"],
    instrumentTip: "Tocar cada nota leida en el teclado virtual",
    activeRecall: "Dibujar cinco lineas y explicar arriba/abajo",
  },
  {
    titulo: "Intervalos",
    descripcion: "Reconoce distancias entre dos notas.",
    intro: "Un intervalo es la distancia entre dos notas. Es clave para cantar, reconocer melodias y construir acordes.",
    sections: [
      { title: "Movimiento conjunto", body: "Cuando una melodia avanza por notas vecinas, el movimiento se siente cercano.", example: "C-D-E" },
      { title: "Salto", body: "Cuando se salta de C a G, la distancia se percibe mas amplia.", example: "C-G" },
      { title: "Uso", body: "Los intervalos permiten recordar melodias por forma, no solo por nombres.", example: "sube paso, sube paso, baja salto" },
    ],
    graphic: "C-D = segunda; C-E = tercera; C-G = quinta.",
    audioExample: "Comparar C-D y C-G.",
    video_url: "https://www.youtube.com/results?search_query=intervalos+musicales+principiantes",
    shortTopic: "intervalos",
    keyAnswer: "La distancia entre dos notas",
    distractors: ["La velocidad de una cancion", "El color de un instrumento", "Una figura de cuatro pulsos"],
    exampleAnswer: "C a E forma una tercera",
    exampleDistractors: ["C a E es silencio", "C a G es corchea", "D a F es compas"],
    commonMistake: "Memorizar nombres sin escuchar la distancia",
    audioNote: "D4",
    supportNote: "G4",
    midiPattern: ["C4", "E4", "G4"],
    simplePattern: ["C4", "D4", "E4"],
    instrumentTip: "Tocar dos notas y describir si estan cerca o lejos",
    activeRecall: "Nombrar tres intervalos desde C sin mirar",
  },
  {
    titulo: "Escalas y motivos melodicos",
    descripcion: "Organiza notas en escalas y crea pequenas ideas.",
    intro: "Una escala es una sucesion ordenada de notas. Un motivo melodico es una idea corta que puede repetirse, variar y desarrollarse.",
    sections: [
      { title: "Escala mayor", body: "La escala de Do mayor usa C-D-E-F-G-A-B-C sin alteraciones.", example: "C D E F G A B C" },
      { title: "Direccion", body: "Una melodia puede subir, bajar o combinar ambos movimientos.", example: "C-D-E-D-C" },
      { title: "Motivo", body: "Un motivo corto ayuda a componer melodias memorables.", example: "C-E-G-E" },
    ],
    graphic: "C-D-E-F-G-A-B-C",
    audioExample: "Escala mayor y motivo C-E-G-E.",
    video_url: "https://www.youtube.com/results?search_query=escala+mayor+motivos+melodicos",
    shortTopic: "escalas",
    keyAnswer: "Una sucesion ordenada de notas",
    distractors: ["Un golpe de bateria", "Una pausa sin duracion", "Un tipo de volumen"],
    exampleAnswer: "C-D-E-F-G-A-B-C",
    exampleDistractors: ["C-E-G-B-D-F", "ta ta silencio", "I-IV-V"],
    commonMistake: "Tocar la escala sin escuchar su direccion",
    audioNote: "E4",
    supportNote: "C5",
    midiPattern: ["C4", "D4", "E4", "F4", "G4"],
    simplePattern: ["C4", "E4", "G4", "E4"],
    instrumentTip: "Tocar la escala y luego crear un motivo de cuatro notas",
    activeRecall: "Escribir la escala de C mayor desde memoria",
  },
];

const armoniaLessons = [
  {
    titulo: "Acordes y triadas",
    descripcion: "Construye acordes de tres notas desde la escala.",
    intro: "La armonia aparece cuando varias notas suenan juntas. Una triada es un acorde basico de tres notas.",
    sections: [
      { title: "Triada", body: "Se forma con tonica, tercera y quinta.", example: "C-E-G" },
      { title: "Mayor", body: "La triada mayor suele sentirse estable y brillante.", example: "C mayor = C-E-G" },
      { title: "Practica", body: "Toca las notas separadas y luego juntas para reconocer el acorde.", example: "C luego E luego G, despues C+E+G" },
    ],
    graphic: "C mayor: C + E + G",
    audioExample: "Arpegio C-E-G.",
    video_url: "https://www.youtube.com/results?search_query=triadas+acordes+mayores+principiantes",
    shortTopic: "triadas",
    keyAnswer: "Acordes de tres notas",
    distractors: ["Escalas de ocho compases", "Silencios sin altura", "Figuras de percusion"],
    exampleAnswer: "C-E-G",
    exampleDistractors: ["C-D-E", "C-C-C-C", "I-IV-V"],
    commonMistake: "Confundir escala con acorde",
    audioNote: "C4",
    supportNote: "G4",
    midiPattern: ["C4", "E4", "G4"],
    simplePattern: ["D4", "F4", "A4"],
    instrumentTip: "Tocar la triada como arpegio y despues simultanea",
    activeRecall: "Construir C mayor sin mirar la respuesta",
  },
  {
    titulo: "Acordes mayores y menores",
    descripcion: "Distingue el color sonoro de acordes mayores y menores.",
    intro: "Los acordes mayores y menores se diferencian por la tercera. Ese pequeno cambio transforma mucho la sensacion musical.",
    sections: [
      { title: "Mayor", body: "Tiene tercera mayor desde la tonica.", example: "C-E-G" },
      { title: "Menor", body: "Tiene tercera menor desde la tonica.", example: "A-C-E" },
      { title: "Escucha", body: "No basta con saber la formula: hay que comparar el color sonoro.", example: "C mayor vs A menor" },
    ],
    graphic: "Mayor = 1-3-5; menor = 1-b3-5.",
    audioExample: "Comparar C-E-G y A-C-E.",
    video_url: "https://www.youtube.com/results?search_query=acordes+mayores+y+menores",
    shortTopic: "acordes mayores y menores",
    keyAnswer: "Acordes diferenciados por la tercera",
    distractors: ["Compases sin acento", "Notas sin nombre", "Velocidad del pulso"],
    exampleAnswer: "C-E-G es C mayor",
    exampleDistractors: ["C-D-E es C mayor", "A-C-E es ritmo", "G-A-B es silencio"],
    commonMistake: "No identificar la tercera del acorde",
    audioNote: "A4",
    supportNote: "C5",
    midiPattern: ["A4", "C5", "E4"],
    simplePattern: ["C4", "E4", "G4"],
    instrumentTip: "Comparar una triada mayor con una menor en el teclado",
    activeRecall: "Explicar que nota cambia entre mayor y menor",
  },
  {
    titulo: "Funciones tonales",
    descripcion: "Comprende reposo, preparacion y tension.",
    intro: "Las funciones tonales describen el papel de los acordes dentro de una tonalidad. Ayudan a entender por que una progresion se siente en movimiento.",
    sections: [
      { title: "Tonica", body: "Da sensacion de reposo o casa.", example: "I en C mayor = C" },
      { title: "Subdominante", body: "Prepara movimiento hacia la tension.", example: "IV en C mayor = F" },
      { title: "Dominante", body: "Genera tension y suele querer volver a tonica.", example: "V en C mayor = G" },
    ],
    graphic: "I = reposo, IV = preparacion, V = tension.",
    audioExample: "I-IV-V-I.",
    video_url: "https://www.youtube.com/results?search_query=funciones+tonales+tonica+subdominante+dominante",
    shortTopic: "funciones tonales",
    keyAnswer: "Roles de los acordes dentro de una tonalidad",
    distractors: ["Nombres de notas aisladas", "Duraciones de figuras", "Frecuencias sin contexto"],
    exampleAnswer: "V genera tension hacia I",
    exampleDistractors: ["I siempre genera maxima tension", "IV es silencio", "V es una corchea"],
    commonMistake: "Aprender numeros sin escuchar tension y reposo",
    audioNote: "G4",
    supportNote: "C4",
    midiPattern: ["C4", "E4", "G4"],
    simplePattern: ["F4", "A4", "C5"],
    instrumentTip: "Tocar I-IV-V-I y describir reposo/tension",
    activeRecall: "Nombrar la funcion de I, IV y V",
  },
  {
    titulo: "Progresiones armonicas",
    descripcion: "Une acordes para crear direccion musical.",
    intro: "Una progresion armonica es una secuencia de acordes. En musica tonal, las progresiones crean expectativa, movimiento y cierre.",
    sections: [
      { title: "I-IV-V", body: "Es una progresion muy usada por su claridad funcional.", example: "C-F-G" },
      { title: "I-V-vi-IV", body: "Comun en musica popular moderna.", example: "C-G-Am-F" },
      { title: "Composicion", body: "Prueba una progresion y canta una melodia simple encima.", example: "C-G-Am-F con C-D-E-G" },
    ],
    graphic: "C-F-G-C / C-G-Am-F",
    audioExample: "Progresion I-V-vi-IV.",
    video_url: "https://www.youtube.com/results?search_query=progresiones+armonicas+basicas",
    shortTopic: "progresiones",
    keyAnswer: "Una secuencia de acordes con direccion",
    distractors: ["Una sola nota sin contexto", "Un timbre instrumental", "Una linea del pentagrama"],
    exampleAnswer: "C-F-G-C",
    exampleDistractors: ["C-D-E-F", "ta-ta ta", "C4 aislado"],
    commonMistake: "Tocar acordes sin mantener pulso",
    audioNote: "F4",
    supportNote: "A4",
    midiPattern: ["C4", "E4", "G4", "C5"],
    simplePattern: ["G4", "B4", "D4"],
    instrumentTip: "Tocar un acorde por compas con metronomo",
    activeRecall: "Escribir una progresion y explicar su cierre",
  },
];

function unit(titulo, descripcion, orden, lessons) {
  return {
    titulo,
    descripcion,
    orden,
    lecciones: lessons.map((item, index) => lesson(item, index + 1)),
  };
}

export const learningPath = [
  {
    slug: "ritmo",
    titulo: "Ritmo",
    descripcion: "Pulso, compas, figuras y patrones ritmicos progresivos.",
    imagen: moduleImages.ritmo,
    orden: 1,
    unidades: [
      unit("Fundamentos ritmicos", "Del pulso estable a la lectura de compases.", 1, ritmoLessons.slice(0, 2)),
      unit("Lectura y construccion ritmica", "Figuras, silencios y patrones aplicados.", 2, ritmoLessons.slice(2)),
    ],
  },
  {
    slug: "melodia",
    titulo: "Melodia",
    descripcion: "Notas, pentagrama, intervalos, escalas y motivos melodicos.",
    imagen: moduleImages.melodia,
    orden: 2,
    unidades: [
      unit("Notas y lectura", "Relacion entre nombres, letras, pentagrama y escucha.", 1, melodiaLessons.slice(0, 2)),
      unit("Movimiento melodico", "Intervalos, escalas y motivos para crear melodias.", 2, melodiaLessons.slice(2)),
    ],
  },
  {
    slug: "armonia",
    titulo: "Armonia",
    descripcion: "Acordes, triadas, funciones tonales y progresiones.",
    imagen: moduleImages.armonia,
    orden: 3,
    unidades: [
      unit("Construccion de acordes", "Triadas y color mayor/menor.", 1, armoniaLessons.slice(0, 2)),
      unit("Movimiento armonico", "Funciones y progresiones para acompanar melodias.", 2, armoniaLessons.slice(2)),
    ],
  },
];

export const totalExercises = learningPath.reduce(
  (modulesTotal, module) =>
    modulesTotal +
    module.unidades.reduce(
      (unitsTotal, unitItem) =>
        unitsTotal +
        unitItem.lecciones.reduce(
          (lessonsTotal, lessonItem) => lessonsTotal + lessonItem.ejercicios.length,
          0
        ),
      0
    ),
  0
);

if (totalExercises < 100) {
  throw new Error(`La ruta debe tener al menos 100 ejercicios. Total actual: ${totalExercises}`);
}
