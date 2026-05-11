import { useParams, useNavigate } from "react-router-dom";
import { unidadesData } from "../../data/unidadesData";

const MOD_CONFIG = {
  ritmo:   { color:'bg-ritmo',   label:'Ritmo',   sub:'Pulso, compás y figuras',      icon:'⚡' },
  melodia: { color:'bg-melodia', label:'Melodía', sub:'Notas, escalas e intervalos',  icon:'♪' },
  armonia: { color:'bg-armonia', label:'Armonía', sub:'Acordes y progresiones',        icon:'🎹' },
};

export default function Unidades() {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const cfg = MOD_CONFIG[moduloId] || { color:'bg-gray-400', label: moduloId, icon:'🎵', sub:'' };
  const unidades = unidadesData[moduloId] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

        {/* Back */}
        <button onClick={()=>navigate('/modulos')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition">
          ← Volver a módulos
        </button>

        {/* Header del módulo estilo SonAI */}
        <div className={`${cfg.color} rounded-3xl p-8 text-white mb-10`}>
          <p className="text-sm font-bold uppercase opacity-70 mb-1">CATÁLOGO</p>
          <h1 className="text-4xl font-extrabold mb-1" style={{fontFamily:'Syne,sans-serif'}}>{cfg.label}</h1>
          <p className="opacity-80">{cfg.sub}</p>

          {/* Filtros / tabs estilo SonAI */}
          <div className="flex gap-2 mt-5 flex-wrap">
            <span className="bg-white text-brand-dark text-xs font-bold px-4 py-1.5 rounded-full">Todas</span>
            {unidades.map(u=>(
              <span key={u.id} className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-white/30 cursor-pointer transition">
                {u.titulo}
              </span>
            ))}
          </div>
        </div>

        {/* Grid de unidades — estilo tarjeta SonAI */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {unidades.map((unidad, idx)=>{
            const completadas = unidad.lecciones?.filter(l=>l.status==='completed').length || 0;
            const total       = unidad.lecciones?.length || 0;
            const pct         = total ? Math.round((completadas/total)*100) : 0;
            const isDone      = pct === 100;

            return (
              <div key={unidad.id} className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition p-6 flex flex-col">
                {/* Header tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`${cfg.color} w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold`}>
                    {cfg.icon}
                  </div>
                  {isDone && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      ✓ Completada
                    </span>
                  )}
                </div>

                {/* Título */}
                <h2 className="font-bold text-lg mb-1" style={{fontFamily:'Syne,sans-serif'}}>{unidad.titulo}</h2>
                <p className="text-gray-500 text-sm mb-4 flex-1">{unidad.descripcion}</p>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span>⏱ {(idx+1)*8} min</span>
                  <span>·</span>
                  <span>{total} lecciones</span>
                  <span>·</span>
                  <span>{total} quiz</span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                  <div className={`${cfg.color} h-1.5 rounded-full transition-all`} style={{width:`${pct}%`}}/>
                </div>

                {/* Botón */}
                <button
                  onClick={()=>navigate(`/unidad/${unidad.id}/lecciones`)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                    isDone
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      : `${cfg.color} text-white hover:opacity-90`
                  }`}
                >
                  {isDone ? 'Repasar →' : 'Empezar →'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}