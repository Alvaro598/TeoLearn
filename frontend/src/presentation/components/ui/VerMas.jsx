export default function VerMas() {
  return (
    <section id="learn-more" className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-8">

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          ¿Cómo funciona TeoLearn?
        </h2>

        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Nuestra plataforma combina teoría musical con práctica interactiva
          para ofrecer una experiencia de aprendizaje efectiva y progresiva.
        </p>

        {/* VIDEO */}
        <div className="mb-16">
          <div className="aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg ">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/TU_VIDEO_ID"
              title="Video introductorio"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      
    <section id="features" className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Características principales
          </h2>

          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Descubre cómo esta app puede transformar tu experiencia de aprendizaje musical con potentes herramientas y contenido atractivo.
          </p>

          <div style={{
            maxWidth: 900, margin: '0 auto', padding: '0 1rem', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem'
          }}>
            {[
              { emoji: '📚', titulo: 'Lecciones teóricas completas', desc: 'Sumérgete en las escalas, los acordes, la armonía y el ritmo con módulos interactivos y fáciles de seguir.' },
              { emoji: '🎯', titulo: 'Ejercicios prácticos interactivos', desc: 'Consolida tus conocimientos con ejercicios atractivos, cuestionarios y comentarios en tiempo real.' },
              { emoji: '🤖', titulo: 'Feedback por IA', desc: 'La IA analiza tus respuestas y te da correcciones pedagógicas al instante.' },
            ].map(f => (
              <div key={f.titulo} style={{
                background: '#fff', borderRadius: 12, padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>{f.emoji}</div>
                <h3 style={{ marginBottom: '.5rem' }}>{f.titulo}</h3>
                <p style={{ color: '#666', fontSize: '.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </section>
  );
} 