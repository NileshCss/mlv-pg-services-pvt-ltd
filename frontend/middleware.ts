import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    await updateSession()
  } catch (error) {
    // Log error but don't break the middleware chain
    // Some errors are expected (e.g., no session, expired cookies)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Middleware session update:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.html).*)',
  ],
}
