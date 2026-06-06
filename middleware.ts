import { NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = ['/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  if (!token && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAuthRoute) {
    const feedUrl = request.nextUrl.clone()
    feedUrl.pathname = '/feed'
    return NextResponse.redirect(feedUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
}
