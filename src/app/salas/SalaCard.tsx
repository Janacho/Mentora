import Link from 'next/link'
import { getSalaPrecio, formatPrice } from '@/lib/utils'

interface SalaCardProps {
  id: string
  tipo: string
  ramo: string
  modalidad: string
  estado: string
  privacidad: string
  cuposMax: number
  confirmados: number
  precioBase: number | null
  fechaClase: Date | null
  horaInicio: string | null
  tutorNombre: string | null
  descripcion: string | null
}

const estadoColors: Record<string, string> = {
  abierta:    'bg-green-100 text-green-700',
  completa:   'bg-amber-100 text-amber-700',
  confirmada: 'bg-blue-100 text-blue-700',
  cancelada:  'bg-red-100 text-red-700',
}

const modalidadIcon: Record<string, string> = {
  presencial: '🏫',
  online:     '💻',
  ambas:      '🌐',
}

export default function SalaCard({
  id, tipo, ramo, modalidad, estado, privacidad,
  cuposMax, confirmados, precioBase, fechaClase, horaInicio,
  tutorNombre, descripcion,
}: SalaCardProps) {
  const cuposLibres = cuposMax - confirmados
  const precio = tipo === 'tutor_crea' && precioBase
    ? precioBase
    : getSalaPrecio(Math.max(confirmados + 1, 2))

  const fechaStr = fechaClase
    ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(fechaClase)
    : null

  return (
    <Link href={`/salas/${id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${estadoColors[estado] ?? 'bg-gray-100 text-gray-600'}`}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
            {privacidad === 'privada' && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                🔒 Privada
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {tipo === 'tutor_crea' ? '📣 Tutor ofrece' : '🎓 Alumnos buscan'}
          </span>
        </div>

        {/* Ramo */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-violet-700 transition-colors">
            {ramo}
          </h3>
          {descripcion && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{descripcion}</p>
          )}
        </div>

        {/* Tutor blur */}
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500"
              style={{ filter: tutorNombre ? undefined : 'blur(4px)' }}
            />
            {!tutorNombre && (
              <svg className="absolute inset-0 m-auto w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {tutorNombre ? tutorNombre : <span className="blur-sm select-none">Tutor Tutor</span>}
          </span>
          {!tutorNombre && (
            <span className="text-xs text-violet-500 font-medium">Sin tutor aún</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>{modalidadIcon[modalidad] ?? '🌐'} {modalidad === 'ambas' ? 'Presencial y Online' : modalidad.charAt(0).toUpperCase() + modalidad.slice(1)}</span>
          {fechaStr && <span>📅 {fechaStr}{horaInicio ? ` · ${horaInicio}` : ''}</span>}
          <span className={cuposLibres <= 1 ? 'text-red-500 font-medium' : ''}>
            👥 {cuposLibres > 0 ? `${cuposLibres} cupo${cuposLibres !== 1 ? 's' : ''} libre${cuposLibres !== 1 ? 's' : ''}` : 'Sin cupos'}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
          <div>
            <span className="text-lg font-bold text-violet-700">{formatPrice(precio)}</span>
            <span className="text-xs text-gray-400">/hr por persona</span>
          </div>
          <span className="text-xs font-medium text-violet-600 group-hover:underline">
            Ver sala →
          </span>
        </div>
      </div>
    </Link>
  )
}
