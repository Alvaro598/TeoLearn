import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../infrastructure/config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";


export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );

            setSuccess("Registro exitoso, Bienvenido");
            setLoading(false);

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error(err);
            setLoading(false);

            if (err.code === "auth/email-already-in-use") {
                setError("Este correo ya está registrado");
            } else if (err.code === "auth/invalid-email") {
                setError("Correo inválido");
            } else if (err.code === "auth/weak-password") {
                setError("La contraseña debe tener al menos 6 caracteres");
            } else {
                setError(err.message);
            }
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
                        🎵 Registrarse
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Desbloquea tu potencial musical.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="bg-green-100 border border-green-300 text-green-600 text-sm px-4 py-2 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister}>

                    {/* Nombre */}
                    <div className="relative mb-4">
                        <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative mb-4">
                        <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Correo"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative mb-6">
                        <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-blue hover:bg-brand-blue-hover transition text-white py-2 rounded-lg font-semibold"
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-4">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Iniciar sesión
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