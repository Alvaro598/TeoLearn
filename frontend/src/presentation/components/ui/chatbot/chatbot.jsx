import { useState } from "react";
import { preguntarIA } from "../../../../application/services/chatbot";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "🎵 Hola, soy Teo y sere tu tutor musical. ¿En qué te puedo ayudar?",
    },
  ]);

  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const preguntaActual = input;

    const userMessage = {
      from: "user",
      text: preguntaActual,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");

    setIsLoading(true);

    // mensaje temporal
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "Pensando...",
      },
    ]);

    try {
      const respuestaIA =
        await preguntarIA(preguntaActual);

      setMessages((prev) => {
        const updated = [...prev];

        // reemplaza "Pensando..."
        updated[updated.length - 1] = {
          from: "bot",
          text: respuestaIA,
        };

        return updated;
      });

    } catch (error) {
      console.error(error);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          from: "bot",
          text: "Error conectando con la IA.",
        };

        return updated;
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* CHAT */}
      {open && (
        <div className="w-80 h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 mb-3">

          {/* HEADER */}
          <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between">

            <div>
              <h2 className="font-semibold">
                Teo 🎵
              </h2>

              <p className="text-xs opacity-80">
                Asistente musical
              </p>
            </div>

            <button
              onClick={() =>
                setOpen(false)
              }
              className="text-xl hover:opacity-70"
            >
              ×
            </button>
          </div>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                  m.from === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-white text-gray-800"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="border-t p-2 flex gap-2 bg-white">

            <input
              type="text"
              value={input}
              disabled={isLoading}
              placeholder="Pregunta sobre música..."

              onChange={(e) =>
                setInput(e.target.value)
              }

              onKeyDown={(e) =>
                e.key === "Enter" &&
                send()
              }

              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={send}
              disabled={
                isLoading ||
                !input.trim()
              }

              className={`px-4 rounded-xl text-white transition ${
                isLoading ||
                !input.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "..." : "→"}
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() =>
          setOpen(!open)
        }

        className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-xl text-2xl transition"
      >
        🤖
      </button>
    </div>
  );
}