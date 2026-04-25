import Link from "next/link";
import HeroTagline from "./HeroTagline";

// ---------------------------------------------------------------------------
// Landing page — server component
// ---------------------------------------------------------------------------

const stats = [
  { icon: "👨‍🏫", value: "500+", label: "Tutores activos" },
  { icon: "🎓", value: "2.000+", label: "Alumnos ayudados" },
  { icon: "⭐", value: "4.8★", label: "Calificación promedio" },
];

const steps = [
  {
    number: "1",
    title: "Regístrate y busca por ramo",
    description:
      "Crea tu cuenta con tu correo universitario y filtra tutores por ramo, universidad y calificación.",
  },
  {
    number: "2",
    title: "Elige tu tutor verificado",
    description:
      "Revisa el perfil, las reseñas de otros alumnos y el certificado de notas del tutor antes de contactarlo.",
  },
  {
    number: "3",
    title: "Coordina tu clase",
    description:
      "Acuerda horario, modalidad (online o presencial) y precio directamente con tu tutor.",
  },
];

const features = [
  {
    icon: "🔍",
    title: "Tutores Verificados",
    description: "Revisamos el certificado de notas de cada tutor antes de publicar su perfil.",
  },
  {
    icon: "🎓",
    title: "Misma Universidad",
    description: "Solo encontrarás tutores de tu propia institución que conocen tu malla.",
  },
  {
    icon: "⭐",
    title: "Reseñas Reales",
    description: "Calificaciones escritas por alumnos reales luego de cada sesión.",
  },
  {
    icon: "💰",
    title: "Precios Justos",
    description: "Cada tutor fija su propio precio. Sin comisiones ocultas ni tarifas sorpresa.",
  },
];

export default function HomePage() {
  return (
    <div className="w-full">
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        {/* Purple overlay sobre la imagen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(91, 33, 182, 0.78) 0%, rgba(76, 29, 149, 0.72) 50%, rgba(67, 56, 202, 0.78) 100%)',
          }}
        />

        {/* Contenido sobre el overlay */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* App name */}
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight text-center leading-none mb-6 drop-shadow-lg">
            Mentora
          </h1>

          {/* Tagline — frase aleatoria al cargar */}
          <HeroTagline />

          {/* CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Card Alumno */}
          <div className="bg-white rounded-3xl shadow-lg border border-violet-100 p-8 flex flex-col gap-5">
            <span className="text-5xl">🎓</span>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                ¿Necesitas ayuda con algún ramo?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Encuentra a alguien de tu misma universidad que ya pasó el ramo con buena nota.
                Real, verificado, sin intermediarios.
              </p>
            </div>
            <Link
              href="/registro"
              className="mt-auto inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-xl px-6 py-3 text-center transition-colors duration-150"
            >
              Busca un tutor
            </Link>
          </div>

          {/* Card Tutor */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl shadow-lg p-8 flex flex-col gap-5 text-white">
            <span className="text-5xl">💡</span>
            <div>
              <h2 className="text-xl font-bold mb-2">
                ¿Ya aprobaste el ramo con nota mayor o igual a 5.0? ¡Entonces postula aquí!
              </h2>
              <p className="text-indigo-200 text-sm font-semibold mb-2">
                El esfuerzo que pusiste en la U, por fin te paga.
              </p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Postúlate como tutor, sube tu certificado de notas y empieza a cobrar por lo que ya sabes.
              </p>
            </div>
            <Link
              href="/postulacion"
              className="mt-auto inline-block bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-base rounded-xl px-6 py-3 text-center transition-colors duration-150"
            >
              Postúlate como tutor
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow border border-slate-100 p-6 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-3xl font-black text-violet-700">{stat.value}</span>
              <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 bg-violet-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 text-center mb-14">
            ¿Cómo funciona?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TRUST / WHY MENTORA                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 text-center mb-14">
            ¿Por qué Mentora?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{feat.icon}</span>
                <h3 className="font-bold text-slate-800 text-base">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FINAL CTA                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 px-4 bg-gradient-to-br from-violet-700 via-indigo-700 to-violet-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            ¿Listo para mejorar tus notas?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Únete a más de 2.000 alumnos que ya encontraron al tutor perfecto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              className="inline-block bg-white text-violet-700 hover:bg-violet-50 font-bold text-base rounded-xl px-8 py-4 transition-colors duration-150"
            >
              Buscar tutor
            </Link>
            <Link
              href="/postulacion"
              className="inline-block border-2 border-white text-white hover:bg-white/10 font-bold text-base rounded-xl px-8 py-4 transition-colors duration-150"
            >
              Ser tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
