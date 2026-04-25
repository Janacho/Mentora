'use client'

import Link from 'next/link'
import NotaBadge from '@/components/NotaBadge'
import StarRating from '@/components/StarRating'
import { formatPrice } from '@/lib/utils'

interface TutorCardProps {
  id: string
  firstName: string
  universidad: string
  carrera: string
  ramoNombre: string
  nota: number
  modalidad: string
  precioPorHora: number
  calificacion: number
  totalResenas: number
  fueAyudante: boolean
  materialDisp: string[]
  estado: string
}

const MODALIDAD_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  ambas: 'Presencial & Online',
}

const MODALIDAD_STYLE: Record<string, string> = {
  presencial: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  online: 'bg-violet-50 text-violet-700 border border-violet-200',
  ambas: 'bg-purple-50 text-purple-700 border border-purple-200',
}

export default function TutorCard({
  id,
  firstName,
  universidad,
  carrera,
  ramoNombre,
  nota,
  modalidad,
  precioPorHora,
  calificacion,
  totalResenas,
  fueAyudante,
  materialDisp,
  estado,
}: TutorCardProps) {
  const isAprobado = estado === 'aprobado'

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col">
      {/* Photo section */}
      <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
        {/* Blurred gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-violet-200 to-indigo-300"
          style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
        />
        {/* Non-blurred icon on top */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-none flex items-center justify-center border-2 border-white/60 shadow-md">
            <svg
              className="w-12 h-12 text-white drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        </div>

        {/* Ramo name ribbon */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
          <span className="text-white text-xs font-medium truncate block">{ramoNombre}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + nota */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-gray-900 font-semibold text-base leading-tight">{firstName}</h3>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{universidad}</p>
            <p className="text-gray-400 text-xs truncate">{carrera}</p>
          </div>
          <div className="flex-shrink-0">
            <NotaBadge nota={nota} />
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          {isAprobado ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verificado ✅
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              Verificación pendiente ⏳
            </span>
          )}

          {fueAyudante && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Ayudante 🏆
            </span>
          )}

          {calificacion >= 4.5 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
              Tutor Top ⭐
            </span>
          )}
        </div>

        {/* Material disponible */}
        {materialDisp.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Material:</span>
            <div className="flex gap-1">
              {materialDisp.includes('pruebas') && (
                <span title="Pruebas" className="text-base leading-none">📝</span>
              )}
              {materialDisp.includes('apuntes') && (
                <span title="Apuntes" className="text-base leading-none">📚</span>
              )}
              {materialDisp.includes('resumenes') && (
                <span title="Resúmenes" className="text-base leading-none">📄</span>
              )}
            </div>
          </div>
        )}

        {/* Star rating */}
        <StarRating rating={calificacion} count={totalResenas} size="sm" />

        {/* Bottom row: modalidad + price + button */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                MODALIDAD_STYLE[modalidad] ?? 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {MODALIDAD_LABEL[modalidad] ?? modalidad}
            </span>
            <span className="text-gray-800 font-semibold text-sm">
              {formatPrice(precioPorHora)}
              <span className="text-gray-400 font-normal">/hr</span>
            </span>
          </div>

          <Link
            href={`/tutores/${id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
