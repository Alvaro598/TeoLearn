export function speakText(
  text,
  { lang = "es-ES", rate = 0.95, onStart, onEnd, onError } = {}
) {
  if (!("speechSynthesis" in window) || !text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    String(text).replace(/\s+/g, " ").trim()
  );

  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
