import { useCallback, useEffect, useRef, useState } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";

import { auth } from "../../infrastructure/config/firebase";
import { apiUrl } from "../config/apiBase";
import { authFetch } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [usuarioDB, setUsuarioDB] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializedRef = useRef(false);
  const revisionRef = useRef(0);

  useEffect(() => {
    let active = true;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const currentRevision = ++revisionRef.current;
      const primeraInicializacion = !initializedRef.current;

      if (primeraInicializacion) {
        setLoading(true);
      }

      setFirebaseUser(user);

      if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("teolearn-firebase-uid");
        localStorage.removeItem("teolearn-user-email");
        localStorage.removeItem("teolearn-user-id");

        setUsuarioDB(null);
        initializedRef.current = true;

        if (active && currentRevision === revisionRef.current) {
          setLoading(false);
        }

        return;
      }

      try {
        const token = await user.getIdToken();

        if (!active || currentRevision !== revisionRef.current) {
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("teolearn-firebase-uid", user.uid);

        if (user.email) {
          localStorage.setItem("teolearn-user-email", user.email);
        }

        // Firebase ya confirmó la sesión. No esperamos a la base de datos
        // para permitir el acceso a las rutas privadas.
        initializedRef.current = true;
        setLoading(false);

        // La sincronización del perfil continúa en segundo plano.
        try {
          const response = await fetch(apiUrl("/usuarios/sync"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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
            throw new Error(
              `No se pudo sincronizar el usuario (${response.status}).`
            );
          }

          const data = await response.json();

          if (!active || currentRevision !== revisionRef.current) {
            return;
          }

          const usuario = data.usuario ?? null;
          setUsuarioDB(usuario);

          if (usuario?.id != null) {
            localStorage.setItem(
              "teolearn-user-id",
              String(usuario.id)
            );
          } else {
            localStorage.removeItem("teolearn-user-id");
          }
        } catch (error) {
          if (active && currentRevision === revisionRef.current) {
            console.error(
              "Error al sincronizar el usuario con la BD:",
              error
            );

            setUsuarioDB(null);
            localStorage.removeItem("teolearn-user-id");
          }
        }
      } catch (error) {
        if (!active || currentRevision !== revisionRef.current) {
          return;
        }

        console.error(
          "Error al inicializar la sesión de Firebase:",
          error
        );

        setUsuarioDB(null);
        initializedRef.current = true;
        setLoading(false);
      }
    });

    return () => {
      active = false;
      revisionRef.current += 1;
      unsubscribe();
    };
  }, []);

  const refrescarUsuarioDB = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setUsuarioDB(null);
      return;
    }

    try {
      const response = await authFetch(
        apiUrl(`/usuarios/firebase/${user.uid}`)
      );

      if (!response.ok) {
        throw new Error(
          `No se pudo actualizar el usuario (${response.status}).`
        );
      }

      const data = await response.json();
      const usuario = data.usuario ?? null;

      setUsuarioDB(usuario);

      if (usuario?.id != null) {
        localStorage.setItem(
          "teolearn-user-id",
          String(usuario.id)
        );
      } else {
        localStorage.removeItem("teolearn-user-id");
      }
    } catch (error) {
      console.error(
        "Error refrescando usuario de BD:",
        error
      );
    }
  }, []);

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