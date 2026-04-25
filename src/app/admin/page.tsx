import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import ApprovalForm from './ApprovalForm'

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const params = await searchParams
  const tab = params.tab ?? 'dashboard'

  const [
    tutoresActivos,
    alumnosCount,
    pendientesCount,
    totalMaterial,
    postulaciones,
    usuarios,
  ] = await Promise.all([
    db.tutorProfile.count({ where: { estado: 'aprobado' } }),
    db.user.count({ where: { role: 'alumno' } }),
    db.tutorProfile.count({ where: { estado: 'pendiente' } }),
    db.materialItem.count(),
    db.tutorProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, ramos: true },
    }),
    db.user.findMany({
      where: { role: { in: ['alumno', 'tutor'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)

  const estadoConfig: Record<string, { label: string; cls: string }> = {
    pendiente: { label: 'Pendiente ⏳',  cls: 'bg-amber-100 text-amber-800' },
    aprobado:  { label: 'Aprobado ✅',   cls: 'bg-green-100 text-green-800' },
    rechazado: { label: 'Rechazado ❌',  cls: 'bg-red-100 text-red-800' },
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="text-xl font-black text-violet-400">Mentora</div>
          <div className="text-xs text-slate-500 mt-0.5">Panel Admin</div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {[
            { id: 'dashboard',     icon: '📊', label: 'Dashboard' },
            { id: 'postulaciones', icon: '📋', label: 'Postulaciones' },
            { id: 'usuarios',      icon: '👥', label: 'Usuarios' },
          ].map(item => (
            <a
              key={item.id}
              href={`/admin?tab=${item.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === item.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === 'postulaciones' && pendientesCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {pendientesCount}
                </span>
              )}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <form action="/api/auth/logout" method="POST">
            <button className="text-slate-500 hover:text-white text-sm w-full text-left transition-colors">
              🚪 Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🎓', value: tutoresActivos,  label: 'Tutores activos' },
                { icon: '📚', value: alumnosCount,    label: 'Alumnos registrados' },
                { icon: '⏳', value: pendientesCount, label: 'Postulaciones pendientes' },
                { icon: '📦', value: totalMaterial,   label: 'Items en marketplace' },
              ].map((m, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="text-3xl mb-1">{m.icon}</div>
                  <div className="text-3xl font-bold text-violet-600">{m.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Recent applications */}
            {pendientesCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h2 className="font-semibold text-amber-800 mb-2">
                  ⏳ {pendientesCount} postulacion{pendientesCount !== 1 ? 'es' : ''} esperando revisión
                </h2>
                <a
                  href="/admin?tab=postulaciones"
                  className="text-amber-700 hover:text-amber-900 text-sm font-medium underline"
                >
                  Revisar postulaciones →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── POSTULACIONES TAB ── */}
        {tab === 'postulaciones' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Postulaciones de tutores</h1>

            <div className="space-y-4">
              {postulaciones.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
                  No hay postulaciones aún.
                </div>
              ) : (
                postulaciones.map((p) => {
                  const st = estadoConfig[p.estado] ?? estadoConfig.pendiente
                  return (
                    <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-lg">{p.nombreCompleto}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">{p.user.email}</p>
                          <p className="text-gray-600 text-sm">
                            {p.universidad} · {p.carrera} · Ingreso {p.anioIngreso}
                          </p>
                          <p className="text-gray-600 text-sm">
                            💰 {formatPrice(p.precioPorHora)}/hr · 📡 {p.modalidad}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-400 space-y-2">
                          <p>{formatDate(new Date(p.createdAt))}</p>
                          <a
                            href={`/admin/tutores/${p.id}`}
                            className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 font-medium text-xs bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            👤 Ver perfil completo
                          </a>
                        </div>
                      </div>

                      {/* Ramos */}
                      {p.ramos.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 font-medium mb-2">Ramos que enseña:</p>
                          <div className="flex flex-wrap gap-2">
                            {p.ramos.map((r) => (
                              <span key={r.id} className="bg-violet-50 text-violet-700 border border-violet-200 rounded-lg px-3 py-1 text-xs">
                                {r.nombreRamo} <strong>{r.nota.toFixed(1)}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certificate */}
                      {p.certificadoUrl && (
                        <div className="mt-3">
                          <a
                            href={p.certificadoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            📄 Ver certificado de notas
                          </a>
                        </div>
                      )}

                      {/* Admin message */}
                      {p.mensajeAdmin && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                          <strong>Mensaje enviado:</strong> {p.mensajeAdmin}
                        </div>
                      )}

                      {/* Approval form */}
                      {p.estado === 'pendiente' && (
                        <div className="mt-5 pt-4 border-t border-gray-100">
                          <ApprovalForm tutorId={p.id} />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── USUARIOS TAB ── */}
        {tab === 'usuarios' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Usuarios activos</h1>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Nombre', 'Email', 'Rol', 'Universidad', 'Registro'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-800">{u.name ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'tutor'
                              ? 'bg-violet-100 text-violet-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.universidad ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-400">{formatDate(new Date(u.createdAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
