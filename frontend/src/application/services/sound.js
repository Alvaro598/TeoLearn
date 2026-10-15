let audioContext;
let backgroundPlayback = null;
const METRONOME_STORAGE_KEY = "teolearn_metronome_bpm";

// ─── Tabla de frecuencias ──────────────────────────────────────────────────────
export const NOTE_FREQUENCIES = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, "C#3": 138.59, D3: 146.83, "D#3": 155.56,
  E3: 164.81, F3: 174.61, "F#3": 185.00,
  G3: 196.00, "G#3": 207.65, A3: 220.00, "A#3": 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13,
  E4: 329.63, F4: 349.23, "F#4": 369.99,
  G4: 392.00, "G#4": 415.30, A4: 440.00, "A#4": 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, "D#5": 622.25,
  E5: 659.25, F5: 698.46, "F#5": 739.99,
  G5: 783.99, "G#5": 830.61, A5: 880.00, "A#5": 932.33, B5: 987.77,
  C6: 1046.50,
  Db3: 138.59, Eb3: 155.56, Gb3: 185.00, Ab3: 207.65, Bb3: 233.08,
  Db4: 277.18, Eb4: 311.13, Gb4: 369.99, Ab4: 415.30, Bb4: 466.16,
  Db5: 554.37, Eb5: 622.25, Gb5: 739.99, Ab5: 830.61, Bb5: 932.33,
};

export function figuraDuracion(figura, bpm = 80) {
  const beat = 60 / bpm;
  return {
    redonda: beat * 4, blanca: beat * 2, negra: beat * 1,
    corchea: beat * 0.5, semicorchea: beat * 0.25, silencio: beat * 1,
  }[figura] ?? beat;
}

// ─── Core ─────────────────────────────────────────────────────────────────────
function getContext() {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function scheduleMetronomeClick(ctx, time, accent) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 1200 : 800;
  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}

export function playTone(frequency = 440, duration = 0.35, type = "sine", volume = 0.12, { metronome = false, bpm = 80 } = {}) {
  const ctx = getContext();
  if (ctx.state === "suspended") ctx.resume();
  const startAt = ctx.currentTime + (metronome ? 0.05 : 0);
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type            = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);

  if (metronome) {
    const beatDuration = 60 / Number(bpm);
    for (let pulse = 0; pulse * beatDuration < duration; pulse += 1) {
      scheduleMetronomeClick(ctx, startAt + pulse * beatDuration, pulse === 0);
    }
  }
}

/** Tono programado en un instante futuro (ctx.currentTime + offsetSec) */
function scheduleTone(frequency, offsetSec, duration, type = "sine", volume = 0.12, glideToFreq = null) {
  const ctx = getContext();
  const t0  = ctx.currentTime + offsetSec;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type            = type;
  osc.frequency.setValueAtTime(frequency, t0);
  if (glideToFreq) {
    osc.frequency.exponentialRampToValueAtTime(glideToFreq, t0 + duration);
  }

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + Math.min(0.02, duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playNote(note, duration = 0.45) {
  playTone(NOTE_FREQUENCIES[note] ?? 440, duration, "triangle", 0.14);
}

export function playSequence(sequence = [], stepDuration = 0.25) {
  const ctx = getContext();
  sequence.forEach((item, index) => {
    const isObj = typeof item === "object" && item !== null && "note" in item;
    const note  = isObj ? item.note : item;
    const start = ctx.currentTime + (isObj ? (item.step - 1) * stepDuration : index * stepDuration);
    const freq  = NOTE_FREQUENCIES[note] ?? 440;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type            = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + stepDuration * 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + stepDuration * 0.8);
  });
}

export function playChord(notes = [], duration = 1.2, volume = 0.09) {
  const ctx = getContext();
  notes.forEach((note) => {
    const freq = NOTE_FREQUENCIES[note] ?? 440;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type            = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  });
}

export function playProgression(chords = [], chordDuration = 1.0, gapSec = 0.15) {
  const ctx  = getContext();
  const step = chordDuration + gapSec;
  chords.forEach((notes, chordIndex) => {
    const startOffset = chordIndex * step;
    notes.forEach((note) => {
      const freq = NOTE_FREQUENCIES[note] ?? 440;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type            = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + chordDuration * 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + chordDuration * 0.9);
    });
  });
}

export function playInterval(note1, note2, mode = "melodico", duration = 0.8) {
  if (mode === "harmonico") {
    playChord([note1, note2], duration);
  } else {
    playNote(note1, duration * 0.9);
    setTimeout(() => playNote(note2, duration * 0.9), duration * 1000);
  }
}

export function playRhythm(pattern = [], bpm = 80) {
  const ctx = getContext();
  let cursor = ctx.currentTime + 0.05;
  pattern.forEach(({ figura, nota }) => {
    const dur = figuraDuracion(figura, bpm);
    if (nota) {
      const freq = NOTE_FREQUENCIES[nota] ?? 440;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type            = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.13, cursor);
      gain.gain.exponentialRampToValueAtTime(0.001, cursor + Math.min(dur * 0.85, 0.5));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(cursor);
      osc.stop(cursor + Math.min(dur * 0.85, 0.5));
    }
    cursor += dur;
  });
}

export function playDrumPattern(pattern = [], bpm = 80, beatUnit = 1, { metronome = false, totalBeats = 4 } = {}) {
  const ctx = getContext();
  if (ctx.state === "suspended") ctx.resume();
  const beat = 60 / bpm;
  const startAt = ctx.currentTime + 0.05;

  if (metronome) {
    for (let pulse = 0; pulse < totalBeats; pulse += 1) {
      const time = startAt + pulse * beat;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = pulse === 0 ? 1200 : 800;
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  pattern.forEach(({ instrumento = "snare", paso, beatOffset, duracionBeats }) => {
    const time = startAt + (beatOffset ?? (paso - 1)) * beat * beatUnit;
    const duracion = Number.isFinite(duracionBeats) ? Math.max(0.03, beat * duracionBeats) : null;
    if (/kick|bombo/i.test(instrumento)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const fin = duracion ?? 0.32;
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(48, time + Math.min(0.13, fin * 0.5));
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.9, time + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, time + fin);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + fin + 0.02);
      return;
    }

    if (/hihat|hat/i.test(instrumento)) {
      const fin = duracion ?? 0.08;
      const length = Math.floor(ctx.sampleRate * fin);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      noise.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.value = 6500;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.12, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (duracion ? fin * 0.9 : 0.065));
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(time);
      noise.stop(time + (duracion ? fin : 0.07));
      return;
    }

    const fin = duracion ?? 0.22;
    const length = Math.floor(ctx.sampleRate * fin);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    noise.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 1400;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.48, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (duracion ? fin * 0.86 : 0.19));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
    noise.stop(time + (duracion ? fin : 0.2));

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const bodyDuration = duracion ? Math.min(0.12, fin * 0.6) : 0.12;
    body.type = "triangle";
    body.frequency.setValueAtTime(190, time);
    body.frequency.exponentialRampToValueAtTime(110, time + Math.min(0.08, bodyDuration));
    bodyGain.gain.setValueAtTime(0.22, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + bodyDuration);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.start(time);
    body.stop(time + bodyDuration + 0.01);
  });
}

/* ═══════════════════════════════════════════════════════
   RETROALIMENTACIÓN EXPRESIVA (éxito / error / rachas / nivel)
═══════════════════════════════════════════════════════ */

/**
 * playSuccess — acorde mayor ascendente arpegiado (C-E-G-C agudo) seguido de
 * un "sparkle" de armónicos agudos. Sensación de logro, no solo un beep.
 */
export function playSuccess() {
  const arpegio = [
    { freq: NOTE_FREQUENCIES.C4, t: 0,    dur: 0.18 },
    { freq: NOTE_FREQUENCIES.E4, t: 0.07, dur: 0.18 },
    { freq: NOTE_FREQUENCIES.G4, t: 0.14, dur: 0.22 },
    { freq: NOTE_FREQUENCIES.C5, t: 0.21, dur: 0.35 },
  ];
  arpegio.forEach(({ freq, t, dur }) => scheduleTone(freq, t, dur, "triangle", 0.13));

  // Sparkle: dos armónicos muy agudos y breves, tipo "destello"
  scheduleTone(NOTE_FREQUENCIES.E5, 0.22, 0.18, "sine", 0.05);
  scheduleTone(NOTE_FREQUENCIES.G5, 0.27, 0.22, "sine", 0.045);
}

/**
 * playError — caída cromática corta (no un "buzz" molesto) + golpe grave breve.
 * Comunica "no" sin ser desagradable ni desalentador.
 */
export function playError() {
  // Caída cromática rápida: tres semitonos descendentes
  scheduleTone(311.13, 0,    0.11, "triangle", 0.09); // D#4
  scheduleTone(293.66, 0.07, 0.11, "triangle", 0.08); // D4
  scheduleTone(277.18, 0.14, 0.16, "triangle", 0.07); // C#4

  // Golpe grave breve para dar "peso" sin ser un zumbido largo
  scheduleTone(110, 0.02, 0.18, "sine", 0.06);
}

/**
 * playPerfectStreak — fanfarria corta para rachas de aciertos consecutivos
 * (ej. 3 o más seguidos). Más enérgica que playSuccess.
 */
export function playPerfectStreak() {
  const notas = [
    { freq: NOTE_FREQUENCIES.C4, t: 0 },
    { freq: NOTE_FREQUENCIES.E4, t: 0.06 },
    { freq: NOTE_FREQUENCIES.G4, t: 0.12 },
    { freq: NOTE_FREQUENCIES.C5, t: 0.18 },
    { freq: NOTE_FREQUENCIES.E5, t: 0.24 },
  ];
  notas.forEach(({ freq, t }) => scheduleTone(freq, t, 0.22, "triangle", 0.12));
  scheduleTone(NOTE_FREQUENCIES.C6, 0.3, 0.4, "sine", 0.07);
}

/**
 * playLevelUp — fanfarria de subida de nivel: acorde mayor sostenido +
 * arpegio rápido ascendente final.
 */
export function playLevelUp() {
  playChord(["C4", "E4", "G4"], 0.5, 0.07);
  const subida = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
  subida.forEach((note, i) =>
    scheduleTone(NOTE_FREQUENCIES[note], 0.15 + i * 0.045, 0.16, "triangle", 0.09)
  );
  scheduleTone(NOTE_FREQUENCIES.C6, 0.55, 0.5, "sine", 0.08);
}

/**
 * playResultScreen(tipo) — sonido de bienvenida a la pantalla de resultado
 * final de una lección. Reemplaza al `<Audio src="/sounds/success.mp3">`
 * roto que existía antes (apuntaba a un archivo que no existe).
 *
 * tipo: "perfecto" (0 errores) | "bien" (con errores pero aprobado) | "mejorar"
 */
export function playResultScreen(tipo = "bien") {
  if (tipo === "perfecto") {
    // Fanfarria completa: arpegio ascendente + acorde final sostenido + sparkle
    const subida = ["C4", "E4", "G4", "C5", "E5"];
    subida.forEach((note, i) =>
      scheduleTone(NOTE_FREQUENCIES[note], i * 0.08, 0.25, "triangle", 0.11)
    );
    setTimeout(() => playChord(["C4", "E4", "G4", "C5"], 0.9, 0.06), 420);
    scheduleTone(NOTE_FREQUENCIES.G5, 0.45, 0.3, "sine", 0.05);
    scheduleTone(NOTE_FREQUENCIES.C6, 0.55, 0.45, "sine", 0.05);
    return;
  }

  if (tipo === "mejorar") {
    // Tono cálido y alentador, NO un sonido de error — solo más suave/neutro
    scheduleTone(NOTE_FREQUENCIES.C4, 0,    0.3, "sine", 0.08);
    scheduleTone(NOTE_FREQUENCIES.E4, 0.12, 0.3, "sine", 0.07);
    scheduleTone(NOTE_FREQUENCIES.G4, 0.24, 0.45, "sine", 0.06);
    return;
  }

  // "bien" (default): acorde mayor simple con un toque de resolución
  playChord(["C4", "E4", "G4"], 0.6, 0.08);
  scheduleTone(NOTE_FREQUENCIES.C5, 0.18, 0.4, "triangle", 0.08);
}

/* ═══════════════════════════════════════════════════════
   METRÓNOMO — STUBS DE RETROCOMPATIBILIDAD
   El metrónomo real ahora vive en useMetronomo.js (hook) que usa
   AudioContext scheduling en vez de setInterval, eliminando el drift.
   Estas funciones se mantienen por si algún módulo las importa
   directamente, pero el componente Metronomo.jsx ya usa solo el hook.
═══════════════════════════════════════════════════════ */
export function getMetronomeBpm() {
  const stored = Number(localStorage.getItem(METRONOME_STORAGE_KEY));
  return (!stored || Number.isNaN(stored)) ? 80 : Math.min(200, Math.max(40, stored));
}

export function setMetronomeBpm(bpm) {
  const value = Math.min(200, Math.max(40, Number(bpm)));
  localStorage.setItem(METRONOME_STORAGE_KEY, value.toString());
}

// startMetronome / stopMetronome se dejan como no-ops: el hook
// gestiona su propio AudioContext y no debe compartir estado global.
export function startMetronome() {
  console.warn("[TeoLearn] startMetronome() está deprecado. Usa el hook useMetronomo().");
}

export function stopMetronome() {
  console.warn("[TeoLearn] stopMetronome() está deprecado. Usa el hook useMetronomo().");
}

export function isMetronomeRunning() { return false; }

/* ═══════════════════════════════════════════════════════
   MÚSICA DE FONDO — COMPOSICIONES ORIGINALES EN WEB AUDIO
═══════════════════════════════════════════════════════ */

export const BACKGROUND_TRACKS = [
  { id: "chiptune", label: "Chiptune de aventura", description: "Melodía original de 8 bits con bajo y percusión suave." },
  { id: "calm", label: "Chiptune tranquilo", description: "Arpegios lentos y armonías suaves para concentrarse." },
  { id: "arcade", label: "Arcade energético", description: "Ritmo más rápido y melodía retro para sesiones activas." },
  { id: "lofi", label: "Lo-fi", description: "Acordes cálidos, melodía relajada y ritmo apagado." },
  { id: "postpunk", label: "Post-punk", description: "Bajo marcado, guitarra sintetizada y pulso constante." },
  { id: "synthwave", label: "Synthwave", description: "Capas brillantes y arpegios electrónicos retro." },
  { id: "chillwave", label: "Chillwave", description: "Texturas suaves, notas largas y ambiente espacioso." },
];

const MUSIC_TRACKS = {
  chiptune: {
    bpm: 108,
    leadWave: "square",
    bassWave: "triangle",
    padWave: "triangle",
    leadVolume: 0.035,
    bassVolume: 0.045,
    padVolume: 0.012,
    noteLength: 0.8,
    drums: true,
    melody: [72, 79, 76, 79, 74, 79, 76, 74, 81, 76, 72, 76, 77, 76, 72, 67],
    bass: [36, 31, 33, 29],
    chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
  },
  calm: {
    bpm: 76,
    leadWave: "triangle",
    bassWave: "sine",
    padWave: "sine",
    leadVolume: 0.026,
    bassVolume: 0.035,
    padVolume: 0.018,
    noteLength: 1.7,
    drums: false,
    melody: [69, 0, 72, 76, 0, 72, 74, 0, 67, 0, 72, 76, 0, 74, 72, 0],
    bass: [33, 29, 36, 31],
    chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]],
  },
  arcade: {
    bpm: 132,
    leadWave: "square",
    bassWave: "square",
    padWave: "triangle",
    leadVolume: 0.03,
    bassVolume: 0.035,
    padVolume: 0.009,
    noteLength: 0.68,
    drums: true,
    melody: [72, 76, 79, 84, 83, 79, 76, 79, 81, 84, 88, 84, 83, 81, 79, 76],
    bass: [36, 43, 41, 45],
    chords: [[60, 64, 67], [55, 59, 62], [53, 57, 60], [57, 60, 64]],
  },
  lofi: {
    bpm: 82,
    leadWave: "sine",
    bassWave: "triangle",
    padWave: "triangle",
    leadVolume: 0.025,
    bassVolume: 0.04,
    padVolume: 0.018,
    leadFilter: 1800,
    bassFilter: 520,
    padFilter: 1100,
    leadDetune: -3,
    noteLength: 1.35,
    drums: true,
    kickVolume: 0.018,
    snareVolume: 0.006,
    hatVolume: 0.0015,
    melody: [69, 0, 72, 76, 72, 0, 69, 0, 67, 0, 72, 74, 72, 0, 69, 0],
    bass: [45, 41, 48, 43],
    chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]],
  },
  postpunk: {
    bpm: 118,
    leadWave: "sawtooth",
    bassWave: "sawtooth",
    padWave: "triangle",
    leadVolume: 0.018,
    bassVolume: 0.065,
    padVolume: 0.009,
    leadFilter: 1250,
    bassFilter: 480,
    padFilter: 900,
    noteLength: 0.72,
    drums: true,
    kickVolume: 0.045,
    snareVolume: 0.018,
    hatVolume: 0.004,
    melody: [57, 0, 57, 60, 62, 60, 57, 55, 53, 0, 53, 57, 60, 57, 55, 53],
    bass: [45, 41, 43, 48],
    chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [60, 64, 67]],
  },
  synthwave: {
    bpm: 102,
    leadWave: "sawtooth",
    bassWave: "triangle",
    padWave: "sawtooth",
    leadVolume: 0.026,
    bassVolume: 0.044,
    padVolume: 0.012,
    leadFilter: 2600,
    padFilter: 1500,
    leadDetune: 5,
    noteLength: 0.92,
    drums: true,
    kickVolume: 0.035,
    snareVolume: 0.01,
    hatVolume: 0.003,
    melody: [76, 79, 83, 79, 76, 79, 86, 83, 74, 78, 81, 78, 74, 78, 85, 81],
    bass: [40, 36, 38, 33],
    chords: [[52, 55, 59], [48, 52, 55], [50, 54, 57], [45, 49, 52]],
  },
  chillwave: {
    bpm: 78,
    leadWave: "triangle",
    bassWave: "sine",
    padWave: "sine",
    leadVolume: 0.019,
    bassVolume: 0.032,
    padVolume: 0.021,
    leadFilter: 1450,
    padFilter: 1000,
    leadDetune: 9,
    noteLength: 1.75,
    drums: false,
    melody: [72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 69, 0, 72, 0],
    bass: [36, 33, 29, 31],
    chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
  },
};

function midiFrequency(note) {
  return 440 * (2 ** ((note - 69) / 12));
}

function scheduleMusicNote(ctx, master, note, time, duration, waveform, volume, options = {}) {
  if (!note || volume <= 0) return;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  const end = time + Math.max(0.06, duration);

  oscillator.type = waveform;
  oscillator.frequency.value = midiFrequency(note);
  oscillator.detune.value = options.detune ?? 0;
  envelope.gain.setValueAtTime(0.0001, time);
  envelope.gain.linearRampToValueAtTime(volume, time + 0.012);
  envelope.gain.setValueAtTime(volume, Math.max(time + 0.013, end - 0.035));
  envelope.gain.linearRampToValueAtTime(0.0001, end);
  if (options.filterFrequency) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = options.filterFrequency;
    oscillator.connect(filter);
    filter.connect(envelope);
  } else {
    oscillator.connect(envelope);
  }
  envelope.connect(master);
  oscillator.start(time);
  oscillator.stop(end + 0.01);
}

function createNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
  return buffer;
}

function scheduleNoiseHit(ctx, master, noiseBuffer, time, volume) {
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const envelope = ctx.createGain();
  source.buffer = noiseBuffer;
  filter.type = "highpass";
  filter.frequency.value = 1600;
  envelope.gain.setValueAtTime(volume, time);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(master);
  source.start(time);
  source.stop(time + 0.1);
}

function scheduleKick(ctx, master, time, volume = 0.035) {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(135, time);
  oscillator.frequency.exponentialRampToValueAtTime(48, time + 0.12);
  envelope.gain.setValueAtTime(volume, time);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
  oscillator.connect(envelope);
  envelope.connect(master);
  oscillator.start(time);
  oscillator.stop(time + 0.15);
}

function scheduleMusicStep(ctx, master, noiseBuffer, track, step, time, stepDuration) {
  const melodyNote = track.melody[step];
  scheduleMusicNote(
    ctx, master, melodyNote, time, stepDuration * track.noteLength,
    track.leadWave, track.leadVolume,
    { filterFrequency: track.leadFilter, detune: track.leadDetune }
  );

  if (step % 4 === 0) {
    const chordIndex = step / 4;
    scheduleMusicNote(
      ctx, master, track.bass[chordIndex], time, stepDuration * 3.7,
      track.bassWave, track.bassVolume, { filterFrequency: track.bassFilter }
    );
    track.chords[chordIndex].forEach((note) => {
      scheduleMusicNote(
        ctx, master, note, time, stepDuration * 3.7,
        track.padWave, track.padVolume, { filterFrequency: track.padFilter }
      );
    });
  }

  if (!track.drums) return;
  if (step === 0 || step === 8) scheduleKick(ctx, master, time, track.kickVolume ?? 0.035);
  if (step === 4 || step === 12) scheduleNoiseHit(ctx, master, noiseBuffer, time, track.snareVolume ?? 0.012);
  if (step % 2 === 1) scheduleNoiseHit(ctx, master, noiseBuffer, time, track.hatVolume ?? 0.0035);
}

export function startBackgroundMusic(trackId = "chiptune") {
  const id = Object.hasOwn(MUSIC_TRACKS, trackId) ? trackId : "chiptune";
  const ctx = getContext();

  if (backgroundPlayback?.trackId === id) {
    if (ctx.state === "suspended") {
      return ctx.resume().catch((error) => console.warn("No se pudo iniciar la música:", error));
    }
    return Promise.resolve();
  }

  stopBackgroundMusic();

  const track = MUSIC_TRACKS[id];
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.25);
  master.connect(ctx.destination);

  const playback = {
    trackId: id,
    master,
    active: true,
    timer: null,
    noiseBuffer: track.drums ? createNoiseBuffer(ctx) : null,
  };
  backgroundPlayback = playback;

  const stepDuration = 60 / track.bpm / 2;
  let step = 0;
  let nextTime = ctx.currentTime + 0.06;
  const scheduleAhead = () => {
    if (!playback.active) return;
    while (nextTime < ctx.currentTime + 0.12) {
      scheduleMusicStep(ctx, master, playback.noiseBuffer, track, step, nextTime, stepDuration);
      step = (step + 1) % track.melody.length;
      nextTime += stepDuration;
    }
    playback.timer = window.setTimeout(scheduleAhead, 25);
  };

  scheduleAhead();
  if (ctx.state === "suspended") {
    return ctx.resume().catch((error) => console.warn("No se pudo iniciar la música:", error));
  }
  return Promise.resolve();
}

export function stopBackgroundMusic() {
  if (!backgroundPlayback) return;
  const playback = backgroundPlayback;
  backgroundPlayback = null;
  playback.active = false;
  window.clearTimeout(playback.timer);
  const now = audioContext?.currentTime ?? 0;
  playback.master.gain.cancelScheduledValues(now);
  playback.master.gain.setTargetAtTime(0.0001, now, 0.025);
  window.setTimeout(() => playback.master.disconnect(), 140);
}

// ─── Alias retrocompatible ─────────────────────────────────────────────────────
export const playPattern = playSequence;
