# Revisión educativa de los cuestionarios

## Alcance y hallazgos

La fuente curricular revisada es `backend/src/database/learningPathData.js`: tres módulos, dos unidades por módulo y diecisiete lecciones. La revisión abarca los quizzes por módulo y la evaluación final; no cambia los ejercicios de práctica que ya forman parte de las lecciones.

Los bancos estaban duplicados en `frontend/src/presentation/pages/QuizFinal.jsx` y `backend/src/database/quizQuestions.js`. Ahora ambos importan el banco común de `shared/quizQuestions.js`. La pantalla presenta una pregunta, valida la selección por igualdad con `respuesta`, mezcla las opciones y muestra `explicacion`; los resultados calculan aciertos con la misma función que el controlador del backend. Las rutas del controlador ya están montadas bajo `/api/evaluaciones` y protegidas con el middleware de verificación del token de Firebase.

### Quizzes por módulo

| Módulo / ID | Concepto | Lección que lo respalda | Decisión | Motivo |
|---|---|---|---|---|
| Ritmo 1 | Tempo: cambio de velocidad del pulso | Tempo | Corregir | Se hizo más directa la respuesta; el patrón y el orden se conservan al variar BPM. |
| Ritmo 2 | Pulsos en 3/4 y 4/4 | Compás | Corregir | El enunciado pregunta directamente por la cantidad de pulsos de cada compás. |
| Ritmo 3 | Completar un compás de 4/4 | Redonda, blanca y negra; Corcheas | Corregir | Antes había dos opciones equivalentes en duración (“una negra” y “dos corcheas”). Ahora se pregunta por pulsos faltantes y solo hay una respuesta. |
| Ritmo 4 | Dos corcheas por pulso | Corcheas | Corregir | Se expresa la respuesta como número de ataques por pulso, con una única opción correcta. |
| Ritmo 5 | Mantener el conteo durante un silencio | Silencios | Conservar | Comprueba que el pulso continúa aunque falte un sonido. |
| Ritmo 6 | Sincronizar golpes con el metrónomo | Metrónomo | Conservar | Corresponde a la práctica explícita de no adelantarse a los clics. |
| Melodía 1 | Intervalo de quinta entre Do y Sol | Intervalos | Corregir | Se eliminó “justa”, cualidad no necesaria para el objetivo de contar el intervalo. |
| Melodía 2 | Orden de las notas naturales | Notas musicales | Sustituir | La pregunta anterior exigía leer una posición del pentagrama, habilidad que la lección no enseña. |
| Melodía 3 | Enarmonía de C# y Db | Sistema anglosajón y alteraciones | Corregir | Se conserva el concepto y se simplifica la formulación. |
| Melodía 4 | Diferencia de inicio entre Do mayor y La menor | Escala menor | Corregir | Se reemplazó “centro tonal” por la explicación concreta de que las escalas comienzan en notas distintas. |
| Melodía 5 | Primer semitono de Do mayor | Escala mayor | Corregir | Se especificó que se busca el primer semitono al subir desde Do para evitar que Mi-Fa y Si-Do puedan leerse como dos respuestas. |
| Melodía 6 | Movimiento por grado entre notas vecinas | Intervalos | Conservar | La lección define el movimiento por grado como desplazamiento por segundas. |
| Armonía 1 | Notas de la tríada de Do mayor | Tríadas | Corregir | Se pregunta directamente por las tres notas explicadas en la lección. |
| Armonía 2 | Tercera que distingue Do mayor de Do menor | Acordes mayores y menores | Conservar | La respuesta coincide con el cambio de un semitono en la tercera que enseña la lección. |
| Armonía 3 | Función dominante de Sol mayor en Do mayor | Tónica, subdominante y dominante | Conservar | Evalúa la tensión de V y su tendencia a resolver en I. |
| Armonía 4 | Función subdominante de Fa mayor | Tónica, subdominante y dominante | Sustituir | La cadencia plagal de la pregunta anterior no está enseñada; se reemplazó por la función IV que sí aparece en el curso. |
| Armonía 5 | Análisis de Do-Fa-Sol-Do | Progresiones armónicas | Conservar | La secuencia I-IV-V-I se enseña y se practica con esos acordes. |
| Armonía 6 | Análisis de Re menor-Sol-Do | Progresiones armónicas | Conservar | La progresión ii-V-I aparece explícitamente en el contenido y ejemplo de la lección. |

### Evaluación final

La evaluación mantiene seis preguntas por módulo. Se sustituyeron las anteriores porque introducían conceptos que no aparecen en las lecciones, como síncopa, ostinato, hemiola, transposición, inversiones y conducción de voces.

| Módulo / ID | Concepto | Lección que lo respalda | Decisión | Motivo |
|---|---|---|---|---|
| Final Ritmo 1 | Conversión de 120 BPM a dos pulsos por segundo | Tempo | Sustituir | Reemplaza un término especializado por una aplicación directa de BPM. |
| Final Ritmo 2 | Cantidad de pulsos en 2/4 | Compás | Sustituir | El 2/4 se explica en la lección y no se preguntaba en el quiz modular. |
| Final Ritmo 3 | Acento más fuerte del 4/4 | Compás | Sustituir | Comprueba el acento inicial explicado en la lección. |
| Final Ritmo 4 | Suma de duración de dos blancas | Redonda, blanca y negra | Sustituir | Aplica el valor de dos pulsos por blanca. |
| Final Ritmo 5 | Duración del silencio de negra | Silencios | Sustituir | Evalúa el valor de un pulso, presentado en la lección. |
| Final Ritmo 6 | Función de la barra simple | Compás | Sustituir | Comprueba la explicación de que separa compases. |
| Final Melodía 1 | Siete notas naturales | Notas musicales | Sustituir | Reemplaza transposición por el conjunto de notas enseñado. |
| Final Melodía 2 | Misma nota en octavas distintas | Notas musicales; Altura musical: graves y agudos | Sustituir | Evalúa Do4 y Do5 como el mismo nombre en alturas diferentes. |
| Final Melodía 3 | Equivalencia de A y La | Sistema anglosajón y alteraciones | Sustituir | Comprueba la tabla de equivalencias de letras y nombres latinos. |
| Final Melodía 4 | Definición de intervalo | Intervalos | Sustituir | Reemplaza contorno y fraseo, no explicados en el currículo, por la definición de distancia en altura. |
| Final Melodía 5 | Fórmula de tonos y semitonos de la escala mayor | Escala mayor | Sustituir | Evalúa la fórmula que aparece en la lección. |
| Final Melodía 6 | Grados que bajan en la escala menor natural | Escala menor | Sustituir | Reemplaza conceptos de arreglo por los grados 3.º, 6.º y 7.º enseñados. |
| Final Armonía 1 | Notas de la tríada de La menor | Tríadas | Sustituir | Aplica la construcción La-Do-Mi de la lección. |
| Final Armonía 2 | Arpegio como notas sucesivas de un acorde | Tríadas | Sustituir | Evalúa una definición y ejemplo explícitos del curso. |
| Final Armonía 3 | Consonancia de terceras y quintas | Tríadas | Sustituir | Reemplaza inversiones por la explicación de estabilidad presente en la lección. |
| Final Armonía 4 | Función de reposo de la tónica | Tónica, subdominante y dominante | Sustituir | Reemplaza pedal de tónica por la función de reposo enseñada. |
| Final Armonía 5 | Análisis de Do-Sol-La menor-Fa | Progresiones armónicas | Sustituir | Aplica la progresión I-V-vi-IV que aparece en el contenido. |
| Final Armonía 6 | Números romanos minúsculos para acordes menores | Progresiones armónicas | Sustituir | Evalúa la convención de mayúsculas y minúsculas explicada en la lección. |

## Validaciones técnicas

- Los bancos de frontend y backend ahora reexportan la misma fuente de preguntas.
- Se añadieron pruebas para conteos y distribución, respuesta incluida exactamente una vez, opciones sin duplicados, explicaciones y enunciados no repetidos.
- `calcularAciertos` se comparte entre la pantalla del quiz, la página de resultados y el controlador para evitar cálculos divergentes.
- Las explicaciones continúan incluidas en los datos y se muestran tras responder y en el resultado.
- Las rutas autenticadas ofrecen preguntas por módulo o para la evaluación final (`GET /:slug/preguntas`), recepción de respuestas (`POST /evaluar`) y consulta del resultado final (`GET /final/resultado`).
- `backend`: `npm test` termina con 10 pruebas aprobadas.
- `frontend`: `npm run build` terminó correctamente en la revisión anterior; los tres errores detectados por ESLint se corrigieron: el reinicio del cronómetro ya no actualiza estado desde un efecto y se retiraron imports y props sin uso de `ModuloCardDashboard.jsx`.
