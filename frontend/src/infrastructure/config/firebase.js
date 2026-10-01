/**
 * firebase.js
 * Ruta: frontend/src/infrastructure/config/firebase.js
 *
 * FIX DE SESIÓN:
 * El problema anterior era que getAuth(app) usa por defecto la persistencia
 * "LOCAL" en navegadores, PERO si la app corre en modo de desarrollo con
 * hot-reload o si el service worker falla, Firebase puede caer a
 * "NONE" (in-memory). Al recargar la página, el contexto de memoria se
 * limpia y el usuario parece "deslogueado".
 *
 * La solución es declarar setPersistence(auth, browserLocalPersistence)
 * de forma explícita e INMEDIATA, antes de que cualquier componente
 * intente leer el estado de autenticación. Esto garantiza que el token
 * de Firebase se guarde en localStorage del navegador (sobrevive recargas
 * y cierres de pestaña, hasta que el usuario hace logout explícito).
 *
 * NOTA: browserLocalPersistence es distinto de browserSessionPersistence
 * (que solo dura la pestaña) e indexedDBLocalPersistence (que Firebase usa
 * internamente en algunos entornos). browserLocalPersistence es el más
 * compatible y es el comportamiento esperado en una app de estudio.
 */

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPzGCPHSmOlfBucM5QEutLQBgHjn4D97U",
  authDomain: "teolearn-a191e.firebaseapp.com",
  projectId: "teolearn-a191e",
  storageBucket: "teolearn-a191e.firebasestorage.app",
  messagingSenderId: "472510530537",
  appId: "1:472510530537:web:6e098a29d0656d2e204178",
  measurementId: "G-GYCLR3HP3X",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app);

// Establecer persistencia LOCAL de forma explícita e inmediata.
// Esta llamada es asíncrona pero no necesita await aquí:
// Firebase la encola internamente y la aplica antes de procesar
// cualquier operación de autenticación subsiguiente.
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("[TeoLearn] No se pudo establecer persistencia de sesión:", err);
});