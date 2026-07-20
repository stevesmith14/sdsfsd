import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't need auth
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  // If there's no auth token and the user is trying to access a protected route
  if (!token && !isPublicRoute) {
    if (pathname.startsWith('/api')) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user has a token and is trying to access auth pages
  // Only redirect away from login/signup, NOT from forgot/reset password pages
  const isLoginOrSignup = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup');

  if (token && isLoginOrSignup && !pathname.startsWith('/api')) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
   
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
