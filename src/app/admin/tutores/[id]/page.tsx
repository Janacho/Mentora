import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice, getMaterialDisp } from '@/lib/utils'
import ApprovalForm from '@/app/admin/ApprovalForm'

interface PageProps {
  params: Promise<{ id: string }>
}

function NotaBadge({ nota }: { nota: number }) {
  const cls =
    nota >= 6.5 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
    nota >= 6.0 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  'bg-green-100 text-green-800 border-green-300'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {nota.toFixed(1)}
    </span>
  )
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className="text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < Math.round(rating) ? '★' : '☆'}</span>
        ))}
      </span>
      <span className="text-gray-600 font-semibold">{rating.toFixed(1)}</span>
      <span className="text-gray-400">({count} reseña{count !== 1 ? 's' : ''})</span>
    </span>
  )
}

const ESTADO_CFG: Record<string, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente ⏳',  cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  aprobado:  { label: 'Aprobado ✅',   cls: 'bg-green-100 text-green-800 border-green-300' },
  rechazado: { label: 'Rechazado ❌',  cls: 'bg-red-100 text-red-800 border-red-300' },
}

export default async function AdminTutorDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const { id } = await params

  const tutor = await db.tutorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      ramos: { orderBy: { nota: 'desc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { alumno: { select: { name: true, email: true } } },
      },
    },
  })

  if (!tutor) notFound()

  const materialItems = await db.materialItem.findMany({
    where: { tutorUserId: tutor.userId },
    include: { _count: { select: { purchases: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const estado = ESTADO_CFG[tutor.estado] ?? ESTADO_CFG.pendiente
  const avgRating = tutor.reviews.length > 0
    ? tutor.reviews.reduce((sum, r) => sum + r.calificacion, 0) / tutor.reviews.length
    : 0

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin?tab=postulaciones" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Panel admin
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-300">Perfil de tutor</span>
        <div className="ml-auto">
          <span className="text-xs text-violet-400 font-bold">Mentora Admin</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
            <div className="flex items-center gap-6">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-2xl bg-violet-500/30 border-2 border-violet-400/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 text-violet-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white">{tutor.nombreCompleto}</h1>
                <p className="text-slate-300 text-sm mt-0.5">{tutor.user.email}</p>
                <p className="text-slate-400 text-xs mt-1">{tutor.universidad} · {tutor.carrera} · Ingreso {tutor.anioIngreso}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${estado.cls}`}>
                  {estado.label}
                </span>
                <p className="text-slate-400 text-xs mt-2">Postulación: {formatDate(new Date(tutor.createdAt))}</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
            {[
              { label: 'Precio/hora', value: formatPrice(tutor.precioPorHora) },
              { label: 'Modalidad',   value: tutor.modalidad },
              { label: 'Ramos',       value: tutor.ramos.length },
              { label: 'Reseñas',     value: tutor.reviews.length },
            ].map((s, i) => (
              <div key={i} className="px-6 py-4 text-center">
                <div className="text-lg font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificado de notas */}
        {tutor.certificadoUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📄 Certificado de notas</h2>
            {tutor.certificadoUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <div className="space-y-3">
                <img
                  src={tutor.certificadoUrl}
                  alt="Certificado de notas"
                  className="max-w-full rounded-xl border border-gray-200 shadow-sm"
                  style={{ maxHeight: '600px', objectFit: 'contain' }}
                />
                <a
                  href={tutor.certificadoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-800 text-sm font-medium"
                >
                  🔗 Abrir en nueva pestaña
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-4xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Certificado adjunto</p>
                  <a
                    href={tutor.certificadoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1 text-violet-600 hover:text-violet-800 text-sm font-medium"
                  >
                    📥 Descargar / Ver certificado
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {!tutor.certificadoUrl && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            ⚠️ Este tutor no adjuntó certificado de notas.
          </div>
        )}

        {/* Ramos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Ramos que enseña ({tutor.ramos.length})</h2>
          </div>
          {tutor.ramos.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">Sin ramos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Ramo', 'Nota', 'Profesor', 'Período', 'Material disponible', 'Ayudante'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tutor.ramos.map(ramo => {
                    const mat = getMaterialDisp(ramo.materialDisp)
                    return (
                      <tr key={ramo.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-800">{ramo.nombreRamo}</td>
                        <td className="px-5 py-3.5"><NotaBadge nota={ramo.nota} /></td>
                        <td className="px-5 py-3.5 text-gray-500">{ramo.profesor}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{ramo.anio} · S{ramo.semestre}</td>
                        <td className="px-5 py-3.5">
                          {mat.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {mat.includes('pruebas')   && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs">📝 Pruebas</span>}
                              {mat.includes('apuntes')   && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">📚 Apuntes</span>}
                              {mat.includes('resumenes') && <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs">📄 Resúmenes</span>}
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {ramo.fueAyudante
                            ? <span className="text-amber-600 text-xs font-semibold">✓ Sí</span>
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

        {/* Reseñas */}
        {tutor.reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Reseñas ({tutor.reviews.length})</h2>
              {tutor.reviews.length > 0 && <StarRow rating={avgRating} count={tutor.reviews.length} />}
            </div>
            <div className="p-6 space-y-4">
              {tutor.reviews.map(r => (
                <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{r.alumno.name ?? 'Alumno'}</span>
                      <span className="text-gray-400 text-xs ml-2">{r.alumno.email}</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.ramo}{r.profesor ? ` · ${r.profesor}` : ''}
                      </p>
                    </div>
                    <span className="text-yellow-400 text-sm flex-shrink-0">
                      {'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{r.texto}</p>
                  <p className="text-xs text-gray-300 mt-2">{formatDate(new Date(r.createdAt))}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Material en marketplace */}
        {materialItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Material en marketplace ({materialItems.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {materialItems.map(item => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {item.tipo === 'apuntes' ? '📚' : item.tipo === 'resumen' ? '📄' : '📝'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                      <p className="text-xs text-gray-400">{item.ramo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                    <span className="font-semibold text-violet-700">{formatPrice(item.precio)}</span>
                    <span className="text-gray-400">{item._count.purchases} venta{item._count.purchases !== 1 ? 's' : ''}</span>
                    {item.archivoUrl && (
                      <a
                        href={item.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-800 text-xs font-medium"
                      >
                        📥 Ver archivo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval actions — only for pending */}
        {tutor.estado === 'pendiente' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Decisión sobre la postulación</h2>
            <ApprovalForm tutorId={tutor.id} />
          </div>
        )}

        {/* Admin message */}
        {tutor.mensajeAdmin && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">Mensaje enviado al tutor:</p>
            <p>{tutor.mensajeAdmin}</p>
          </div>
        )}

      </div>
    </div>
  )
}
