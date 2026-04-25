'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getNivelMentora, getProgresoNivel } from '@/lib/utils'

interface ProfileWidgetClientProps {
  name: string
  email: string
  role: string
  universidad: string | null
  carrera: string | null
  puntos: number
  stats: {
    salasActivas: number
    reviewsDadas: number
    materialCount: number
  }
}

const roleLabel: Record<string, string> = {
  alumno: 'Alumno',
  tutor:  'Tutor',
  admin:  'Admin',
}

const roleColor: Record<string, string> = {
  alumno: 'bg-blue-100 text-blue-700',
  tutor:  'bg-violet-100 text-violet-700',
  admin:  'bg-red-100 text-red-700',
}

const dashboardPath: Record<string, string> = {
  alumno: '/dashboard/alumno',
  tutor:  '/dashboard/tutor',
  admin:  '/admin',
}

export default function ProfileWidgetClient({
  name, email, role, universidad, carrera, puntos, stats,
}: ProfileWidgetClientProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const nivel = getNivelMentora(puntos)
  const { porcentaje, puntosParaSiguiente } = getProgresoNivel(puntos)
  const uniCorta = universidad?.match(/\(([^)]+)\)/)?.[1] ?? universidad?.split(' ').slice(-1)[0] ?? ''

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="fixed bottom-4 left-4 z-50">
      {/* Expanded panel */}
      {open && (
        <div className="mb-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{name}</p>
                <p className="text-violet-200 text-xs truncate">{email}</p>
                <span className="mt-0.5 inline-block text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {roleLabel[role] ?? role}
                  {uniCorta && ` · ${uniCorta}`}
                </span>
              </div>
            </div>
          </div>

          {/* Puntos Mentora */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{nivel.emoji}</span>
                <div>
                  <p className="text-xs text-gray-500 leading-none">Puntos Mentora</p>
                  <p className={`font-bold text-sm leading-snug ${nivel.color}`}>{nivel.nombre}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{puntos.toLocaleString('es-CL')}</span>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            {puntosParaSiguiente > 0 && (
              <p className="text-xs text-gray-400 mt-1">{puntosParaSiguiente} pts para el siguiente nivel</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{stats.salasActivas}</p>
              <p className="text-xs text-gray-400">Salas</p>
            </div>
            <div className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{stats.reviewsDadas}</p>
              <p className="text-xs text-gray-400">Reseñas</p>
            </div>
            <div className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{stats.materialCount}</p>
              <p className="text-xs text-gray-400">Material</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-0.5">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </Link>
            <Link
              href={dashboardPath[role] ?? '/dashboard'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/salas"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <span className="text-base leading-none flex-shrink-0">🏫</span>
              Salas de clase
            </Link>
            <div className="pt-1 border-t border-gray-100 mt-1">
              <Link
                href="/logout"
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-500 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                </svg>
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-2xl shadow-lg px-3 py-2.5 hover:shadow-xl transition-all hover:border-violet-300 group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="text-left min-w-0 hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">{name.split(' ')[0]}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>{nivel.emoji}</span>
            <span>{puntos.toLocaleString('es-CL')} pts</span>
          </p>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}
