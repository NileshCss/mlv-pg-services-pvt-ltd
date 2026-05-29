import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── Refresh Supabase session cookies ─────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined

  // ── Route: /student/* — requires authenticated student ───────────────────
  if (pathname.startsWith('/student/') || pathname === '/student') {
    if (!user) {
      return NextResponse.redirect(new URL('/student-login', request.url))
    }
    if (role !== 'student') {
      // Logged in but not a student (e.g. admin) — redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // ── Route: /student-login — redirect if already logged in as student ─────
  if (pathname === '/student-login') {
    if (user && role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    return response
  }

  // ── Route: /admin/* (except /admin/login) — requires authenticated user ──
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.html|.*\\.xml|.*\\.txt).*)',
  ],
}
