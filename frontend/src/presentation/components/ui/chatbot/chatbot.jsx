import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import ChatPanel from "./ChatPanel";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 shadow-2xl">
          <ChatPanel />
        </div>
      )}

      <button
      id="boton-chatbot"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-blue hover:bg-blue-800 text-white shadow-xl transition flex items-center justify-center"
        aria-label={open ? "Cerrar chatbot" : "Abrir chatbot"}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </>
  );
}