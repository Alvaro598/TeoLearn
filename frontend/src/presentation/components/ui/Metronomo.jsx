import { useEffect, useState } from "react";
import {
  startMetronome,
  stopMetronome,
  setMetronomeBpm,
  getMetronomeBpm,
} from "../../../application/services/sound";

export default function Metronomo() {
  const [active, setActive] = useState(false);
  const [bpm, setBpm] = useState(80);

  useEffect(() => {
    setBpm(getMetronomeBpm());
  }, []);

  const toggle = () => {
    if (active) {
      stopMetronome();
      setActive(false);
    } else {
      startMetronome();
      setActive(true);
    }
  };

  const updateBpm = (value) => {
    const next = Math.min(
      200,
      Math.max(40, Number(value))
    );

    setBpm(next);
    setMetronomeBpm(next);
  };

  return (
    <div className="bg-white border-2 border-gray-950 rounded-xl p-4">
      <p className="font-extrabold mb-3">
        Metrónomo
      </p>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="40"
          max="200"
          value={bpm}
          onChange={(e) =>
            updateBpm(e.target.value)
          }
        />

        <span className="font-bold">
          {bpm} BPM
        </span>

        <button
          type="button"
          onClick={toggle}
          className={`px-3 py-2 rounded-lg font-bold text-white ${
            active
              ? "bg-red-500"
              : "bg-green-600"
          }`}
        >
          {active ? "Detener" : "Iniciar"}
        </button>
      </div>
    </div>
  );
}