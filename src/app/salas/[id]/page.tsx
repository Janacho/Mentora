import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatPrice, getSalaPrecio } from '@/lib/utils'
import SalaActions from './SalaActions'

interface PageProps {
  params: Promise<{ id: string }>
}

const estadoBadge: Record<string, string> = {
  abierta:    'bg-green-100 text-green-700 border-green-200',
  completa:   'bg-amber-100 text-amber-700 border-amber-200',
  confirmada: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelada:  'bg-red-100 text-red-700 border-red-200',
}

export default async function SalaDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()

  const sala = await db.sala.findUnique({
    where: { id },
    include: {
      creador: true,
      tutorAsignado: { include: { user: true, ramos: true } },
      participantes: { include: { user: true } },
      postulaciones: { include: { tutor: { include: { user: true } } } },
    },
  })

  if (!sala) notFound()

  const confirmados = sala.participantes.filter(p => p.estado === 'confirmado')
  const pendientes  = sala.participantes.filter(p => p.estado === 'pendiente')
  const cuposLibres = sala.cuposMax - confirmados.length

  const precio = sala.tipo === 'tutor_crea' && sala.precioBase
    ? sala.precioBase
    : getSalaPrecio(Math.max(confirmados.length + 1, 2))

  const isCreador = session?.userId === sala.creadorId
  const tutorProfile = session ? await db.tutorProfile.findUnique({ where: { userId: session.userId as string } }) : null
  const isTutorAsignado = tutorProfile?.id === sala.tutorAsignadoId
  const yaParticipa = session
    ? sala.participantes.some(p => p.userId === session.userId)
    : false
  const yaPostulo = tutorProfile
    ? sala.postulaciones.some(p => p.tutorProfileId === tutorProfile.id)
    : false

  const fechaStr = sala.fechaClase
    ? new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(sala.fechaClase)
    : null

  const fechaLimiteStr = sala.fechaLimite
    ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }).format(sala.fechaLimite)
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <a href="/salas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Salas
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoBadge[sala.estado] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {sala.estado.charAt(0).toUpperCase() + sala.estado.slice(1)}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {sala.tipo === 'tutor_crea' ? '📣 Tutor ofrece' : '🎓 Alumnos buscan'}
                  </span>
                  {sala.privacidad === 'privada' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">🔒 Privada</span>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">{sala.ramo}</h1>
              {sala.descripcion && <p className="text-gray-500 text-sm">{sala.descripcion}</p>}

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Modalidad</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {sala.modalidad === 'presencial' ? '🏫 Presencial'
                      : sala.modalidad === 'online' ? '💻 Online'
                      : '🌐 Presencial y Online'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Cupos libres</p>
                  <p className={`text-sm font-semibold ${cuposLibres <= 1 ? 'text-red-600' : 'text-gray-800'}`}>
                    {cuposLibres}/{sala.cuposMax}
                  </p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Precio/persona</p>
                  <p className="text-sm font-bold text-violet-700">{formatPrice(precio)}/hr</p>
                </div>
                {fechaStr && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Fecha y hora</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {fechaStr}{sala.horaInicio ? ` · ${sala.horaInicio}` : ''}
                    </p>
                  </div>
                )}
                {sala.ubicacion && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Ubicación</p>
                    <p className="text-sm font-semibold text-gray-800">{sala.ubicacion}</p>
                  </div>
                )}
                {fechaLimiteStr && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600 mb-0.5">Fecha límite</p>
                    <p className="text-sm font-semibold text-amber-800">{fechaLimiteStr}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tutor card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Tutor</h2>
              {sala.tutorAsignado ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500" style={{ filter: 'blur(3px)' }} />
                    <svg className="absolute inset-0 m-auto w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {sala.tutorAsignado.user?.name?.split(' ')[0] ?? 'Tutor'}
                      <span className="ml-1 text-xs text-gray-400">(confirmado)</span>
                    </p>
                    <p className="text-sm text-gray-500">{sala.tutorAsignado.carrera}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ⭐ {sala.tutorAsignado.calificacion.toFixed(1)} · {sala.tutorAsignado.totalResenas} reseñas
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Aún sin tutor asignado</p>
                  <p className="text-xs text-gray-400 mt-0.5">Los tutores habilitados para este ramo verán la sala y podrán postular</p>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Participantes ({confirmados.length}/{sala.cuposMax})
              </h2>
              {confirmados.length === 0 ? (
                <p className="text-sm text-gray-400">Aún no hay participantes confirmados.</p>
              ) : (
                <div className="space-y-2">
                  {confirmados.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-xs font-bold text-violet-700">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700 blur-sm select-none">
                        {p.user.name ?? 'Alumno'}
                      </span>
                      <span className="text-xs text-gray-400">· confirmado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <h2 className="font-semibold text-gray-800 mb-4">Acciones</h2>

              {session ? (
                <SalaActions
                  salaId={sala.id}
                  userRole={session.role as string ?? 'alumno'}
                  userId={session.userId as string}
                  isCreador={isCreador}
                  isTutorAsignado={isTutorAsignado}
                  estado={sala.estado}
                  yaParticipa={yaParticipa}
                  yaPostulo={yaPostulo}
                  esTutorAprobado={tutorProfile?.estado === 'aprobado'}
                  tutorAsignadoId={sala.tutorAsignadoId}
                  postulaciones={sala.postulaciones.map(p => ({
                    id: p.id,
                    tutorNombre: p.tutor.user?.name?.split(' ')[0] ?? 'Tutor',
                    tutorCalif: p.tutor.calificacion ?? 0,
                    mensaje: p.mensaje,
                    estado: p.estado,
                  }))}
                  participantesPendientes={pendientes.map(p => ({
                    id: p.id,
                    userName: p.user.name ?? 'Alumno',
                  }))}
                />
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-500">Inicia sesión para unirte o postular</p>
                  <a
                    href="/login"
                    className="block w-full py-2.5 bg-violet-600 text-white text-center rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                  >
                    Iniciar Sesión
                  </a>
                </div>
              )}

              {/* Pricing table for alumno_crea public */}
              {sala.tipo === 'alumno_crea' && sala.privacidad === 'publica' && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">💰 Precio según participantes</p>
                  <div className="space-y-1">
                    {([2,3,4,5,6,7] as const).map(n => (
                      <div key={n} className={`flex justify-between text-xs rounded-lg px-2 py-1 ${confirmados.length + 1 === n ? 'bg-violet-50 font-semibold text-violet-700' : 'text-gray-500'}`}>
                        <span>{n} personas</span>
                        <span>{formatPrice(getSalaPrecio(n))}/hr</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
