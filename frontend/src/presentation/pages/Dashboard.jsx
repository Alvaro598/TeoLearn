import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../application/context/AuthContext';

const MODULOS = [
  { nombre:'Ritmo',   path:'/modulos/ritmo/unidades',   icon:'⚡', color:'bg-ritmo',   text:'text-ritmo',   lecciones:[2,5] },
  { nombre:'Melodía', path:'/modulos/melodia/unidades', icon:'♪',  color:'bg-melodia', text:'text-melodia', lecciones:[2,5] },
  { nombre:'Armonía', path:'/modulos/armonia/unidades', icon:'🎹', color:'bg-armonia', text:'text-brand-dark', lecciones:[2,5] },
];

const INSIGNIAS = [
  { label:'Primera lección', icon:'⭐', color:'bg-brand-yellow/20 text-yellow-700' },
  { label:'Trío musical',    icon:'🎵', color:'bg-brand-pink/10 text-brand-pink' },
  { label:'Compositor en formación', icon:'🎓', color:'bg-brand-blue/10 text-brand-blue' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const nombre = user?.displayName || user?.email?.split('@')[0] || 'Estudiante';

  const [progresos] = useState([
    { modulo:'Ritmo',   pct:0, xp:0  },
    { modulo:'Melodía', pct:0, xp:0  },
    { modulo:'Armonía', pct:0, xp:0  },
  ]);

  const xpTotal = progresos.reduce((s,p)=>s+p.xp,0) || 750;
  const nivel = Math.floor(xpTotal/200)+1;
  const xpNivel = xpTotal % 200;
  const leccionesOk = 6;
  const leccionesTotal = 15;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

        {/* Bienvenida */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">HOLA</p>
          <h1 className="text-4xl font-extrabold" style={{fontFamily:'Syne,sans-serif'}}>
            {nombre} 👋
          </h1>
          <p className="text-gray-500 mt-1">Sigue construyendo tu intuición musical paso a paso.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Nivel */}
          <div className="bg-white rounded-2xl p-5 shadow-card col-span-2 md:col-span-1">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-1">NIVEL</p>
            <p className="text-5xl font-extrabold" style={{fontFamily:'Syne,sans-serif'}}>{nivel}</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className="bg-brand-pink h-2 rounded-full transition-all" style={{width:`${(xpNivel/200)*100}%`}}/>
            </div>
            <p className="text-xs text-gray-400 mt-1">{xpNivel} / 200 XP al siguiente nivel</p>
          </div>
          {/* XP */}
          <div className="bg-brand-yellow rounded-2xl p-5 shadow-card">
            <p className="text-xs font-bold uppercase mb-1 text-yellow-800 opacity-70">XP TOTAL</p>
            <p className="text-4xl font-extrabold text-brand-dark" style={{fontFamily:'Syne,sans-serif'}}>{xpTotal}</p>
          </div>
          {/* Racha */}
          <div className="bg-brand-pink rounded-2xl p-5 shadow-card">
            <p className="text-xs font-bold uppercase mb-1 text-white opacity-70">RACHA</p>
            <p className="text-4xl font-extrabold text-white" style={{fontFamily:'Syne,sans-serif'}}>0</p>
          </div>
          {/* Lecciones */}
          <div className="bg-brand-blue rounded-2xl p-5 shadow-card">
            <p className="text-xs font-bold uppercase mb-1 text-white opacity-70">LECCIONES</p>
            <p className="text-4xl font-extrabold text-white" style={{fontFamily:'Syne,sans-serif'}}>
              {leccionesOk}<span className="text-xl opacity-70">/{leccionesTotal}</span>
            </p>
          </div>
        </div>

        {/* Continuar + Insignias */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">CONTINUAR APRENDIENDO</p>
            <h2 className="text-xl font-bold mb-1" style={{fontFamily:'Syne,sans-serif'}}>Silencios musicales</h2>
            <p className="text-sm text-gray-500 mb-4">El arte de no tocar nada</p>
            <Link to="/modulos/ritmo/unidades" className="inline-flex items-center gap-2 bg-brand-pink text-white font-semibold px-5 py-2.5 rounded-full hover:bg-opacity-90 transition text-sm">
              Continuar lección →
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">INSIGNIAS</p>
            <div className="flex flex-wrap gap-2">
              {INSIGNIAS.map(i=>(
                <span key={i.label} className={`${i.color} text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                  {i.icon} {i.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Categorías */}
        <p className="text-xl font-bold mb-4" style={{fontFamily:'Syne,sans-serif'}}>Categorías</p>
        <div className="grid md:grid-cols-3 gap-5">
          {MODULOS.map(m=>{
            const prog = progresos.find(p=>p.modulo===m.nombre);
            const [ok,total]=m.lecciones;
            return (
              <Link key={m.nombre} to={m.path} className={`${m.color} rounded-3xl p-7 text-white hover:opacity-95 transition block`}>
                <div className="text-3xl mb-3">{m.icon}</div>
                <h3 className="font-extrabold text-xl" style={{fontFamily:'Syne,sans-serif'}}>{m.nombre}</h3>
                <p className="text-sm opacity-70 mt-1">{ok} / {total} completadas</p>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}