import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

import { getFirebaseAuthMessage } from "../../application/services/authErrors";
import { auth } from "../../infrastructure/config/firebase";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{10,}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const actionCode = searchParams.get("oobCode");

  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [checkingLink, setCheckingLink] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [formError, setFormError] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;

    const validateLink = async () => {
      if ((mode && mode !== "resetPassword") || !actionCode) {
        setLinkError(
          "Este enlace no es válido. Solicita uno nuevo desde el inicio de sesión."
        );
        setCheckingLink(false);
        return;
      }

      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, actionCode);

        if (active) {
          setAccountEmail(verifiedEmail);
          setCheckingLink(false);
        }
      } catch (error) {
        if (active) {
          setLinkError(
            getFirebaseAuthMessage(
              error,
              "El enlace expiró o ya no es válido. Solicita uno nuevo desde el inicio de sesión."
            )
          );
          setCheckingLink(false);
        }
      }
    };

    validateLink();

    return () => {
      active = false;
    };
  }, [actionCode, mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!PASSWORD_PATTERN.test(password)) {
      setFormError(
        "Usa mínimo 10 caracteres, con al menos una letra y un número."
      );
      return;
    }

    if (password !== confirmation) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);

    try {
      await confirmPasswordReset(auth, actionCode, password);
      setCompleted(true);
      setPassword("");
      setConfirmation("");
    } catch (error) {
      setFormError(
        getFirebaseAuthMessage(
          error,
          "No pudimos cambiar la contraseña. Si el enlace venció, solicita uno nuevo."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link
          to="/login"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Volver al inicio de sesión
        </Link>

        <div className="mb-6 mt-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Crea una nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {checkingLink
              ? "Verificando el enlace de recuperación..."
              : "Elige una contraseña segura para tu cuenta de TeoLearn."}
          </p>
        </div>

        {checkingLink && (
          <div role="status" className="py-6 text-center text-sm text-gray-500">
            Verificando el enlace...
          </div>
        )}

        {!checkingLink && linkError && (
          <div role="alert" className="space-y-4">
            <p className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
              {linkError}
            </p>
            <Link
              to="/login"
              className="block w-full rounded-lg bg-brand-blue py-2 text-center font-semibold text-white transition hover:bg-brand-blue-hover"
            >
              Solicitar otro enlace
            </Link>
          </div>
        )}

        {!checkingLink && !linkError && completed && (
          <div role="status" aria-live="polite" className="space-y-4">
            <p className="rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700">
              Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.
            </p>
            <Link
              to="/login?passwordReset=success"
              className="block w-full rounded-lg bg-brand-blue py-2 text-center font-semibold text-white transition hover:bg-brand-blue-hover"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        )}

        {!checkingLink && !linkError && !completed && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Cuenta
              </label>
              <input
                id="reset-email"
                type="email"
                value={accountEmail}
                readOnly
                className="w-full rounded-lg border bg-gray-100 p-2 text-gray-600"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={10}
                required
                disabled={saving}
                className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 10 caracteres, con letras y números.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirma la nueva contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                disabled={saving}
                className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-brand-blue py-2 font-semibold text-white transition hover:bg-brand-blue-hover disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Actualizando contraseña..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
