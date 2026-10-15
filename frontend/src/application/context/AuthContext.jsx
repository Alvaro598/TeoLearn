import { useCallback, useEffect, useState } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../../infrastructure/config/firebase";
import { apiUrl } from "../config/apiBase";
import { authFetch, getAuthHeaders } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [usuarioDB, setUsuarioDB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let revision = 0;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const currentRevision = ++revision;

      if (active) {
        setLoading(true);
        setFirebaseUser(user);
      }

      try {
        if (!user) {
          if (!active || currentRevision !== revision) return;
          localStorage.removeItem("token");
          localStorage.removeItem("teolearn-firebase-uid");
          localStorage.removeItem("teolearn-user-email");
          localStorage.removeItem("teolearn-user-id");
          setUsuarioDB(null);
          return;
        }

        const token = await user.getIdToken();
        if (!active || currentRevision !== revision) return;

        // Todos los servicios usan localStorage para el token.
        localStorage.setItem("token", token);
        localStorage.setItem("teolearn-firebase-uid", user.uid);
        if (user.email) {
          localStorage.setItem("teolearn-user-email", user.email);
        }

        try {
          const response = await fetch(apiUrl("/usuarios/sync"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(getAuthHeaders() || {}),
            },
            body: JSON.stringify({
              nombre:
                user.displayName ||
                user.email?.split("@")[0] ||
                "Estudiante",
              correo: user.email,
            }),
          });

          if (!response.ok) {
            throw new Error(`No se pudo sincronizar el usuario (${response.status}).`);
          }

          const data = await response.json();
          if (!active || currentRevision !== revision) return;

          setUsuarioDB(data.usuario ?? null);
          if (data.usuario?.id != null) {
            localStorage.setItem("teolearn-user-id", String(data.usuario.id));
          } else {
            localStorage.removeItem("teolearn-user-id");
          }
        } catch (error) {
          if (active && currentRevision === revision) {
            console.error("Error al sincronizar el usuario con la BD:", error);
            setUsuarioDB(null);
            localStorage.removeItem("teolearn-user-id");
          }
        }
      } catch (error) {
        if (active && currentRevision === revision) {
          console.error("Error al inicializar la sesión de Firebase:", error);
          setUsuarioDB(null);
        }
      } finally {
        if (active && currentRevision === revision) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const refrescarUsuarioDB = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const response = await authFetch(
        apiUrl(`/usuarios/firebase/${firebaseUser.uid}`)
      );
      if (!response.ok) {
        throw new Error(`No se pudo actualizar el usuario (${response.status}).`);
      }

      const data = await response.json();
      setUsuarioDB(data.usuario ?? null);
    } catch (error) {
      console.error("Error refrescando usuario de BD:", error);
    }
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teolearn-firebase-uid");
    localStorage.removeItem("teolearn-user-email");
    localStorage.removeItem("teolearn-user-id");
    setUsuarioDB(null);
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario: firebaseUser,
        firebaseUser,
        usuarioDB,
        isAuthenticated: Boolean(firebaseUser),
        loading,
        logout,
        refrescarUsuarioDB,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
