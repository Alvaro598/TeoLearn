import {
  BrowserRouter,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider }
from "../../application/context/AuthContext";
import { PreferencesProvider }
from "../../application/context/PreferencesContext";

import PrivateRoute
from "./PrivateRoute";

import AppLayout
from "../layouts/AppLayout";
import Chatbot from "../components/ui/chatbot/chatbot";

/* PÁGINAS */
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Modulos from "../pages/Modulos";
import Unidades from "../pages/Unidades";
import Lecciones from "../pages/Lecciones";
import DetalleLeccion from "../pages/DetalleLeccion";
import Ejercicio from "../pages/Ejercicio";
import Resultado from "../pages/Resultado";
import Generalidades from "../pages/Generalidades";
import ChatTutor from "../pages/ChatTutor";
import Perfil from "../pages/Perfil";
import QuizFinal from "../pages/QuizFinal";

function GlobalChatbot() {
  const { pathname } = useLocation();
  const hideChatbot =
    pathname === "/" ||
    pathname === "/chat" ||
    pathname === "/quiz-final" ||
    pathname.startsWith("/ejercicio/");

  return hideChatbot ? null : <Chatbot />;
}

export default function AppRouter() {

  return (

    <AuthProvider>
      <PreferencesProvider>

      <BrowserRouter basename="/TeoLearn">

        <GlobalChatbot />

        <Routes>

          {/* PÚBLICAS */}
          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* PRIVADAS */}
          <Route
            element={<AppLayout />}
          >

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* MÓDULOS */}
            <Route
              path="/modulos"
              element={
                <PrivateRoute>
                  <Modulos />
                </PrivateRoute>
              }
            />

            <Route
              path="/generalidades"
              element={
                <PrivateRoute>
                  <Generalidades />
                </PrivateRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatTutor />
                </PrivateRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Perfil />
                </PrivateRoute>
              }
            />

            <Route
              path="/quiz-final"
              element={
                <PrivateRoute>
                  <QuizFinal />
                </PrivateRoute>
              }
            />

            {/* UNIDADES */}
            <Route
              path="/modulos/:moduloId/unidades"
              element={
                <PrivateRoute>
                  <Unidades />
                </PrivateRoute>
              }
            />

            {/* LECCIONES */}
            <Route
              path="/unidad/:unidadId/lecciones"
              element={
                <PrivateRoute>
                  <Lecciones />
                </PrivateRoute>
              }
            />

            {/* DETALLE LECCIÓN */}
            <Route
              path="/unidad/:unidadId/leccion/:leccionId"
              element={
                <PrivateRoute>
                  <DetalleLeccion />
                </PrivateRoute>
              }
            />

            {/* EJERCICIO */}
            <Route
              path="/ejercicio/:leccionId"
              element={
                <PrivateRoute>
                  <Ejercicio />
                </PrivateRoute>
              }
            />

            {/* RESULTADO */}
            <Route
              path="/resultado/:leccionId"
              element={
                <PrivateRoute>
                  <Resultado />
                </PrivateRoute>
              }
            />

          </Route>

        </Routes>

      </BrowserRouter>
      </PreferencesProvider>

    </AuthProvider>
  );
}
