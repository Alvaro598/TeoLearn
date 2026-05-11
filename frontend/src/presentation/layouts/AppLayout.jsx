import { Outlet } from "react-router-dom";

import Navbar from "../components/ui/Navbar";

import Chatbot from "../components/ui/chatbot/chatbot";

export default function AppLayout() {

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR GLOBAL */}
      <Navbar />

      {/* CONTENIDO */}
      <main>
        <Outlet />
      </main>

      {/* CHATBOT */}
      <Chatbot />

    </div>
  );
}