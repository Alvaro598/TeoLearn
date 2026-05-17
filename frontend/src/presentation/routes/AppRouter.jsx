import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider }
from "../../application/context/AuthContext";

import PrivateRoute
from "./PrivateRoute";

import AppLayout
from "../layouts/AppLayout";

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

export default function AppRouter() {

  return (

    <AuthProvider>

      <BrowserRouter basename="/TeoLearn">

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

    </AuthProvider>
  );
}