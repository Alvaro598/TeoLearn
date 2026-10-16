import { useState } from "react";
import { Music2, Settings2, X } from "lucide-react";
import { usePreferences } from "../../../application/context/usePreferences";
import { BACKGROUND_TRACKS } from "../../../application/services/sound";

export default function GlobalMusicControl() {
  const { preferences, updatePreferences } = usePreferences();
  const [panelAbierto, setPanelAbierto] = useState(false);

  const alternarMusica = () => {
    updatePreferences({ backgroundMusic: !preferences.backgroundMusic });
  };

  const cambiarEstilo = (event) => {
    updatePreferences({
      backgroundMusicTrack: event.target.value,
      backgroundMusic: true,
    });
  };

  return (
    <div className="global-music-control">
      <div className="global-music-dock" role="group" aria-label="Controles de música">
        <button
          type="button"
          className="global-music-toggle"
          onClick={alternarMusica}
          aria-pressed={preferences.backgroundMusic}
          aria-label={preferences.backgroundMusic ? "Apagar música de fondo" : "Encender música de fondo"}
        >
          <Music2 size={18} aria-hidden="true" />
          <span>{preferences.backgroundMusic ? "Música activa" : "Música apagada"}</span>
        </button>
        <button
          type="button"
          className="global-music-settings"
          onClick={() => setPanelAbierto((abierto) => !abierto)}
          aria-expanded={panelAbierto}
          aria-controls="global-music-panel"
          aria-label={panelAbierto ? "Cerrar opciones de música" : "Cambiar estilo de música"}
        >
          {panelAbierto ? <X size={18} aria-hidden="true" /> : <Settings2 size={18} aria-hidden="true" />}
        </button>
      </div>

      {panelAbierto && (
        <section id="global-music-panel" className="global-music-panel" aria-label="Opciones de música de fondo">
          <div className="global-music-panel-heading">
            <h2>Música para concentrarse</h2>
            <button
              type="button"
              className="global-music-close"
              onClick={() => setPanelAbierto(false)}
              aria-label="Cerrar opciones de música"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <label className="global-music-switch" htmlFor="global-background-music">
            <span>Reproducir música de fondo</span>
            <input
              id="global-background-music"
              type="checkbox"
              role="switch"
              checked={preferences.backgroundMusic}
              onChange={(event) => updatePreferences({ backgroundMusic: event.target.checked })}
            />
          </label>

          <label className="global-music-style-label" htmlFor="global-background-music-style">
            Estilo
          </label>
          <select
            id="global-background-music-style"
            className="global-music-select"
            value={preferences.backgroundMusicTrack}
            onChange={cambiarEstilo}
          >
            {BACKGROUND_TRACKS.map((track) => (
              <option key={track.id} value={track.id}>{track.label}</option>
            ))}
          </select>
          <p className="global-music-description">
            El cambio de estilo inicia la música automáticamente.
          </p>
        </section>
      )}
    </div>
  );
}
