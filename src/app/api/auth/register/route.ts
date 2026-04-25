import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password, universidad, carrera, anioActual } = await req.json()

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 })
  }

  const hashed = await hashPassword(password)
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'alumno',
      universidad,
      carrera,
      anioActual: parseInt(anioActual),
    },
  })

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? undefined,
  })

  return NextResponse.json({ success: true })
}
