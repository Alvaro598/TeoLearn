import { Navigate } from "react-router-dom";
import { useAuth } from "../../application/context/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  return usuario ? children : <Navigate to="/" />;
}