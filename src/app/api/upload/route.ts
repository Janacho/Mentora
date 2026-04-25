import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'tutor') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
  }

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Solo se permiten archivos PDF o imágenes (JPG, PNG, WEBP).' },
      { status: 400 }
    )
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'El archivo no puede superar 20MB.' },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'material')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = join(uploadsDir, filename)

  await writeFile(filepath, buffer)

  return NextResponse.json({ url: `/uploads/material/${filename}` })
}
