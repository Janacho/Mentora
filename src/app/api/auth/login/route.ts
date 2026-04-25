import { NextRequest, NextResponse } from 'next/server'
import { loginUser, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = await loginUser(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }
  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? undefined,
  })
  return NextResponse.json({ success: true, role: user.role })
}
