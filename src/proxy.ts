import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, type JWTPayload } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'mentora-secret-key-change-in-production'
)

const protectedRoutes = ['/dashboard', '/perfil']
const adminRoutes     = ['/admin']
const authRoutes      = ['/login', '/registro', '/postulacion']

interface SessionPayload extends JWTPayload {
  role?: string
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('session')?.value

  let session: SessionPayload | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify<SessionPayload>(token, SECRET)
      session = payload
    } catch {
      session = null
    }
  }

  // Admin routes protection
  if (adminRoutes.some(r => pathname.startsWith(r)) && pathname !== '/admin/login') {
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protected routes (require any login)
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (authRoutes.some(r => pathname.startsWith(r)) && session) {
    const role = session.role
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url))
    if (role === 'tutor') return NextResponse.redirect(new URL('/dashboard/tutor', req.url))
    return NextResponse.redirect(new URL('/dashboard/alumno', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
