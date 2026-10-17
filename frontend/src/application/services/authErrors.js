const AUTH_MESSAGES = {
  "auth/email-already-in-use": "Ese correo ya tiene una cuenta registrada.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/weak-password": "La contraseña debe tener mínimo 10 caracteres, con letras y números.",
  "auth/expired-action-code": "El enlace expiró. Solicita uno nuevo desde el inicio de sesión.",
  "auth/invalid-action-code": "El enlace ya se usó o no es válido. Solicita uno nuevo.",
  "auth/unauthorized-continue-uri": "Firebase no autorizó la dirección de retorno. Contacta al administrador de TeoLearn.",
  "auth/invalid-continue-uri": "La dirección de retorno del enlace no es válida.",
  "auth/user-not-found": "No encontramos una cuenta con ese correo.",
  "auth/missing-email": "Ingresa tu correo para continuar.",
  "auth/too-many-requests": "Se realizaron demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo.",
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
