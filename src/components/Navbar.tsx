'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavbarProps {
  session?: { name?: string; role?: string } | null
}

export default function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-violet-600 tracking-tight hover:text-violet-700 transition-colors"
            >
              Mentora
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/tutores"
              className="text-gray-600 hover:text-violet-600 font-medium transition-colors text-sm"
            >
              Buscar Tutores
            </Link>
            <Link
              href="/salas"
              className="text-gray-600 hover:text-violet-600 font-medium transition-colors text-sm"
            >
              🏫 Salas
            </Link>
            <Link
              href="/material"
              className="text-gray-600 hover:text-violet-600 font-medium transition-colors text-sm"
            >
              Material
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                title="Mi Perfil"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  {(session.name ?? 'U').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{session.name?.split(' ')[0] ?? 'Perfil'}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-violet-600 hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <Link
            href="/tutores"
            className="text-gray-700 hover:text-violet-600 font-medium text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Buscar Tutores
          </Link>
          <Link
            href="/salas"
            className="text-gray-700 hover:text-violet-600 font-medium text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            🏫 Salas
          </Link>
          <Link
            href="/material"
            className="text-gray-700 hover:text-violet-600 font-medium text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Material
          </Link>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    {(session.name ?? 'U').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{session.name ?? 'Mi Perfil'}</span>
                </Link>
                <Link
                  href="/logout"
                  className="text-sm font-medium text-center px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Cerrar Sesión
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-center px-4 py-2 rounded-lg border border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="text-sm font-medium text-center px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
