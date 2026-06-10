import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import ChatPanel from "./ChatPanel";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="w-80 mb-3 shadow-2xl">
          <ChatPanel />
        </div>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="w-14 h-14 rounded-full bg-brand-blue hover:bg-blue-800 text-white shadow-xl transition inline-flex items-center justify-center"
        aria-label={open ? "Cerrar chatbot" : "Abrir chatbot"}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </div>
  );
}
