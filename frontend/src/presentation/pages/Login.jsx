import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../../infrastructure/config/firebase";
import { getFirebaseAuthMessage } from "../../application/services/authErrors";

const SUCCESS_MESSAGE_DURATION = 1200;
const PASSWORD_RECOVERY_MESSAGE =
  "Si la cuenta usa correo y contraseña, recibirás un enlace para cambiarla. Si ingresas con Google, continúa con el botón de Google.";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const submittingRef = useRef(false);
  const navigationTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const getDestination = () => {
    const requestedPath = location.state?.from?.pathname;

    if (
      requestedPath &&
      requestedPath.startsWith("/") &&
      !["/login", "/register"].includes(requestedPath)
    ) {
      return requestedPath;
    }

    return "/dashboard";
  };

  const finishLogin = async (user, message) => {
    const token = await user.getIdToken();

    localStorage.setItem("token", token);
    localStorage.setItem("teolearn-firebase-uid", user.uid);

    if (user.email) {
      localStorage.setItem("teolearn-user-email", user.email);
    }

    if (!mountedRef.current) return;

    setError("");
    setSuccess(message);

    await new Promise((resolve) => {
      navigationTimerRef.current = window.setTimeout(
        resolve,
        SUCCESS_MESSAGE_DURATION
      );
    });

    if (mountedRef.current) {
      navigate(getDestination(), { replace: true });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");
    setSuccess("");
    setRecoveryMessage("");

    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!submittedEmail || !password) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }

    if (Date.now() < cooldownUntil) {
      setError(
        "Demasiados intentos. Espera un momento antes de volver a intentar."
      );
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);

      const credential = await signInWithEmailAndPassword(
        auth,
        submittedEmail,
        password
      );

      await finishLogin(
        credential.user,
        "Inicio de sesión exitoso."
      );

      if (mountedRef.current) {
        setFailedAttempts(0);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      setSuccess("");

      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setCooldownUntil(Date.now() + 60000);
        setError(
          "Demasiados intentos fallidos. Espera 1 minuto antes de reintentar."
        );
      } else {
        setError(
          getFirebaseAuthMessage(
            err,
            "No pudimos iniciar sesión. Revisa tu correo y contraseña."
          )
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handlePasswordRecovery = async () => {
    if (submittingRef.current) return;

    setError("");
    setSuccess("");
    setRecoveryMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Ingresa tu correo para enviarte las instrucciones de recuperación.");
      return;
    }

    submittingRef.current = true;
    setRecoveryLoading(true);

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      if (!mountedRef.current) return;

      setRecoveryMessage(PASSWORD_RECOVERY_MESSAGE);
    } catch (err) {
      if (!mountedRef.current) return;

      if (err?.code === "auth/user-not-found") {
        setRecoveryMessage(PASSWORD_RECOVERY_MESSAGE);
        return;
      }

      setError(
        getFirebaseAuthMessage(
          err,
          "No pudimos enviar las instrucciones. Revisa el correo e inténtalo de nuevo."
        )
      );
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setRecoveryLoading(false);
      }
    }
  };

  const loginWithGoogle = async () => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setError("");
    setSuccess("");
    setRecoveryMessage("");
    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);

      const result = await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      );

      await finishLogin(
        result.user,
        "Bienvenido a TeoLearn 🎵"
      );
    } catch (err) {
      if (mountedRef.current) {
        setSuccess("");
        setError(
          getFirebaseAuthMessage(
            err,
            "No pudimos iniciar con Google. Intenta de nuevo."
          )
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🎵 Entrar
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Bienvenido. Ingresa tus datos.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex justify-between items-center bg-red-100 border border-red-300 text-red-600 text-sm px-4 py-2 rounded-lg mb-4"
          >
            <span>{error}</span>

            <button
              type="button"
              aria-label="Cerrar mensaje"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="bg-green-100 border border-green-300 text-green-700 text-sm px-4 py-3 rounded-lg mb-4"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />

            <input
              type="email"
              name="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || recoveryLoading || Boolean(success)}
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />

            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || recoveryLoading || Boolean(success)}
            />
          </div>

          <div className="-mt-2 text-right">
            <button
              type="button"
              onClick={handlePasswordRecovery}
              disabled={loading || recoveryLoading || Boolean(success)}
              className="text-sm text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {recoveryLoading ? "Enviando instrucciones..." : "¿Olvidaste tu contraseña?"}
            </button>
          </div>

          {recoveryMessage && (
            <div
              role="status"
              aria-live="polite"
              className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-lg"
            >
              {recoveryMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || recoveryLoading || Boolean(success)}
            className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-500 font-semibold hover:underline"
          >
            Regístrate
          </Link>
        </p>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t" />
          <span className="px-3 text-sm text-gray-400">o</span>
          <div className="flex-1 border-t" />
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading || recoveryLoading || Boolean(success)}
          className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-60"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            className="w-5 h-5"
          />

          Continuar con Google
        </button>
      </div>
    </div>
  );
}
