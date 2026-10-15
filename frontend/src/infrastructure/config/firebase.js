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

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("[TeoLearn] No se pudo establecer persistencia de sesión:", err);
});