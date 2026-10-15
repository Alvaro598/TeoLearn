import { Palette, Volume2, PlayCircle, RotateCcw, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../application/context/useAuth";
import { usePreferences } from "../../application/context/usePreferences";
import { BACKGROUND_TRACKS } from "../../application/services/sound";
import { getAvailableVoices, onVoicesReady, previewVoice } from "../../application/services/speech";
import UserAvatar from "../components/ui/UserAvatar";

export default function Perfil() {
  const { usuario } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const [voces, setVoces] = useState(() => getAvailableVoices());

  useEffect(() => {
    const unsubscribe = onVoicesReady(setVoces);
    return unsubscribe;
  }, []);

  const vocesEspanol = voces.filter((v) => v.lang?.startsWith("es"));
  const otrasVoces    = voces.filter((v) => !v.lang?.startsWith("es"));

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-pink mb-3">
          Perfil
        </p>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 mb-8">
          Preferencias de usuario
        </h1>

        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <UserAvatar size="lg" />

            <div className="flex-1 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-gray-700">Nombre visible</span>
                <input
                  value={preferences.displayName}
                  onChange={(event) => updatePreferences({ displayName: event.target.value })}
                  placeholder={usuario?.email || "Tu nombre"}
                  className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-gray-700">URL de imagen de perfil</span>
                <input
                  value={preferences.avatarUrl}
                  onChange={(event) => updatePreferences({ avatarUrl: event.target.value })}
                  placeholder="https://..."
                  className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-extrabold text-xl mb-1">Tutorial inicial</h2>
                <p className="text-sm text-gray-500">Reinicia la guía de bienvenida para verla otra vez.</p>
              </div>
              <button
              id="boton-reiniciar-tutorial"
                type="button"
                onClick={() => updatePreferences({ onboardingDone: false, onboardingStep: 0, explorationPages: {} })}
                className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90"
              >
                <RotateCcw size={16} />
                Reiniciar tutorial
              </button>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <Palette className="text-brand-blue mb-3" />
            <h2 className="font-extrabold text-xl mb-3">Modo visual</h2>
            <select
              value={preferences.theme}
              onChange={(event) => updatePreferences({ theme: event.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-3"
            >
              <option value="clasico">Clasico</option>
              <option value="oscuro">Oscuro</option>
            </select>
          </div>

          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
          {/* ── Accesibilidad: TTS + selector de voz ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <Volume2 className="text-brand-blue mb-3" />
            <h2 className="font-extrabold text-xl mb-3">Accesibilidad</h2>

            <label className="flex items-center justify-between gap-4 py-2">
              <span>Texto a voz</span>
              <input
                type="checkbox"
                checked={preferences.ttsEnabled}
                onChange={(event) => updatePreferences({ ttsEnabled: event.target.checked })}
              />
            </label>

            {preferences.ttsEnabled && (
              <div className="mt-2 grid gap-2 px-2 py-3 border border-gray-200 rounded-xl">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Voz del Tutor IA
                </span>

                {voces.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Cargando voces disponibles del navegador...
                  </p>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <select
                      value={preferences.ttsVoiceURI}
                      onChange={(event) => updatePreferences({ ttsVoiceURI: event.target.value })}
                      className="w-full min-w-0 border border-gray-300 rounded-xl px-3 py-2 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      <option value="">Automática (mejor voz en español)</option>
                      {vocesEspanol.length > 0 && (
                        <optgroup label="Español">
                          {vocesEspanol.map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {otrasVoces.length > 0 && (
                        <optgroup label="Otros idiomas">
                          {otrasVoces.map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={() => previewVoice(preferences.ttsVoiceURI || undefined)}
                      title="Probar esta voz"
                      className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-blue text-white hover:opacity-90"
                    >
                      <PlayCircle size={18} />
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Las voces disponibles dependen de tu navegador y sistema operativo.
                </p>
              </div>
            )}

            <label className="flex items-center justify-between gap-4 py-2 mt-3 border-t border-gray-100 pt-3">
              <span>Sonidos de respuesta</span>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(event) => updatePreferences({ soundEnabled: event.target.checked })}
              />
            </label>

          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Music size={18} className="text-brand-blue" />
              <h2 className="font-extrabold text-xl">Música para concentrarse</h2>
            </div>
            <label className="flex items-center justify-between gap-4 py-2">
              <span>Reproducir música de fondo</span>
              <input
                type="checkbox"
                role="switch"
                checked={preferences.backgroundMusic}
                onChange={(event) => updatePreferences({ backgroundMusic: event.target.checked })}
                aria-label="Reproducir música de fondo"
              />
            </label>

            {preferences.backgroundMusic && (
              <fieldset className="mt-2 grid gap-2">
                <legend className="mb-2 text-sm font-semibold text-gray-600">Elige un estilo</legend>
                {BACKGROUND_TRACKS.map((track) => (
                  <label
                    key={track.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      preferences.backgroundMusicTrack === track.id
                        ? "border-brand-blue bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="backgroundMusicTrack"
                      className="mt-1"
                      checked={preferences.backgroundMusicTrack === track.id}
                      onChange={() => updatePreferences({ backgroundMusicTrack: track.id })}
                    />
                    <span>
                      <span className="block text-sm font-bold text-gray-800">{track.label}</span>
                      <span className="block text-xs text-gray-500">{track.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}

          </div>
          </div>

        </section>
      </div>
    </div>
  );
}
