import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  await db.user.update({
    where: { id: session.userId },
    data: { paymentConfigured: true },
  })
  return NextResponse.json({ success: true })
}
