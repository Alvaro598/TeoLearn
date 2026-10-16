function preguntaFinal(moduloSlug, numero, pregunta, respuesta, distractores, explicacion) {
  return {
    id: `final-${moduloSlug}-${numero}`,
    moduloSlug,
    pregunta,
    opciones: [respuesta, ...distractores],
    respuesta,
    explicacion,
  };
}

export const PREGUNTAS_POR_MODULO = {
  ritmo: [
    { id: 1, pregunta: "Repites el mismo patrón de cuatro negras a 60 y luego a 100 BPM. ¿Qué cambia?", opciones: ["La velocidad del pulso", "El orden de los golpes", "La cantidad de pulsos", "La subdivisión"], respuesta: "La velocidad del pulso", explicacion: "El tempo indica la velocidad del pulso. Al cambiar de 60 a 100 BPM, los pulsos ocurren más rápido, pero el patrón mantiene sus golpes y su orden." },
    { id: 2, pregunta: "Tocas un patrón en 3/4 y otro en 4/4. ¿Cuántos pulsos tiene cada compás, respectivamente?", opciones: ["3 y 4", "4 y 3", "2 y 4", "3 y 2"], respuesta: "3 y 4", explicacion: "El primer número indica cuántos pulsos agrupa cada compás: tres en 3/4 y cuatro en 4/4." },
    { id: 3, pregunta: "En un compás de 4/4 ya colocaste una blanca y dos corcheas. ¿Cuántos pulsos faltan para completar el compás?", opciones: ["1 pulso", "2 pulsos", "3 pulsos", "Ninguno"], respuesta: "1 pulso", explicacion: "La blanca dura dos pulsos y las dos corcheas juntas duran uno. Ya ocupaste tres de los cuatro pulsos del compás." },
    { id: 4, pregunta: "Cuentas cuatro pulsos parejos y oyes ocho golpes repartidos por igual. ¿Cuántos golpes corresponden a cada pulso?", opciones: ["2 golpes", "1 golpe", "4 golpes", "8 golpes"], respuesta: "2 golpes", explicacion: "Ocho golpes repartidos en cuatro pulsos dan dos golpes por pulso: cada negra se divide en dos corcheas." },
    { id: 5, pregunta: "En un patrón de cuatro pulsos falta el golpe del pulso 2. ¿Qué haces para conservar el ritmo?", opciones: ["Sigues contando el pulso 2 en silencio", "Acortas el compás a tres pulsos", "Aceleras para saltar el espacio", "Mueves el pulso 2 al final"], respuesta: "Sigues contando el pulso 2 en silencio", explicacion: "El silencio ocupa su duración dentro del compás. El pulso continúa aunque no haya un ataque audible." },
    { id: 6, pregunta: "El metrónomo marca cuatro clics y tus golpes caen justo antes de cada clic. ¿Qué debes corregir?", opciones: ["La sincronización: desplazar los golpes para hacerlos coincidir", "El número de pulsos del compás", "La duración de las negras", "La agrupación en corcheas"], respuesta: "La sincronización: desplazar los golpes para hacerlos coincidir", explicacion: "Si te adelantas, ajusta el momento de tus golpes hasta hacerlos coincidir con la referencia estable del metrónomo." },
  ],
  melodia: [
    { id: 1, pregunta: "¿Qué intervalo hay entre Do4 y Sol4?", opciones: ["Quinta (5ª)", "Tercera (3ª)", "Cuarta (4ª)", "Segunda (2ª)"], respuesta: "Quinta (5ª)", explicacion: "De Do a Sol hay cinco nombres de nota contando ambos extremos: Do-Re-Mi-Fa-Sol. Es una quinta." },
    { id: 2, pregunta: "En la secuencia de notas naturales Do-Re-Mi-Fa-Sol-La-Si, ¿qué nota sigue después de Mi?", opciones: ["Fa", "Sol", "Re", "La"], respuesta: "Fa", explicacion: "El orden de las notas naturales es Do, Re, Mi, Fa, Sol, La y Si; después de Mi viene Fa." },
    { id: 3, pregunta: "Do sostenido (C#) y Re bemol (Db) tienen nombres distintos. ¿Qué tienen en común?", opciones: ["Suenan igual aunque se escriben distinto", "Uno dura el doble que el otro", "Están en octavas distintas", "Uno siempre suena más fuerte"], respuesta: "Suenan igual aunque se escriben distinto", explicacion: "C# y Db son nombres enarmónicos: en el teclado corresponden a la misma tecla y altura." },
    { id: 4, pregunta: "Do mayor y La menor natural usan las mismas notas. ¿Qué ayuda a distinguir sus escalas?", opciones: ["Empiezan en notas distintas: Do y La", "La menor tiene más notas", "Do mayor siempre va más rápido", "La menor usa solo teclas negras"], respuesta: "Empiezan en notas distintas: Do y La", explicacion: "La escala relativa menor usa las mismas notas que su escala mayor, pero comienza desde otra nota: Do mayor desde Do y La menor desde La." },
    { id: 5, pregunta: "Al subir por la escala de Do mayor desde Do, ¿qué pareja consecutiva forma el primer semitono?", opciones: ["Mi-Fa", "Do-Re", "Re-Mi", "Fa-Sol"], respuesta: "Mi-Fa", explicacion: "En la escala de Do mayor, Mi-Fa es el primer semitono al subir desde Do. El otro semitono aparece entre Si y Do." },
    { id: 6, pregunta: "Una melodía avanza Do-Re-Mi-Fa, pasando por notas vecinas de la escala. ¿Cómo se llama ese movimiento?", opciones: ["Movimiento por grado", "Salto de quinta", "Acorde simultáneo", "Progresión de acordes"], respuesta: "Movimiento por grado", explicacion: "Avanzar entre notas vecinas, como Do-Re-Mi, es movimiento por grado. Los saltos recorren distancias mayores." },
  ],
  armonia: [
    { id: 1, pregunta: "¿Qué notas forman la tríada de Do mayor?", opciones: ["Do-Mi-Sol", "Do-Re-Mi", "Do-Fa-La", "Do-Sol-Si"], respuesta: "Do-Mi-Sol", explicacion: "Una tríada reúne tónica, tercera y quinta. En Do mayor esas notas son Do, Mi y Sol." },
    { id: 2, pregunta: "Comparas Do mayor (Do-Mi-Sol) con Do menor (Do-Mi♭-Sol). ¿Qué cambió?", opciones: ["La tercera bajó un semitono", "La tónica subió un semitono", "La quinta bajó dos tonos", "Se añadió una cuarta nota"], respuesta: "La tercera bajó un semitono", explicacion: "La raíz y la quinta se mantienen. La tercera Mi baja a Mi bemol y así el acorde pasa de mayor a menor." },
    { id: 3, pregunta: "En Do mayor, ¿qué función cumple Sol mayor antes de volver a Do mayor?", opciones: ["Dominante: crea tensión y tiende a resolver en la tónica", "Tónica: representa el reposo", "Subdominante: prepara la salida", "Relativa menor: comparte todas las notas"], respuesta: "Dominante: crea tensión y tiende a resolver en la tónica", explicacion: "Sol mayor es el acorde V en Do mayor. La función dominante crea expectativa de resolución hacia Do, el acorde I." },
    { id: 4, pregunta: "En Do mayor, Fa mayor aparece como acorde IV antes de Sol mayor (V). ¿Qué función cumple Fa mayor?", opciones: ["Subdominante: prepara el movimiento", "Tónica: representa el reposo", "Dominante: crea la tensión final", "Sensible: es una nota de la escala"], respuesta: "Subdominante: prepara el movimiento", explicacion: "En Do mayor, Fa es IV y cumple la función subdominante, que prepara el movimiento hacia la dominante." },
    { id: 5, pregunta: "En Do mayor, ¿qué números romanos corresponden a Do-Fa-Sol-Do?", opciones: ["I-IV-V-I", "I-V-vi-IV", "ii-V-I", "IV-I-V-vi"], respuesta: "I-IV-V-I", explicacion: "En Do mayor, Do es I, Fa es IV y Sol es V. Por eso Do-Fa-Sol-Do se escribe I-IV-V-I." },
    { id: 6, pregunta: "En Do mayor, ¿cómo se escribe la progresión Re menor-Sol mayor-Do mayor?", opciones: ["ii-V-I", "I-IV-V", "I-V-vi-IV", "IV-I-IV"], respuesta: "ii-V-I", explicacion: "Re menor es ii, Sol mayor es V y Do mayor es I. La progresión lleva preparación y tensión hacia el reposo." },
  ],
};

// La evaluación final usa otras preguntas y ejemplos, pero solo evalúa lo enseñado.
export const PREGUNTAS_EVALUACION_FINAL = [
  preguntaFinal("ritmo", 1, "A 120 BPM, ¿cuántos pulsos suenan en un segundo?", "2 pulsos", ["1 pulso", "4 pulsos", "120 pulsos"], "BPM significa pulsos por minuto. A 120 BPM ocurren 120 pulsos en 60 segundos: dos pulsos por segundo."),
  preguntaFinal("ritmo", 2, "En un compás de 2/4, ¿cuántos pulsos cuentas antes de la siguiente barra?", "2", ["1", "3", "4"], "El compás de 2/4 agrupa dos pulsos antes de la siguiente barra de compás."),
  preguntaFinal("ritmo", 3, "En un compás de 4/4, ¿qué pulso suele llevar el acento más fuerte?", "El pulso 1", ["El pulso 2", "El pulso 3", "El pulso 4"], "El primer pulso es el más fuerte en 4/4; el tercero suele tener un acento medio."),
  preguntaFinal("ritmo", 4, "Una blanca dura 2 pulsos. ¿Cuántos pulsos duran dos blancas?", "4 pulsos", ["2 pulsos", "3 pulsos", "8 pulsos"], "Cada blanca dura dos pulsos. Dos blancas duran cuatro pulsos en total."),
  preguntaFinal("ritmo", 5, "¿Cuántos pulsos ocupa un silencio de negra?", "1 pulso", ["Medio pulso", "2 pulsos", "4 pulsos"], "El silencio de negra dura lo mismo que una negra: un pulso."),
  preguntaFinal("ritmo", 6, "¿Qué separa una barra simple en la partitura?", "Un compás del siguiente", ["Dos notas de la misma altura", "Un sonido de un silencio", "El inicio de una repetición"], "La barra simple marca el límite entre un compás y el siguiente."),

  preguntaFinal("melodia", 1, "¿Cuántas notas naturales distintas hay antes de que la secuencia vuelva a Do?", "7", ["5", "8", "12"], "Las notas naturales son Do, Re, Mi, Fa, Sol, La y Si: siete nombres antes de volver a Do."),
  preguntaFinal("melodia", 2, "Do4 y Do5 tienen el mismo nombre. ¿Qué diferencia hay entre ellos?", "Do5 suena una octava más agudo", ["Do5 dura el doble", "Do4 suena una octava más agudo", "Son notas con nombres distintos"], "Ambas notas se llaman Do, pero Do5 está una octava por encima de Do4."),
  preguntaFinal("melodia", 3, "En la notación anglosajona, ¿qué nota representa la letra A?", "La", ["Do", "Mi", "Sol"], "La equivalencia de notas es A=La, B=Si, C=Do, D=Re, E=Mi, F=Fa y G=Sol."),
  preguntaFinal("melodia", 4, "¿Qué describe un intervalo musical?", "La distancia en altura entre dos notas", ["La velocidad de una melodía", "La duración de un compás", "El volumen de un acorde"], "Un intervalo mide la distancia en altura entre dos notas."),
  preguntaFinal("melodia", 5, "¿Qué patrón de tonos y semitonos corresponde a una escala mayor?", "Tono-tono-semitono-tono-tono-tono-semitono", ["Tono-semitono-tono-tono-semitono-tono-tono", "Semitono-tono-tono-tono-semitono-tono-tono", "Tono-tono-tono-semitono-tono-tono-semitono"], "La escala mayor sigue el patrón tono-tono-semitono-tono-tono-tono-semitono."),
  preguntaFinal("melodia", 6, "En comparación con la escala mayor, ¿qué grados son un semitono más bajos en la escala menor natural?", "3.º, 6.º y 7.º", ["1.º y 5.º", "2.º y 4.º", "Solo el 3.º"], "La escala menor natural baja un semitono los grados tercero, sexto y séptimo de la escala mayor."),

  preguntaFinal("armonia", 1, "¿Qué notas forman la tríada de La menor?", "La-Do-Mi", ["La-Do-Mi♭", "La-Re-Mi", "La-Do-Fa"], "Una tríada menor se construye con tónica, tercera menor y quinta. En La menor son La, Do y Mi."),
  preguntaFinal("armonia", 2, "Si tocas las notas Do-Mi-Sol una después de otra, ¿qué estás tocando?", "Un arpegio", ["Un acorde simultáneo", "Una escala cromática", "Un compás"], "Un arpegio es un acorde cuyas notas suenan sucesivamente, una después de otra."),
  preguntaFinal("armonia", 3, "¿Por qué las tríadas mayores y menores se describen como estables o consonantes?", "Porque combinan terceras y quintas", ["Porque siempre tienen cuatro notas", "Porque solo usan notas negras", "Porque cambian el tempo"], "Las tríadas mayores y menores combinan terceras y quintas, intervalos que el curso presenta como consonantes."),
  preguntaFinal("armonia", 4, "En una progresión, ¿qué función representa la tónica (I)?", "Reposo y sensación de hogar", ["La máxima tensión", "La preparación del movimiento", "La división del pulso"], "La tónica funciona como punto de reposo o de llegada dentro de la tonalidad."),
  preguntaFinal("armonia", 5, "En Do mayor, ¿cómo se escribe la progresión Do-Sol-La menor-Fa?", "I-V-vi-IV", ["I-IV-V-I", "ii-V-I", "I-vi-IV-V"], "En Do mayor, Do=I, Sol=V, La menor=vi y Fa=IV; la progresión es I-V-vi-IV."),
  preguntaFinal("armonia", 6, "En los números romanos de una progresión, ¿qué indica que un número esté en minúscula?", "Que el acorde es menor", ["Que el acorde es mayor", "Que el acorde se toca más suave", "Que el acorde dura menos"], "En la notación de progresiones enseñada, los números en minúscula representan acordes menores y los mayúsculos acordes mayores."),
];

export function calcularAciertos(preguntas = [], respuestas = {}) {
  if (!Array.isArray(preguntas) || !respuestas || typeof respuestas !== "object") return 0;
  return preguntas.filter((pregunta) => respuestas[pregunta.id] === pregunta.respuesta).length;
}
