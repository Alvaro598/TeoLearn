import { Send, Trash2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { preguntarIA } from "../../../../application/services/chatbot";
import { speakText, stopSpeech } from "../../../../application/services/speech";
import { usePreferences } from "../../../../application/context/PreferencesContext";

const initialMessages = [
  {
    from: "bot",
    text: "Hola, soy Teo. Puedo ayudarte con teoria musical, practica, ejercicios y dudas sobre la plataforma.",
  },
];

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem("teolearn-chat-history") || "null") || initialMessages;
  } catch {
    return initialMessages;
  }
}

export default function ChatPanel({ fullPage = false }) {
  const { preferences } = usePreferences();
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("teolearn-chat-history", JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages((current) => [
      ...current,
      { from: "user", text: question },
      { from: "bot", text: "Pensando..." },
    ]);

    try {
      const answer = await preguntarIA(question);

      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = { from: "bot", text: answer };
        return updated;
      });

      if (preferences.ttsEnabled && fullPage) {
        speakText(answer, {
          onStart: () => setSpeakingText(answer),
          onEnd: () => setSpeakingText(""),
          onError: () => setSpeakingText(""),
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          from: "bot",
          text: "No pude conectarme con la IA. Revisa el backend o la clave de OpenRouter.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    stopSpeech();
    setSpeakingText("");
    setMessages(initialMessages);
    localStorage.removeItem("teolearn-chat-history");
  };

  const toggleSpeech = (text) => {
    if (speakingText === text) {
      stopSpeech();
      setSpeakingText("");
      return;
    }

    speakText(text, {
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(""),
      onError: () => setSpeakingText(""),
    });
  };

  return (
    <div className={`bg-white border border-gray-200 flex flex-col ${fullPage ? "min-h-[72vh] rounded-xl" : "h-[420px] rounded-2xl overflow-hidden"}`}>
      <header className="bg-brand-blue text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Teo</h2>
          <p className="text-xs opacity-80">Tutor musical con historial</p>
        </div>

        <button
          onClick={clear}
          className="inline-flex items-center gap-2 text-xs bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg"
        >
          <Trash2 size={14} />
          Limpiar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={`${message.from}-${index}`}
            className={`group max-w-[82%] px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
              message.from === "user"
                ? "bg-brand-blue text-white ml-auto"
                : "bg-white text-gray-800"
            }`}
          >
            <p className="whitespace-pre-line">{message.text}</p>

            {message.from === "bot" && message.text !== "Pensando..." && (
              <button
                onClick={() => toggleSpeech(message.text)}
                className={`mt-2 items-center gap-1 text-xs text-brand-blue ${
                  speakingText === message.text ? "inline-flex" : "hidden group-hover:inline-flex"
                }`}
              >
                {speakingText === message.text ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {speakingText === message.text ? "Detener" : "Escuchar"}
              </button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <footer className="border-t p-3 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          disabled={isLoading}
          placeholder="Pregunta sobre musica..."
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />

        <button
          onClick={send}
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center justify-center bg-brand-blue disabled:bg-gray-400 text-white w-11 rounded-xl"
        >
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
}
