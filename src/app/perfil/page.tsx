import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import {
  PUNTOS_REGLAS, getNivelMentora, getProgresoNivel, NIVELES_MENTORA, formatPrice,
} from '@/lib/utils'
import Link from 'next/link'

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      reviews:            { include: { tutor: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      purchases:          { include: { item: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      materialItems:      { include: { purchases: { select: { id: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
      salaParticipaciones: {
        where: { estado: 'confirmado' },
        include: { sala: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      tutorProfile: {
        include: {
          reviews:        { orderBy: { createdAt: 'desc' }, take: 5 },
          salasAsignadas: { orderBy: { createdAt: 'desc' }, take: 5 },
          ramos: true,
        },
      },
    },
  })

  if (!user) redirect('/login')

  // Compute Puntos Mentora
  let puntos = 0
  puntos += user.reviews.length * PUNTOS_REGLAS.reviewDada
  puntos += user.salaParticipaciones.length * PUNTOS_REGLAS.salaConfirmada
  puntos += user.purchases.length * PUNTOS_REGLAS.materialComprado

  if (user.tutorProfile) {
    puntos += user.tutorProfile.salasAsignadas.length * PUNTOS_REGLAS.salaEnsenada
    for (const r of user.tutorProfile.reviews) {
      if (r.calificacion === 5) puntos += PUNTOS_REGLAS.reviewRecibida5
      else if (r.calificacion === 4) puntos += PUNTOS_REGLAS.reviewRecibida4
    }
    for (const m of user.materialItems) {
      puntos += m.purchases.length * PUNTOS_REGLAS.materialVendido
    }
  }

  const nivel = getNivelMentora(puntos)
  const { porcentaje, puntosParaSiguiente } = getProgresoNivel(puntos)
  const initials = (user.name ?? 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  const dashPath = user.role === 'tutor' ? '/dashboard/tutor' : user.role === 'admin' ? '/admin' : '/dashboard/alumno'

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(d)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-700" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl border-4 border-white shadow-md">
                {initials}
              </div>
              <div className="flex gap-2 pt-10">
                <Link
                  href={dashPath}
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/logout"
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cerrar sesión
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === 'tutor' ? 'bg-violet-100 text-violet-700'
                    : user.role === 'admin' ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'tutor' ? 'Tutor' : user.role === 'admin' ? 'Admin' : 'Alumno'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
                {(user.universidad || user.carrera) && (
                  <p className="text-gray-600 text-sm mt-1">
                    {user.carrera && <span className="font-medium">{user.carrera}</span>}
                    {user.universidad && user.carrera && <span className="text-gray-400"> · </span>}
                    {user.universidad && <span>{user.universidad}</span>}
                  </p>
                )}
                {user.anioActual && (
                  <p className="text-gray-400 text-xs mt-0.5">{user.anioActual}° año</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Puntos Mentora */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <span className="text-xl">{nivel.emoji}</span>
            Puntos Mentora
          </h2>

          <div className="flex items-center gap-6 mb-5 flex-wrap">
            <div>
              <p className="text-5xl font-black text-gray-900">{puntos.toLocaleString('es-CL')}</p>
              <p className={`text-sm font-semibold mt-1 ${nivel.color}`}>{nivel.emoji} {nivel.nombre}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progreso al siguiente nivel</span>
                <span>{porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-3 rounded-full transition-all"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              {puntosParaSiguiente > 0 ? (
                <p className="text-xs text-gray-400 mt-1.5">Faltan {puntosParaSiguiente} pts para el siguiente nivel</p>
              ) : (
                <p className="text-xs text-violet-500 mt-1.5 font-medium">¡Nivel máximo alcanzado! 🎉</p>
              )}
            </div>
          </div>

          {/* All levels */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {NIVELES_MENTORA.map(n => (
              <div
                key={n.nombre}
                className={`rounded-xl p-3 text-center border ${
                  nivel.nombre === n.nombre
                    ? 'border-violet-300 bg-violet-50'
                    : puntos >= n.minPuntos
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-dashed border-gray-200 opacity-50'
                }`}
              >
                <p className="text-2xl mb-1">{n.emoji}</p>
                <p className="text-xs font-semibold text-gray-700">{n.nombre}</p>
                <p className="text-xs text-gray-400">{n.minPuntos.toLocaleString('es-CL')} pts</p>
              </div>
            ))}
          </div>

          {/* How to earn */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cómo ganar puntos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Dejar una reseña',      pts: PUNTOS_REGLAS.reviewDada,        icon: '⭐' },
                { label: 'Clase grupal confirmada', pts: PUNTOS_REGLAS.salaConfirmada,   icon: '🏫' },
                { label: 'Comprar material',       pts: PUNTOS_REGLAS.materialComprado,  icon: '📚' },
                ...(user.role === 'tutor' ? [
                  { label: 'Clase impartida',      pts: PUNTOS_REGLAS.salaEnsenada,      icon: '🎓' },
                  { label: 'Reseña 5⭐ recibida', pts: PUNTOS_REGLAS.reviewRecibida5,   icon: '🌟' },
                  { label: 'Material vendido',     pts: PUNTOS_REGLAS.materialVendido,   icon: '💰' },
                ] : []),
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-600">{item.label}</p>
                    <p className="text-xs font-bold text-violet-600">+{item.pts} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Salas', value: user.salaParticipaciones.length, icon: '🏫', href: '/salas' },
            { label: 'Reseñas dadas', value: user.reviews.length, icon: '⭐', href: undefined },
            { label: user.role === 'tutor' ? 'Material publicado' : 'Material comprado',
              value: user.role === 'tutor' ? user.materialItems.length : user.purchases.length,
              icon: '📚', href: '/material' },
            ...(user.role === 'tutor' && user.tutorProfile ? [
              { label: 'Ramos enseñados', value: user.tutorProfile.ramos.length, icon: '📖', href: undefined },
            ] : [
              { label: 'Puntos Mentora', value: puntos, icon: nivel.emoji, href: undefined },
            ]),
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value.toLocaleString('es-CL')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              {stat.href && (
                <Link href={stat.href} className="text-xs text-violet-600 hover:underline mt-1 block">
                  Ver →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Salas recientes */}
          {user.salaParticipaciones.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🏫</span> Salas recientes
              </h3>
              <div className="space-y-2">
                {user.salaParticipaciones.slice(0, 4).map(sp => (
                  <Link
                    key={sp.id}
                    href={`/salas/${sp.sala.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{sp.sala.ramo}</p>
                      <p className="text-xs text-gray-400">{formatDate(sp.createdAt)}</p>
                    </div>
                    <span className="text-xs text-violet-600">Ver →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reseñas dadas */}
          {user.reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>⭐</span> Reseñas dadas
              </h3>
              <div className="space-y-2">
                {user.reviews.slice(0, 4).map(r => (
                  <div key={r.id} className="p-2.5 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">{r.ramo}</p>
                      <div className="flex">
                        {Array.from({ length: r.calificacion }).map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Material comprado */}
          {user.purchases.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>📚</span> Material comprado
              </h3>
              <div className="space-y-2">
                {user.purchases.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.item.nombre}</p>
                      <p className="text-xs text-gray-400">{p.item.ramo}</p>
                    </div>
                    <span className="text-sm font-bold text-violet-700 whitespace-nowrap ml-2">
                      {formatPrice(p.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tutor: material publicado */}
          {user.role === 'tutor' && user.materialItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>💰</span> Material publicado
              </h3>
              <div className="space-y-2">
                {user.materialItems.slice(0, 4).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{m.nombre}</p>
                      <p className="text-xs text-gray-400">{m.purchases.length} venta{m.purchases.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-violet-700">{formatPrice(m.precio)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
