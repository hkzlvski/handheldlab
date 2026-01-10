// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const protectedRoutes = ['/submit', '/profile']
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = pathname.startsWith('/admin')

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAdminRoute) {
    if (!user) return new NextResponse(null, { status: 404 })

    const { data: isAdmin } = await supabase.rpc('is_user_admin')
    if (!isAdmin) return new NextResponse(null, { status: 404 })
  }

  return response
}

export const config = {
  matcher: ['/submit/:path*', '/profile/:path*', '/admin/:path*'],
}
