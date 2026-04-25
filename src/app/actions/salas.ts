'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createSala(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión.' }

  const tipo = formData.get('tipo') as string
  const ramo = (formData.get('ramo') as string)?.trim()
  const modalidad = formData.get('modalidad') as string
  const privacidad = (formData.get('privacidad') as string) ?? 'publica'
  const cuposMaxRaw = formData.get('cuposMax')
  const cuposMax = cuposMaxRaw ? parseInt(cuposMaxRaw as string) : 7
  const precioBaseRaw = formData.get('precioBase')
  const precioBase = precioBaseRaw ? parseInt(precioBaseRaw as string) : undefined
  const ubicacion = (formData.get('ubicacion') as string) ?? undefined
  const fechaClaseRaw = formData.get('fechaClase') as string
  const horaInicio = (formData.get('horaInicio') as string) ?? undefined
  const fechaLimiteRaw = formData.get('fechaLimite') as string
  const descripcion = (formData.get('descripcion') as string) ?? undefined
  const tutorSolicitadoId = (formData.get('tutorSolicitadoId') as string) || undefined

  if (!ramo) return { error: 'El ramo es obligatorio.' }
  if (!modalidad) return { error: 'La modalidad es obligatoria.' }

  const sala = await db.sala.create({
    data: {
      tipo,
      ramo,
      modalidad,
      privacidad,
      cuposMax,
      precioBase: precioBase ?? null,
      ubicacion: ubicacion ?? null,
      fechaClase: fechaClaseRaw ? new Date(fechaClaseRaw) : null,
      horaInicio: horaInicio ?? null,
      fechaLimite: fechaLimiteRaw ? new Date(fechaLimiteRaw) : null,
      descripcion: descripcion ?? null,
      creadorId: session.userId as string,
      tutorSolicitadoId: tutorSolicitadoId ?? null,
    },
  })

  // If tutor creates the sala, they are auto-assigned
  if (tipo === 'tutor_crea') {
    const tutorProfile = await db.tutorProfile.findUnique({
      where: { userId: session.userId as string },
    })
    if (tutorProfile) {
      await db.sala.update({
        where: { id: sala.id },
        data: { tutorAsignadoId: tutorProfile.id },
      })
    }
  }

  // Auto-add creator as first participant (for alumno_crea)
  if (tipo === 'alumno_crea') {
    await db.salaParticipante.create({
      data: {
        salaId: sala.id,
        userId: session.userId as string,
        estado: 'confirmado',
      },
    })
  }

  revalidatePath('/salas')
  return { success: true, salaId: sala.id }
}

export async function joinSala(salaId: string) {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión.' }

  const sala = await db.sala.findUnique({
    where: { id: salaId },
    include: { participantes: true },
  })
  if (!sala) return { error: 'Sala no encontrada.' }
  if (sala.estado !== 'abierta') return { error: 'La sala no está abierta.' }

  const confirmed = sala.participantes.filter(p => p.estado === 'confirmado').length
  if (confirmed >= sala.cuposMax) return { error: 'La sala está completa.' }

  const existing = sala.participantes.find(p => p.userId === session.userId)
  if (existing) return { error: 'Ya solicitaste unirte a esta sala.' }

  await db.salaParticipante.create({
    data: {
      salaId,
      userId: session.userId as string,
      estado: 'pendiente',
    },
  })

  revalidatePath(`/salas/${salaId}`)
  return { success: true }
}

export async function postularSala(salaId: string, mensaje?: string) {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión.' }

  const tutorProfile = await db.tutorProfile.findUnique({
    where: { userId: session.userId as string },
  })
  if (!tutorProfile) return { error: 'Solo tutores pueden postular a salas.' }
  if (tutorProfile.estado !== 'aprobado') return { error: 'Tu perfil de tutor no está aprobado.' }

  const sala = await db.sala.findUnique({ where: { id: salaId } })
  if (!sala) return { error: 'Sala no encontrada.' }
  if (sala.tutorAsignadoId) return { error: 'La sala ya tiene tutor asignado.' }

  const existing = await db.salaPostulacion.findFirst({
    where: { salaId, tutorProfileId: tutorProfile.id },
  })
  if (existing) return { error: 'Ya postulaste a esta sala.' }

  await db.salaPostulacion.create({
    data: {
      salaId,
      tutorProfileId: tutorProfile.id,
      mensaje: mensaje ?? null,
    },
  })

  revalidatePath(`/salas/${salaId}`)
  return { success: true }
}

export async function aceptarPostulacion(postulacionId: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado.' }

  const postulacion = await db.salaPostulacion.findUnique({
    where: { id: postulacionId },
    include: { sala: true },
  })
  if (!postulacion) return { error: 'Postulación no encontrada.' }
  if (postulacion.sala.creadorId !== session.userId) return { error: 'No autorizado.' }

  await db.salaPostulacion.update({
    where: { id: postulacionId },
    data: { estado: 'aceptada' },
  })
  await db.sala.update({
    where: { id: postulacion.salaId },
    data: { tutorAsignadoId: postulacion.tutorProfileId },
  })
  // Reject other postulaciones
  await db.salaPostulacion.updateMany({
    where: { salaId: postulacion.salaId, id: { not: postulacionId } },
    data: { estado: 'rechazada' },
  })

  revalidatePath(`/salas/${postulacion.salaId}`)
  return { success: true }
}

export async function aceptarParticipante(participanteId: string, aceptar: boolean) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado.' }

  const participante = await db.salaParticipante.findUnique({
    where: { id: participanteId },
    include: { sala: { include: { tutorAsignado: true } } },
  })
  if (!participante) return { error: 'Participante no encontrado.' }

  // Only the tutor assigned or the sala creator can accept
  const isTutor = participante.sala.tutorAsignado?.userId === session.userId
  const isCreador = participante.sala.creadorId === session.userId
  if (!isTutor && !isCreador) return { error: 'No autorizado.' }

  await db.salaParticipante.update({
    where: { id: participanteId },
    data: { estado: aceptar ? 'confirmado' : 'rechazado' },
  })

  // Check if sala is now complete
  if (aceptar) {
    const sala = await db.sala.findUnique({
      where: { id: participante.salaId },
      include: { participantes: true },
    })
    if (sala) {
      const confirmed = sala.participantes.filter(p => p.estado === 'confirmado').length
      if (confirmed >= sala.cuposMax) {
        await db.sala.update({ where: { id: sala.id }, data: { estado: 'completa' } })
      }
    }
  }

  revalidatePath(`/salas/${participante.salaId}`)
  return { success: true }
}

export async function cancelarSala(salaId: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado.' }

  const sala = await db.sala.findUnique({ where: { id: salaId } })
  if (!sala) return { error: 'Sala no encontrada.' }
  if (sala.creadorId !== session.userId) return { error: 'Solo el creador puede cancelar la sala.' }

  await db.sala.update({ where: { id: salaId }, data: { estado: 'cancelada' } })
  revalidatePath('/salas')
  revalidatePath(`/salas/${salaId}`)
  return { success: true }
}
