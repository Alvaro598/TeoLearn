const leccion = {
  id: "arm-triadas-1",

  theory: {
    title: "Introducción a los acordes",

    content: `
Un acorde es un conjunto de notas que suenan simultáneamente.

Las tríadas básicas se forman usando:

Tónica + tercera + quinta.
    `,

    tips: [
      "Escucha acordes lentamente.",
      "Practica acordes mayores.",
    ],
  },

  exercises: [
    {
      id: "arm-midi-1",

      type: "midi",

      title: "Construye Do Mayor",

      instructions:
        "Toca las notas C - E - G.",

      targetNotes: [
        "C4",
        "E4",
        "G4",
      ],

      tempo: 80,

      xp: 50,

      aiFeedback: true,
    },
  ],
};

export default leccion;