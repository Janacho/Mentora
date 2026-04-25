import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import PaymentSetupForm from './PaymentSetupForm'

export default async function AlumnoDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'alumno') redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      purchases: {
        include: { item: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) redirect('/login')

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)

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
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-violet-700">
            Hola, {user.name?.split(' ')[0] ?? 'Alumno'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">{user.email} · {user.universidad}</p>
        </div>

        {/* Payment warning */}
        {!user.paymentConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div className="flex-1">
                <h2 className="font-semibold text-amber-800 mb-1">Configura tu método de pago</h2>
                <p className="text-amber-700 text-sm mb-4">
                  Debes agregar un método de pago para poder solicitar sesiones con tutores.
                </p>
                <PaymentSetupForm />
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/tutores"
            className="flex items-center gap-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl p-6 transition-colors shadow-md"
          >
            <span className="text-3xl">🔍</span>
            <div>
              <div className="font-bold text-lg">Buscar tutor</div>
              <div className="text-violet-200 text-sm">Encuentra ayuda para tus ramos</div>
            </div>
          </a>
          <a
            href="/material"
            className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-6 transition-colors shadow-md"
          >
            <span className="text-3xl">📚</span>
            <div>
              <div className="font-bold text-lg">Marketplace de Material</div>
              <div className="text-indigo-200 text-sm">Apuntes y pruebas de pares</div>
            </div>
          </a>
        </div>

        {/* Profile info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mi perfil</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Universidad', value: user.universidad ?? '—' },
              { label: 'Carrera',     value: user.carrera ?? '—' },
              { label: 'Año actual',  value: user.anioActual ? `${user.anioActual}° año` : '—' },
              { label: 'Pago',        value: user.paymentConfigured ? '✅ Configurado' : '⚠️ Pendiente' },
            ].map(f => (
              <div key={f.label}>
                <div className="text-gray-500 text-xs mb-0.5">{f.label}</div>
                <div className="font-medium text-gray-800">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase history */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Material comprado</h2>
          {user.purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p>Aún no has comprado material.</p>
              <a href="/material" className="text-violet-600 hover:underline text-sm mt-1 inline-block">
                Explorar marketplace →
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Nombre', 'Tipo', 'Ramo', 'Precio', 'Fecha'].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {user.purchases.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-800">{p.item.nombre}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoColors[p.item.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                          {tipoLabel[p.item.tipo] ?? p.item.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{p.item.ramo}</td>
                      <td className="py-3 px-2 text-gray-700 font-medium">{formatPrice(p.monto)}</td>
                      <td className="py-3 px-2 text-gray-400">{formatDate(new Date(p.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
