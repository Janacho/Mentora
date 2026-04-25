import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import NotaBadge from '@/components/NotaBadge'
import StarRating from '@/components/StarRating'
import { formatPrice, getMaterialDisp } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

const MODALIDAD_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  ambas: 'Presencial & Online',
}

const MATERIAL_ICON: Record<string, { icon: string; label: string }> = {
  'Pruebas antiguas': { icon: '📝', label: 'Pruebas antiguas' },
  'Apuntes': { icon: '📚', label: 'Apuntes' },
  'Resúmenes': { icon: '📄', label: 'Resúmenes' },
}

export default async function TutorDetailPage({ params }: PageProps) {
  const { id } = await params

  const tutor = await db.tutorProfile.findUnique({
    where: { id },
    include: {
      ramos: { orderBy: { nota: 'desc' } },
      user: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { alumno: { select: { name: true } } },
      },
    },
  })

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tutor no encontrado</h2>
          <p className="text-gray-500 mb-6">Este perfil no existe o fue eliminado.</p>
          <Link
            href="/tutores"
            className="inline-flex items-center px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            Volver a tutores
          </Link>
        </div>
      </div>
    )
  }

  if (tutor.estado === 'pendiente') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-yellow-200 rounded-2xl p-10 shadow-sm">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Perfil en revisión</h2>
          <p className="text-gray-500 text-sm mb-6">
            Este tutor aún no ha sido verificado. Vuelve pronto.
          </p>
          <Link href="/tutores" className="text-violet-600 font-medium hover:underline text-sm">
            Ver otros tutores
          </Link>
        </div>
      </div>
    )
  }

  const firstName = (tutor.nombreCompleto || tutor.user?.name || 'Tutor').split(' ')[0]
  const avgCalificacion = tutor.calificacion ?? 0
  const totalResenas = tutor.totalResenas ?? 0
  const isTutorTop = avgCalificacion >= 4.5 && totalResenas >= 3

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl"
                style={{ position: 'relative' }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-violet-300 to-indigo-400"
                  style={{ filter: 'blur(6px)', transform: 'scale(1.1)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-none flex items-center justify-center border-2 border-white/50">
                    <svg className="w-12 h-12 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold">{firstName}</h1>
              <p className="mt-1 text-violet-200 text-sm">{tutor.universidad}</p>
              <p className="text-violet-300 text-xs">{tutor.carrera} · Ingreso {tutor.anioIngreso}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-100">
                  Verificado ✅
                </span>
                {tutor.ramos.some(r => r.fueAyudante) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 border border-amber-400/40 text-amber-100">
                    Ayudante 🏆
                  </span>
                )}
                {isTutorTop && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-400/20 border border-violet-300/40 text-violet-100">
                    Tutor Top ⭐
                  </span>
                )}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex-shrink-0 text-center sm:text-right">
              <div className="text-2xl font-bold">{formatPrice(tutor.precioPorHora)}</div>
              <div className="text-violet-200 text-xs mb-3">por hora · {MODALIDAD_LABEL[tutor.modalidad] ?? tutor.modalidad}</div>
              <Link
                href={`/pago/${tutor.id}`}
                className="inline-flex items-center px-6 py-3 bg-white text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 transition-colors shadow-lg"
              >
                Solicitar sesión
              </Link>
            </div>
          </div>

          {/* Star rating in hero */}
          <div className="mt-6 flex justify-center sm:justify-start">
            <StarRating rating={avgCalificacion} count={totalResenas} size="md" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Ramos que enseña */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Ramos que enseña</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ramo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nota</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Profesor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Período</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tutor.ramos.map(ramo => {
                  const mat = getMaterialDisp(ramo.materialDisp)
                  return (
                    <tr key={ramo.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{ramo.nombreRamo}</span>
                          {ramo.fueAyudante && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              Ayudante
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <NotaBadge nota={ramo.nota} />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell">{ramo.profesor}</td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                        {ramo.anio} · S{ramo.semestre}
                      </td>
                      <td className="px-4 py-3.5">
                        {mat.length > 0 ? (
                          <div className="flex gap-1">
                            {mat.map(m => (
                              <span key={m} title={MATERIAL_ICON[m]?.label ?? m} className="text-base leading-none">
                                {MATERIAL_ICON[m]?.icon ?? '📁'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Reseñas</h2>
            {totalResenas > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avgCalificacion} count={totalResenas} size="sm" />
              </div>
            )}
          </div>

          <div className="p-6">
            {tutor.reviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Aún no hay reseñas para este tutor.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {tutor.reviews.map(review => (
                  <div key={review.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {review.alumno?.name ?? 'Estudiante'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Me ayudó a pasar{' '}
                          <span className="font-medium text-gray-600">{review.ramo}</span>
                          {review.profesor && (
                            <> con el Profe <span className="font-medium text-gray-600">{review.profesor}</span></>
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <StarRating rating={review.calificacion} size="sm" />
                      </div>
                    </div>
                    {review.texto && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.texto}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-300">
                      {new Date(review.createdAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Back link */}
        <div className="pb-4">
          <Link
            href="/tutores"
            className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a tutores
          </Link>
        </div>
      </div>
    </div>
  )
}
