import ChatPanel from "../components/ui/chatbot/ChatPanel";

export default function ChatTutor() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-pink mb-3">
          Tutor IA
        </p>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 mb-4">
          Conversa con Teo
        </h1>

        <p className="text-gray-600 text-lg mb-8 max-w-3xl">
          Usa esta pagina para resolver dudas, pedir ejemplos, repasar conceptos o preparar una practica con tu instrumento.
          El historial se guarda en este navegador para que puedas continuar la conversacion.
        </p>

        <ChatPanel fullPage />
      </div>
    </div>
  );
}
