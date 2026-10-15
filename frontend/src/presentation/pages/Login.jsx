import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../infrastructure/config/firebase";
import { getFirebaseAuthMessage } from "../../application/services/authErrors";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const completeLogin = async (user, message) => {
    const token = await user.getIdToken();
    // El servicio de API y AuthContext leen el token desde localStorage.
    localStorage.setItem("token", token);
    localStorage.setItem("teolearn-firebase-uid", user.uid);
    if (user.email) {
      localStorage.setItem("teolearn-user-email", user.email);
    }

    setSuccess(message);
    window.setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }

    if (Date.now() < cooldownUntil) {
      setError("Demasiados intentos. Espera un momento antes de volver a intentar.");
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await completeLogin(credential.user, "Inicio de sesión exitoso.");
      setFailedAttempts(0);
    } catch (err) {
      setError(
        getFirebaseAuthMessage(
          err,
          "No pudimos iniciar sesión. Revisa tu correo y contraseña."
        )
      );

      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setCooldownUntil(Date.now() + 60000);
        setError("Demasiados intentos fallidos. Espera 1 minuto antes de reintentar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await completeLogin(result.user, "Bienvenido a TeoLearn 🎵");
    } catch (err) {
      setError(
        getFirebaseAuthMessage(
          err,
          "No pudimos iniciar con Google. Intenta de nuevo."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎵 Entrar</h2>
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
            <button type="button" aria-label="Cerrar mensaje" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="bg-green-100 border border-green-300 text-green-700 text-sm px-4 py-3 rounded-lg mb-4"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="correo@ejemplo.com"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || Boolean(success)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || Boolean(success)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-500 font-semibold hover:underline">
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
          disabled={loading || Boolean(success)}
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
