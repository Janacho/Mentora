import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMaterialDisp, formatPrice } from '@/lib/utils'
import AddMaterialForm from './AddMaterialForm'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

function NotaBadge({ nota }: { nota: number }) {
  const color =
    nota >= 6.5 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
    nota >= 6.0 ? 'bg-blue-100 text-blue-800 border-blue-300' :
    'bg-green-100 text-green-800 border-green-300'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {nota.toFixed(1)}
    </span>
  )
}

export default async function TutorDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'tutor') redirect('/login')

  const tutorProfile = await db.tutorProfile.findFirst({
    where: { userId: session.userId },
    include: {
      ramos: true,
      reviews: {
        include: { alumno: true },
        orderBy: { createdAt: 'desc' },
      },
      user: true,
    },
  })

  if (!tutorProfile) redirect('/postulacion')

  const materialItems = await db.materialItem.findMany({
    where: { tutorUserId: session.userId },
    include: { _count: { select: { purchases: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avgRating =
    tutorProfile.reviews.length > 0
      ? tutorProfile.reviews.reduce((sum, r) => sum + r.calificacion, 0) / tutorProfile.reviews.length
      : 0

  const statusConfig = {
    pendiente: { label: 'Pendiente de revisión ⏳', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    aprobado:  { label: 'Aprobado ✅',               cls: 'bg-green-50 text-green-800 border-green-200' },
    rechazado: { label: 'Rechazado ❌',              cls: 'bg-red-50 text-red-800 border-red-200' },
  }
  const status = statusConfig[tutorProfile.estado as keyof typeof statusConfig] ?? statusConfig.pendiente

  const tipoLabel: Record<string, string> = {
    apuntes: 'Apuntes', resumen: 'Resumen', prueba_antigua: 'Prueba Antigua',
  }
  const tipoColors: Record<string, string> = {
    apuntes: 'bg-blue-100 text-blue-700',
    resumen: 'bg-green-100 text-green-700',
    prueba_antigua: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-violet-700">Panel del Tutor</h1>
            <p className="text-gray-500 mt-1">{tutorProfile.user.name}</p>
          </div>
          <a
            href={`/tutores/${tutorProfile.id}`}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            🌐 Ver perfil público
          </a>
        </div>

        {/* Status */}
        <div className={`border rounded-2xl p-6 shadow-sm ${status.cls}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`text-lg font-bold px-4 py-2 rounded-xl border ${status.cls}`}>
              {status.label}
            </span>
            {tutorProfile.estado === 'pendiente' && (
              <p className="text-sm">Tu perfil está siendo revisado. Te notificaremos pronto.</p>
            )}
          </div>
          {tutorProfile.mensajeAdmin && (
            <div className="mt-4 p-4 bg-white/60 rounded-xl border border-current/20">
              <p className="text-sm font-semibold mb-1">Mensaje del administrador:</p>
              <p className="text-sm">{tutorProfile.mensajeAdmin}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: avgRating > 0 ? avgRating.toFixed(1) : '—', label: 'Calificación', extra: avgRating > 0 ? <StarDisplay rating={avgRating} /> : null },
            { value: tutorProfile.reviews.length, label: 'Reseñas' },
            { value: tutorProfile.ramos.length, label: 'Ramos' },
            { value: formatPrice(tutorProfile.precioPorHora), label: 'Precio/hora' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
              <div className="text-2xl font-bold text-violet-600">{s.value}</div>
              {s.extra && <div className="mt-0.5">{s.extra}</div>}
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Ramos */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mis ramos</h2>
          {tutorProfile.ramos.length === 0 ? (
            <p className="text-gray-400 text-sm">No tienes ramos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Ramo', 'Nota', 'Profesor', 'Período', 'Material', 'Ayudante'].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tutorProfile.ramos.map((ramo) => {
                    const mat = getMaterialDisp(ramo.materialDisp)
                    return (
                      <tr key={ramo.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 font-medium text-gray-800">{ramo.nombreRamo}</td>
                        <td className="py-3 px-2"><NotaBadge nota={ramo.nota} /></td>
                        <td className="py-3 px-2 text-gray-600">{ramo.profesor}</td>
                        <td className="py-3 px-2 text-gray-600">{ramo.anio} S{ramo.semestre}</td>
                        <td className="py-3 px-2 text-gray-600">
                          {mat.length > 0 ? (
                            <span className="flex gap-1">
                              {mat.includes('pruebas') && '📝'}
                              {mat.includes('apuntes') && '📚'}
                              {mat.includes('resumenes') && '📄'}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 px-2">
                          {ramo.fueAyudante
                            ? <span className="text-amber-600 text-xs font-medium">✓ Sí</span>
                            : <span className="text-gray-300 text-xs">No</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reseñas recibidas</h2>
          {tutorProfile.reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">Aún no tienes reseñas.</p>
          ) : (
            <div className="space-y-4">
              {tutorProfile.reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-800 text-sm">
                        {review.alumno.name?.split(' ')[0] ?? 'Alumno'}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        Me ayudó a pasar {review.ramo} con el Profe {review.profesor}
                      </span>
                    </div>
                    <StarDisplay rating={review.calificacion} />
                  </div>
                  <p className="text-gray-600 text-sm">{review.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Material en venta */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mi material en venta</h2>
          {materialItems.length === 0 ? (
            <p className="text-gray-400 text-sm">Aún no has subido material.</p>
          ) : (
            <div className="space-y-3">
              {materialItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoColors[item.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                      {tipoLabel[item.tipo] ?? item.tipo}
                    </span>
                    <span className="font-medium text-gray-800 text-sm">{item.nombre}</span>
                    <span className="text-gray-400 text-xs">{item.ramo}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700 font-medium">{formatPrice(item.precio)}</span>
                    <span className="text-gray-400">
                      {item._count.purchases} venta{item._count.purchases !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subir material */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Subir nuevo material</h2>
          <p className="text-gray-500 text-sm mb-5">
            Comparte tus apuntes y gana dinero. La plataforma retiene un 20% por venta.
          </p>
          <AddMaterialForm ramos={tutorProfile.ramos.map((r) => r.nombreRamo)} />
        </div>

      </div>
    </div>
  )
}
