const leccion = {
  id: "ritmo-fundamentos-1",

  theory: {
    title: "El pulso musical",

    content: `
El pulso es la base de toda la música.

Es una sucesión constante de tiempos que mantiene el orden rítmico de una canción.

Podemos sentir el pulso al aplaudir o mover el pie mientras escuchamos música.
    `,

    tips: [
      "Escucha canciones lentas.",
      "Marca el tiempo con palmadas.",
      "Cuenta constantemente 1,2,3,4.",
    ],
  },

  exercises: [
    {
      id: "ritmo-quiz-1",

      type: "quiz",

      title: "Identifica el pulso",

      question:
        "¿Qué representa el pulso musical?",

      options: [
        "Un tiempo constante",
        "La melodía",
        "La armonía",
        "El volumen",
      ],

      correctAnswer:
        "Un tiempo constante",

      explanation:
        "El pulso mantiene el tiempo de la música.",

      xp: 20,
    },
  ],
};

export default leccion;