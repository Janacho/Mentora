import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { PUNTOS_REGLAS } from '@/lib/utils'
import ProfileWidgetClient from './ProfileWidgetClient'

export default async function ProfileWidget() {
  const session = await getSession()
  if (!session) return null

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      reviews:             { select: { id: true } },
      purchases:           { select: { id: true } },
      materialItems:       { include: { purchases: { select: { id: true } } } },
      salaParticipaciones: { where: { estado: 'confirmado' }, select: { id: true } },
      tutorProfile: {
        include: {
          reviews:        { select: { calificacion: true } },
          salasAsignadas: { select: { id: true } },
        },
      },
    },
  })

  if (!user) return null

  // Compute Puntos Mentora
  let puntos = 0
  puntos += user.reviews.length             * PUNTOS_REGLAS.reviewDada
  puntos += user.salaParticipaciones.length  * PUNTOS_REGLAS.salaConfirmada
  puntos += user.purchases.length           * PUNTOS_REGLAS.materialComprado

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

  const salasActivas = user.salaParticipaciones.length
  const reviewsDadas = user.reviews.length
  const materialCount = user.tutorProfile
    ? user.materialItems.length
    : user.purchases.length

  return (
    <ProfileWidgetClient
      name={user.name ?? 'Usuario'}
      email={user.email}
      role={user.role}
      universidad={user.universidad}
      carrera={user.carrera}
      puntos={puntos}
      stats={{ salasActivas, reviewsDadas, materialCount }}
    />
  )
}
