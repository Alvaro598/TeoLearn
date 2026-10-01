import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../../infrastructure/config/firebase";
import { apiUrl } from "../config/apiBase";
import { authFetch, getAuthHeaders } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // firebaseUser  → objeto User de Firebase (o null)
  // usuarioDB     → registro de la tabla `usuarios` en PostgreSQL (o null)
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [usuarioDB, setUsuarioDB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // 1. Guardar token de Firebase en sesión
        const token = await user.getIdToken();
        localStorage.setItem("token", token);  // LOCAL: sobrevive recarga y cierre de pestaña
        localStorage.setItem("teolearn-firebase-uid", user.uid);
        if (user.email) {
          localStorage.setItem("teolearn-user-email", user.email);
        }

        // 2. Sincronizar con la BD (obtener o crear el registro)
        try {
          const response = await fetch(apiUrl("/usuarios/sync"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(getAuthHeaders() || {}),
            },
            body: JSON.stringify({
              nombre: user.displayName || user.email?.split("@")[0] || "Estudiante",
              correo: user.email,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setUsuarioDB(data.usuario);
            if (data.usuario?.id) {
              localStorage.setItem("teolearn-user-id", String(data.usuario.id));
            } else {
              localStorage.removeItem("teolearn-user-id");
            }
          } else {
            // Si el sync falla no bloqueamos el login; usuarioDB queda null.
            console.error("No se pudo sincronizar el usuario con la BD");
            setUsuarioDB(null);
          }
        } catch (err) {
          console.error("Error al conectar con el servidor:", err);
          setUsuarioDB(null);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("teolearn-firebase-uid");
        localStorage.removeItem("teolearn-user-email");
        localStorage.removeItem("teolearn-user-id");
        setUsuarioDB(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresca el usuario de BD desde el servidor (útil tras ganar XP)
  const refrescarUsuarioDB = async () => {
    if (!firebaseUser) return;

    try {
      const response = await authFetch(
        apiUrl(`/usuarios/firebase/${firebaseUser.uid}`)
      );

      if (response.ok) {
        const data = await response.json();
        setUsuarioDB(data.usuario);
      }
    } catch (err) {
      console.error("Error refrescando usuario de BD:", err);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teolearn-firebase-uid");
    localStorage.removeItem("teolearn-user-email");
    localStorage.removeItem("teolearn-user-id");
    setUsuarioDB(null);
    await signOut(auth);
  };

  // Retrocompatibilidad: la prop `usuario` sigue siendo el firebaseUser
  // para no romper ningún componente que ya use useAuth().usuario
  return (
    <AuthContext.Provider
      value={{
        // Prop de compatibilidad (igual que antes)
        usuario: firebaseUser,
        // Nuevas props
        firebaseUser,
        usuarioDB,
        isAuthenticated: !!firebaseUser,
        loading,
        logout,
        refrescarUsuarioDB,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}