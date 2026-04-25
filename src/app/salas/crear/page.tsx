import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CrearSalaForm from './CrearSalaForm'

export default async function CrearSalaPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tutoresAprobados = await db.tutorProfile.findMany({
    where: { estado: 'aprobado' },
    include: { user: true },
    orderBy: [{ calificacion: 'desc' }],
  })

  const tutorOptions = tutoresAprobados.map(t => ({
    id: t.id,
    nombre: t.nombreCompleto || t.user?.name || 'Tutor',
    carrera: t.carrera,
    calificacion: t.calificacion ?? 0,
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏫 Crear Sala de Clase Grupal</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Organiza una clase con otros alumnos y comparte el costo del tutor
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <CrearSalaForm
            tutoresAprobados={tutorOptions}
            userRole={session.role as string ?? 'alumno'}
          />
        </div>
      </div>
    </div>
  )
}
