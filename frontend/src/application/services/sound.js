let audioContext;
let backgroundNodes;

let metronomeInterval = null;
let metronomeBeat = 0;
let metronomeEnabled = false;

const METRONOME_STORAGE_KEY = "teolearn_metronome_bpm";

const noteFrequencies = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

function getContext() {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

export function playTone(
  frequency = 440,
  duration = 0.35,
  type = "sine",
  volume = 0.12
) {
  const ctx = getContext();

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function playNote(note, duration = 0.45) {
  playTone(
    noteFrequencies[note] || 440,
    duration,
    "triangle",
    0.14
  );
}

export function playSequence(sequence = [], stepDuration = 0.25) {
  const ctx = getContext();

  sequence.forEach((item, index) => {
    const isObject =
      typeof item === "object" &&
      item !== null &&
      "note" in item;

    const note = isObject ? item.note : item;

    const start =
      ctx.currentTime +
      (isObject
        ? (item.step - 1) * stepDuration
        : index * stepDuration);

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value =
      noteFrequencies[note] || 440;

    gain.gain.setValueAtTime(0.12, start);

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      start + stepDuration * 0.8
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + stepDuration * 0.8);
  });
}

export function playSuccess() {
  playSequence(["C4", "E4", "G4"], 0.16);
}

export function playError() {
  playTone(220, 0.18, "sawtooth", 0.08);

  setTimeout(() => {
    playTone(180, 0.22, "sawtooth", 0.08);
  }, 130);
}

/* =========================================
   METRÓNOMO
========================================= */

export function getMetronomeBpm() {
  const stored = Number(
    localStorage.getItem(METRONOME_STORAGE_KEY)
  );

  if (!stored || Number.isNaN(stored)) {
    return 80;
  }

  return Math.min(200, Math.max(40, stored));
}

export function setMetronomeBpm(bpm) {
  const value = Math.min(
    200,
    Math.max(40, Number(bpm))
  );

  localStorage.setItem(
    METRONOME_STORAGE_KEY,
    value.toString()
  );

  if (metronomeEnabled) {
    stopMetronome();
    startMetronome();
  }
}

function playMetronomeClick(accent = false) {
  playTone(
    accent ? 1200 : 800,
    0.05,
    "square",
    accent ? 0.12 : 0.08
  );
}

export function startMetronome() {
  if (metronomeInterval) return;

  const bpm = getMetronomeBpm();
  const interval = (60 / bpm) * 1000;

  metronomeEnabled = true;
  metronomeBeat = 0;

  playMetronomeClick(true);

  metronomeInterval = setInterval(() => {
    metronomeBeat++;

    const accent = metronomeBeat % 4 === 0;

    playMetronomeClick(accent);
  }, interval);
}

export function stopMetronome() {
  metronomeEnabled = false;
  metronomeBeat = 0;

  if (metronomeInterval) {
    clearInterval(metronomeInterval);
    metronomeInterval = null;
  }
}

export function isMetronomeRunning() {
  return metronomeEnabled;
}

/* =========================================
   MÚSICA DE FONDO
========================================= */

export function startBackgroundMusic() {
  if (backgroundNodes) return;

  const ctx = getContext();

  const master = ctx.createGain();

  const notes = [
    261.63,
    329.63,
    392.0,
    493.88,
  ];

  const oscillators = notes.map(
    (frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type =
        index % 2 ? "sine" : "triangle";

      oscillator.frequency.value =
        frequency / 2;

      gain.gain.value = 0.018;

      oscillator.connect(gain);
      gain.connect(master);

      oscillator.start();

      return oscillator;
    }
  );

  master.connect(ctx.destination);

  backgroundNodes = {
    oscillators,
    master,
  };
}

export function stopBackgroundMusic() {
  if (!backgroundNodes) return;

  backgroundNodes.oscillators.forEach(
    (oscillator) => oscillator.stop()
  );

  backgroundNodes.master.disconnect();

  backgroundNodes = null;
}