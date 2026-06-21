let audioContext;
let backgroundNodes;
let backgroundTrackId = null;
let metronomeInterval = null;
let metronomeBeat     = 0;
let metronomeEnabled  = false;

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

export function playTone(frequency = 440, duration = 0.35, type = "sine", volume = 0.12) {
  const ctx = getContext();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type            = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
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
   METRÓNOMO
═══════════════════════════════════════════════════════ */
export function getMetronomeBpm() {
  const stored = Number(localStorage.getItem(METRONOME_STORAGE_KEY));
  return (!stored || Number.isNaN(stored)) ? 80 : Math.min(200, Math.max(40, stored));
}

export function setMetronomeBpm(bpm) {
  const value = Math.min(200, Math.max(40, Number(bpm)));
  localStorage.setItem(METRONOME_STORAGE_KEY, value.toString());
  if (metronomeEnabled) { stopMetronome(); startMetronome(); }
}

function playMetronomeClick(accent = false) {
  playTone(accent ? 1200 : 800, 0.05, "square", accent ? 0.12 : 0.08);
}

export function startMetronome() {
  if (metronomeInterval) return;
  const interval = (60 / getMetronomeBpm()) * 1000;
  metronomeEnabled = true;
  metronomeBeat    = 0;
  playMetronomeClick(true);
  metronomeInterval = setInterval(() => {
    metronomeBeat++;
    playMetronomeClick(metronomeBeat % 4 === 0);
  }, interval);
}

export function stopMetronome() {
  metronomeEnabled = false;
  metronomeBeat    = 0;
  if (metronomeInterval) { clearInterval(metronomeInterval); metronomeInterval = null; }
}

export function isMetronomeRunning() { return metronomeEnabled; }

/* ═══════════════════════════════════════════════════════
   MÚSICA DE FONDO — 4 PISTAS PRECARGADAS SELECCIONABLES
   (100% sintetizadas con Web Audio API, sin archivos externos)
═══════════════════════════════════════════════════════ */

export const BACKGROUND_TRACKS = [
  { id: "ambient", label: "Ambiente suave",   description: "Pad cálido y envolvente. Ideal para lectura teórica." },
  { id: "focus",   label: "Enfoque profundo", description: "Drone grave y estable. Ideal para ejercicios MIDI/auditivos." },
  { id: "lofi",    label: "Lo-fi relajado",   description: "Pulso suave con aire urbano. Ideal para sesiones largas." },
  { id: "piano",   label: "Piano de estudio", description: "Arpegios lentos tipo piano. Ideal para repaso de teoría." },
];

const BACKGROUND_TRACK_IDS = BACKGROUND_TRACKS.map((t) => t.id);

function buildAmbientPad(ctx, master) {
  const freqs = [261.63, 329.63, 392.0, 493.88]; // C-E-G-B pad
  return freqs.map((frequency, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type            = i % 2 ? "sine" : "triangle";
    osc.frequency.value = frequency / 2;
    gain.gain.value     = 0.018;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return osc;
  });
}

function buildFocusDrone(ctx, master) {
  // Drone grave estable con un leve detune entre dos osciladores
  // (sensación "binaural-like" de estabilidad, sin ser literalmente binaural).
  const base = 110; // A2
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = base;
  osc2.frequency.value = base * 1.5; // quinta justa por encima, drone estable
  gain.gain.value = 0.022;

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(master);
  osc1.start();
  osc2.start();

  return [osc1, osc2];
}

function buildLofiPulse(ctx, master) {
  // Pad suave + un "pulso" rítmico lento y discreto en el filtro de volumen,
  // simulando la sensación lo-fi sin samples externos.
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo  = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.value = 220; // A3
  gain.gain.value = 0.02;

  lfo.type = "sine";
  lfo.frequency.value = 0.5; // pulso lento (~1 ciclo cada 2s)
  lfoGain.gain.value = 0.01;

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc.connect(gain);
  gain.connect(master);

  osc.start();
  lfo.start();

  return [osc, lfo];
}

function buildPianoArpeggio(ctx, master) {
  // Arpegio lento en loop (C-E-G-B-C) tipo "piano de estudio", reprogramado
  // cada vez que termina la secuencia mientras la pista siga activa.
  const secuencia = [261.63, 329.63, 392.0, 493.88, 523.25];
  const nodos = [];
  let activo = true;
  let stepIndex = 0;

  function tocarSiguiente() {
    if (!activo) return;
    const freq = secuencia[stepIndex % secuencia.length];
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 1.7);
    stepIndex++;
    nodos.push(osc);
    if (activo) setTimeout(tocarSiguiente, 1400);
  }

  tocarSiguiente();

  return {
    stop: () => { activo = false; },
    oscillators: nodos,
  };
}

/**
 * startBackgroundMusic(trackId)
 * Si no se especifica trackId, usa "ambient" por defecto (retrocompatible).
 */
export function startBackgroundMusic(trackId = "ambient") {
  const id = BACKGROUND_TRACK_IDS.includes(trackId) ? trackId : "ambient";

  // Si ya está sonando la misma pista, no reiniciar (evita "clics")
  if (backgroundNodes && backgroundTrackId === id) return;

  // Si hay otra pista sonando, detenerla primero
  if (backgroundNodes) stopBackgroundMusic();

  const ctx    = getContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  let builderResult;
  switch (id) {
    case "focus":
      builderResult = { oscillators: buildFocusDrone(ctx, master) };
      break;
    case "lofi":
      builderResult = { oscillators: buildLofiPulse(ctx, master) };
      break;
    case "piano":
      builderResult = buildPianoArpeggio(ctx, master);
      break;
    case "ambient":
    default:
      builderResult = { oscillators: buildAmbientPad(ctx, master) };
      break;
  }

  backgroundTrackId = id;
  backgroundNodes = { ...builderResult, master, trackId: id };
}

export function stopBackgroundMusic() {
  if (!backgroundNodes) return;
  backgroundNodes.stop?.();
  backgroundNodes.oscillators?.forEach((o) => { try { o.stop(); } catch { /* ya detenido */ } });
  backgroundNodes.master.disconnect();
  backgroundNodes = null;
  backgroundTrackId = null;
}

export function getCurrentBackgroundTrack() {
  return backgroundTrackId;
}

// ─── Alias retrocompatible ─────────────────────────────────────────────────────
export const playPattern = playSequence;