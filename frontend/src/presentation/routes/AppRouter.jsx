import {
  BrowserRouter,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";
import { lazy, Suspense } from "react";

import { AuthProvider }
from "../../application/context/AuthContext";
import { PreferencesProvider } from "../../application/context/PreferencesContext.jsx";

import PrivateRoute
from "./PrivateRoute";

import AppLayout
from "../layouts/AppLayout";
import Chatbot from "../components/ui/chatbot/chatbot";

/* PÁGINAS: cada ruta carga su código solo cuando se visita. */
const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Modulos = lazy(() => import("../pages/Modulos"));
const Unidades = lazy(() => import("../pages/Unidades"));
const Lecciones = lazy(() => import("../pages/Lecciones"));
const DetalleLeccion = lazy(() => import("../pages/DetalleLeccion"));
const Ejercicio = lazy(() => import("../pages/Ejercicio"));
const Resultado = lazy(() => import("../pages/Resultado"));
const ChatTutor = lazy(() => import("../pages/ChatTutor"));
const Perfil = lazy(() => import("../pages/Perfil"));
const ConfirmarCerrarSesion = lazy(() => import("../pages/ConfirmarCerrarSesion"));
const ResultadoQuiz = lazy(() => import("../pages/ResultadoQuiz"));
const QuizFinal = lazy(() => import("../pages/QuizFinal"));
const QuizModulo = lazy(() => import("../pages/QuizModulo"));

function GlobalChatbot() {
  const { pathname } = useLocation();
  const hideChatbot =
    pathname === "/" ||
    pathname === "/chat" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password" ||
    pathname === "/quiz-final" ||
    pathname.startsWith("/ejercicio/");

  return hideChatbot ? null : <Chatbot />;
}

export default function AppRouter() {

  return (

    <AuthProvider>
      <PreferencesProvider>

      <BrowserRouter>

        <GlobalChatbot />

        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
              Cargando...
            </div>
          }
        >
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

          <Route
            path="/reset-password"
            element={<ResetPassword />}
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
              path="/cerrar-sesion"
              element={
                <PrivateRoute>
                  <ConfirmarCerrarSesion />
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

            <Route
              path="/resultado-quiz"
              element={
                <PrivateRoute>
                  <ResultadoQuiz />
                </PrivateRoute>
              }
            />

            {/* QUIZ POR MÓDULO */}
            <Route
              path="/quiz-modulo/:moduloSlug"
              element={
                <PrivateRoute>
                  <QuizModulo />
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
        </Suspense>

      </BrowserRouter>
      </PreferencesProvider>

    </AuthProvider>
  );
}
