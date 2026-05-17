const leccion = {
  id: "mel-notas-1",

  theory: {
    title: "Las notas musicales",

    content: `
Las notas musicales representan diferentes alturas sonoras.

En la música occidental usamos:

DO - RE - MI - FA - SOL - LA - SI

Cada nota posee una frecuencia específica.
    `,

    tips: [
      "Escucha cada nota lentamente.",
      "Relaciona sonido y nombre.",
      "Practica diariamente.",
    ],
  },

  exercises: [
    {
      id: "mel-ear-1",

      type: "ear-training",

      title: "Escucha e identifica",

      question:
        "¿Qué nota escuchaste?",

      options: [
        "Do",
        "Mi",
        "Sol",
        "La",
      ],

      correctAnswer: "Do",

      explanation:
        "El sonido corresponde a la nota Do.",

      audio:
        "/audio/melodia/c4.mp3",

      xp: 30,
    },
  ],
};

export default leccion;