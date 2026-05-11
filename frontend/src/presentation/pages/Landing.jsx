import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

const TICKER = ["TONALIDAD","INTERVALO","OCTAVA","RITMO","MELODÍA","ARMONÍA","ACORDE","ESCALA","COMPÁS","PULSO"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🎵 APRENDIZAJE CON IA
          </span>

          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{fontFamily:'Syne,sans-serif'}}>
            Domina la{" "}
            <span className="text-brand-pink">teoría</span>{" "}
            <span className="text-brand-pink">musical</span>{" "}
            con{" "}
            <span className="bg-brand-dark text-brand-yellow px-2 rounded">inteligencia artificial</span>
          </h1>

          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
            Aprende ritmo, melodía y armonía a tu propio ritmo. Recibe retroalimentación instantánea de un tutor de IA mientras avanzas en lecciones diseñadas para principiantes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="bg-brand-pink text-white font-bold px-8 py-4 rounded-full hover:bg-opacity-90 transition flex items-center gap-2 justify-center">
              Empezar gratis →
            </Link>
            <Link to="/login" className="border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-gray-400 transition text-center">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Tarjeta demo */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-80 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-pink rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎵</span>
              </div>
              <div>
                <p className="font-bold text-sm">Lección 03</p>
                <p className="text-xs text-gray-500">Acordes mayores y menores</p>
              </div>
              <div className="ml-auto text-brand-pink text-xl">▌▌▌</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm text-gray-700">
              "Construye un acorde de Do mayor."
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
              <span className="text-green-600 font-semibold">✅ CORRECTA</span>
              <p className="text-gray-700 mt-1">Do, Mi, Sol forman la tríada perfecta. ¡Excelente!</p>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span className="text-brand-yellow font-bold">+20 XP</span>
              <span>Tutor IA · Claude</span>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-brand-pink py-4 overflow-hidden my-10">
        <div className="ticker-inner text-white font-bold text-sm tracking-widest">
          {[...TICKER,...TICKER,...TICKER].map((t,i)=>(
            <span key={i} className="mx-8">{t} ★</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <p className="text-center text-xs font-bold text-gray-400 tracking-widest mb-3">POR QUÉ TEOLEARN</p>
        <h2 className="text-4xl font-extrabold text-center mb-12" style={{fontFamily:'Syne,sans-serif'}}>Aprende como nunca antes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon:"🧠", color:"bg-brand-pink",   title:"IA pedagógica",      desc:"Retroalimentación inmediata en cada ejercicio." },
            { icon:"⚡", color:"bg-brand-blue",   title:"Aprendizaje activo", desc:"Ejercicios interactivos de ritmo, melodía y armonía." },
            { icon:"🏆", color:"bg-brand-yellow", title:"Gamificación",        desc:"Gana XP, sube de nivel y desbloquea insignias." },
          ].map(f=>(
            <div key={f.title} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition">
              <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5`}>{f.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{fontFamily:'Syne,sans-serif'}}>{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { color:"bg-ritmo",   icon:"⚡", title:"Ritmo",   sub:"Pulso, compás y figuras" },
            { color:"bg-melodia", icon:"♪",  title:"Melodía", sub:"Notas, escalas e intervalos" },
            { color:"bg-armonia", icon:"🎹", title:"Armonía", sub:"Acordes y progresiones" },
          ].map(m=>(
            <div key={m.title} className={`${m.color} rounded-3xl p-8 text-white`}>
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-extrabold text-xl" style={{fontFamily:'Syne,sans-serif'}}>{m.title}</h3>
              <p className="text-sm opacity-80 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark text-white rounded-3xl max-w-5xl mx-auto mb-20 mx-6 p-16 text-center">
        <h2 className="text-4xl font-extrabold mb-4" style={{fontFamily:'Syne,sans-serif'}}>¿Listo para componer tu futuro?</h2>
        <p className="text-gray-400 mb-8">Únete a quienes ya están dominando la teoría musical con IA.</p>
        <Link to="/register" className="bg-brand-yellow text-brand-dark font-bold px-10 py-4 rounded-full hover:bg-opacity-90 transition inline-flex items-center gap-2">
          Crear cuenta →
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-8">
        TeoLearn · Teoría musical con IA · Metodología OOHDM
      </footer>
    </div>
  );
}