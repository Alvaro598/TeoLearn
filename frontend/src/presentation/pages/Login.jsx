import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../infrastructure/config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );



      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);

      setSuccess("Hola de nuevo");
      setLoading(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Correo o contraseña incorrectos");
      } else if (err.code === "auth/invalid-email") {
        setError("Credenciales incorrectas");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const googleProvider =
    new GoogleAuthProvider();
  const loginWithGoogle =
    async () => {

      try {

        setLoading(true);

        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );

        const token =
          await result.user.getIdToken();

        localStorage.setItem(
          "token",
          token
        );

        setSuccess(
          "Bienvenido a TeoLearn 🎵"
        );

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);

      } catch (error) {

        console.error(error);

        setError(
          "Error iniciando con Google"
        );
      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🎵 Entrar
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido. Ingresa tus datos.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex justify-between items-center bg-red-100 border border-red-300 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            <span>{error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex justify-between items-center bg-green-100 border border-green-300 text-green-600 text-sm px-4 py-2 rounded-lg mb-4">
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Footer */}
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
          <div className="flex-1 border-t"></div>

          <span className="px-3 text-sm text-gray-400">
            o
          </span>

          <div className="flex-1 border-t"></div>
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}

          className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continuar con Google
        </button>
      </div>
    </div>


  );
}