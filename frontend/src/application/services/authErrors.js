const AUTH_MESSAGES = {
  "auth/email-already-in-use": "Ese correo ya tiene una cuenta registrada.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/user-not-found": "No encontramos una cuenta con ese correo.",
  "auth/wrong-password": "La contraseña no coincide.",
  "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar.",
  "auth/cancelled-popup-request": "La solicitud con Google fue cancelada.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google.",
  "auth/account-exists-with-different-credential": "Ya existe una cuenta con ese correo usando otro método de acceso.",
  "auth/network-request-failed": "No hay conexión estable. Intenta de nuevo en unos segundos.",
};

export function getFirebaseAuthMessage(error, fallback = "No pudimos completar la operación. Intenta de nuevo.") {
  const code = error?.code;

  return AUTH_MESSAGES[code] || fallback;
}
