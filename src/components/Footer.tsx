import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-3">
          {/* Logo */}
          <span className="text-2xl font-bold text-violet-400 tracking-tight">
            Mentora
          </span>

          {/* Tagline */}
          <p className="text-gray-400 text-sm text-center">
            Conectando universitarios con tutores de excelencia
          </p>

          {/* Links */}
          <div className="flex items-center gap-6 mt-2">
            <Link
              href="/terminos"
              className="text-gray-400 hover:text-violet-400 text-sm transition-colors"
            >
              Términos
            </Link>
            <span className="text-gray-700 text-sm">·</span>
            <Link
              href="/privacidad"
              className="text-gray-400 hover:text-violet-400 text-sm transition-colors"
            >
              Privacidad
            </Link>
            <span className="text-gray-700 text-sm">·</span>
            <Link
              href="/contacto"
              className="text-gray-400 hover:text-violet-400 text-sm transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-xs mt-3">
            Mentora © 2024. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
