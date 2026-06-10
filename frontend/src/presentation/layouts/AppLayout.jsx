import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/ui/Navbar";

import Chatbot from "../components/ui/chatbot/chatbot";

export default function AppLayout() {
  const { pathname } = useLocation();
  const hideChatbot =
    pathname === "/chat" ||
    pathname === "/quiz-final" ||
    pathname.startsWith("/ejercicio/");

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR GLOBAL */}
      <Navbar />

      {/* CONTENIDO */}
      <main>
        <Outlet />
      </main>

      {/* CHATBOT */}
      {!hideChatbot && <Chatbot />}


    </div>
  );
}