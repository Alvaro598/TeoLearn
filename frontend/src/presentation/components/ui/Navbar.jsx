import { Link, useLocation } from "react-router-dom";

import { useEffect, useState } from "react";

import { useAuth } from "../../../application/context/AuthContext";
import { getQuizFinalProgress } from "../../../application/services/progress";
import UserAvatar from "./UserAvatar";

export default function Navbar() {

  const location = useLocation();

  const path = location.pathname;

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);

  const {
    isAuthenticated,
    logout,
    loading,
  } = useAuth();

  const isPublicPage =
    path === "/" ||
    path === "/login" ||
    path === "/register";

  useEffect(() => {
    let active = true;

    if (!isAuthenticated) {
      setQuizUnlocked(false);
      return () => {};
    }

    getQuizFinalProgress()
      .then((state) => {
        if (active) {
          setQuizUnlocked(state.unlocked);
        }
      })
      .catch(() => {
        if (active) {
          setQuizUnlocked(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, path]);

  if (loading) {
    return (
      <nav className="flex justify-between items-center px-4 sm:px-8 lg:px-10 py-4 bg-white shadow-sm">

        <Link
          to="/"
          className="font-bold text-base sm:text-lg text-brand-blue"
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
        className="font-bold text-base sm:text-lg text-brand-blue hover:text-brand-dark transition"
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
        className={`${isMenuOpen ? "flex" : "hidden"
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

            <Link
              to="/generalidades"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className={
                path === "/generalidades"
                  ? "text-gray-800 font-bold"
                  : ""
              }
            >
              Contenido de apoyo
            </Link>

            <Link
              to="/chat"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className={
                path === "/chat"
                  ? "text-gray-800 font-bold"
                  : ""
              }
            >
              Tutor IA
            </Link>

            {quizUnlocked && (
              <Link
                to="/quiz-final"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className={
                  path === "/quiz-final"
                    ? "text-gray-800 font-bold"
                    : ""
                }
              >
                Quiz final
              </Link>
            )}


            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="text-red-500"
            >
              Cerrar sesión
            </button>

            <Link
              to="/perfil"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="inline-flex items-center gap-2"
              aria-label="Perfil"
            >
              <UserAvatar />
            </Link>

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
                className={`px-4 py-2 rounded ${path === "/register"
                    ? "bg-blue-700"
                    : "bg-brand-blue text-white font-bold px-8 py-4 rounded-full hover:bg-opacity-90 transition flex items-center gap-2 justify-center"
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
