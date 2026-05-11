import { Link, useLocation } from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../../../application/context/AuthContext";

export default function Navbar() {

  const location = useLocation();

  const path = location.pathname;

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const {
    isAuthenticated,
    logout,
    loading,
  } = useAuth();

  const isPublicPage =
    path === "/" ||
    path === "/login" ||
    path === "/register";

  if (loading) {
    return (
      <nav className="flex justify-between items-center px-4 sm:px-8 lg:px-10 py-4 bg-white shadow-sm">

        <Link
          to="/"
          className="font-bold text-base sm:text-lg text-blue-600"
        >
          🎵 TeoLearn
        </Link>

        <div className="text-sm text-gray-500">
          Cargando...
        </div>

      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-4 sm:px-8 lg:px-10 py-4 bg-white shadow-sm sticky top-0 z-50">

      {/* LOGO */}
      <Link
        to="/"
        className="font-bold text-base sm:text-lg text-blue-600 hover:text-blue-800"
      >
        🎵 TeoLearn
      </Link>

      {/* BOTÓN MOBILE */}
      <button
        onClick={() =>
          setIsMenuOpen(!isMenuOpen)
        }
        className="lg:hidden flex flex-col gap-1.5"
      >
        <span className="w-6 h-0.5 bg-gray-600"></span>
        <span className="w-6 h-0.5 bg-gray-600"></span>
        <span className="w-6 h-0.5 bg-gray-600"></span>
      </button>

      {/* MENÚ */}
      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } lg:flex flex-col lg:flex-row gap-4 lg:gap-6 items-center absolute lg:static top-16 left-0 right-0 bg-white lg:bg-transparent p-4 lg:p-0 shadow-lg lg:shadow-none`}
      >

        {/* USUARIO LOGUEADO */}
        {isAuthenticated && (
          <>
            <Link
              to="/dashboard"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className={
                path === "/dashboard"
                  ? "text-gray-800 font-bold"
                  : ""
              }
            >
              Dashboard
            </Link>

            <Link
              to="/modulos"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className={
                path === "/modulos"
                  ? "text-gray-800 font-bold"
                  : ""
              }
            >
              Módulos
            </Link>

            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="text-red-500"
            >
              Cerrar sesión
            </button>
          </>
        )}

        {/* USUARIO NO LOGUEADO */}
        {!isAuthenticated &&
          isPublicPage && (
            <>
              <Link
                to="/login"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className={
                  path === "/login"
                    ? "text-gray-800 font-bold"
                    : ""
                }
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className={`px-4 py-2 rounded ${
                  path === "/register"
                    ? "bg-blue-700"
                    : "bg-blue-500"
                } text-white`}
                onClick={() =>
                  setIsMenuOpen(false)
                }
              >
                Empezar
              </Link>
            </>
          )}

      </div>

    </nav>
  );
}