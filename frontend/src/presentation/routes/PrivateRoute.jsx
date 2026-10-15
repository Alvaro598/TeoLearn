import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../../infrastructure/config/firebase";
import { useAuth } from "../../application/context/useAuth";

export default function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  const usuarioAutenticado = Boolean(usuario || auth.currentUser);

  if (loading && !usuarioAutenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Cargando sesión...
      </div>
    );
  }

  if (!usuarioAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}