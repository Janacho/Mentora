'use server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitTutorApplication(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const universidad = formData.get('universidad') as string
  const carrera = formData.get('carrera') as string
  const anioIngreso = parseInt(formData.get('anioIngreso') as string)
  const precioPorHora = parseInt(formData.get('precioPorHora') as string)
  const modalidad = formData.get('modalidad') as string
  const certificadoUrl = formData.get('certificadoUrl') as string || null

  // Parse ramos from JSON string
  const ramosJson = formData.get('ramos') as string
  const ramos = JSON.parse(ramosJson || '[]')

  // Check if user exists
  let user = await db.user.findUnique({ where: { email } })
  if (!user) {
    const { hashPassword } = await import('@/lib/auth')
    const tempPassword = await hashPassword(Math.random().toString(36).slice(-8))
    user = await db.user.create({
      data: { name: nombre, email, password: tempPassword, role: 'tutor' }
    })
  } else {
    await db.user.update({ where: { id: user.id }, data: { role: 'tutor' } })
  }

  const existing = await db.tutorProfile.findUnique({ where: { userId: user.id } })
  if (existing) return { error: 'Ya existe una postulación con este email' }

  const profile = await db.tutorProfile.create({
    data: {
      userId: user.id,
      nombreCompleto: nombre,
      universidad,
      carrera,
      anioIngreso,
      precioPorHora,
      modalidad,
      certificadoUrl,
      estado: 'pendiente',
    }
  })

  for (const ramo of ramos) {
    await db.tutorRamo.create({
      data: {
        tutorId: profile.id,
        nombreRamo: ramo.nombreRamo,
        nota: parseFloat(ramo.nota),
        profesor: ramo.profesor,
        anio: parseInt(ramo.anio),
        semestre: parseInt(ramo.semestre),
        fueAyudante: ramo.fueAyudante === true || ramo.fueAyudante === 'true',
        materialDisp: JSON.stringify(ramo.materialDisp || []),
      }
    })
  }

  return { success: true }
}

export async function approveTutor(tutorId: string, mensaje?: string) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'No autorizado' }

  await db.tutorProfile.update({
    where: { id: tutorId },
    data: { estado: 'aprobado', mensajeAdmin: mensaje }
  })
  revalidatePath('/admin')
  return { success: true }
}

export async function rejectTutor(tutorId: string, mensaje: string) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'No autorizado' }

  await db.tutorProfile.update({
    where: { id: tutorId },
    data: { estado: 'rechazado', mensajeAdmin: mensaje }
  })
  revalidatePath('/admin')
  return { success: true }
}

export async function submitReview(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión' }

  const tutorId = formData.get('tutorId') as string
  const ramo = formData.get('ramo') as string
  const profesor = formData.get('profesor') as string
  const calificacion = parseInt(formData.get('calificacion') as string)
  const texto = formData.get('texto') as string

  await db.review.create({
    data: { alumnoId: session.userId, tutorId, ramo, profesor, calificacion, texto }
  })

  // Update tutor rating
  const reviews = await db.review.findMany({ where: { tutorId } })
  const avg = reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length
  await db.tutorProfile.update({
    where: { id: tutorId },
    data: { calificacion: avg, totalResenas: reviews.length }
  })

  revalidatePath(`/tutores/${tutorId}`)
  return { success: true }
}

export async function addMaterial(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'tutor') return { error: 'No autorizado' }

  const tutor = await db.tutorProfile.findUnique({ where: { userId: session.userId } })
  if (!tutor) return { error: 'Perfil no encontrado' }

  const nombre     = formData.get('nombre')     as string
  const ramo       = formData.get('ramo')       as string
  const tipo       = formData.get('tipo')       as string
  const precio     = parseInt(formData.get('precio') as string)
  const archivoUrl = (formData.get('archivoUrl') as string) || null

  await db.materialItem.create({
    data: {
      tutorUserId: session.userId,
      nombre, ramo, tipo, precio,
      universidad: tutor.universidad,
      archivoUrl,
    }
  })

  revalidatePath('/dashboard/tutor')
  revalidatePath('/material')
  return { success: true }
}
