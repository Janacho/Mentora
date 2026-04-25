'use server'
import { db } from '@/lib/db'
import { createSession, deleteSession, hashPassword, loginUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function registerAlumno(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const universidad = formData.get('universidad') as string
  const carrera = formData.get('carrera') as string
  const anioActual = parseInt(formData.get('anioActual') as string)

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: 'Este email ya está registrado' }

  const hashed = await hashPassword(password)
  const user = await db.user.create({
    data: { name, email, password: hashed, role: 'alumno', universidad, carrera, anioActual }
  })

  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name ?? undefined })
  return { success: true }
}

export async function loginAction(email: string, password: string) {
  const user = await loginUser(email, password)
  if (!user) return { error: 'Credenciales incorrectas' }

  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name ?? undefined })
  return { success: true, role: user.role }
}

export async function logoutAction() {
  await deleteSession()
  redirect('/')
}

export async function configurePayment() {
  // In production, integrate with payment provider
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'No autenticado' }

  await db.user.update({
    where: { id: session.userId },
    data: { paymentConfigured: true }
  })
  revalidatePath('/dashboard/alumno')
  return { success: true }
}

export async function adminLogin(email: string, password: string) {
  const { hashPassword: hp } = await import('@/lib/auth')
  const admin = await db.adminUser.findUnique({ where: { email } })
  if (!admin) return { error: 'Credenciales incorrectas' }

  const bcrypt = await import('bcryptjs')
  const valid = await bcrypt.default.compare(password, admin.password)
  if (!valid) return { error: 'Credenciales incorrectas' }

  await createSession({ userId: admin.id, email: admin.email, role: 'admin', name: 'Admin' })
  return { success: true }
}
