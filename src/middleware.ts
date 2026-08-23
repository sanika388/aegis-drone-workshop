import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('aegis_admin_session')?.value;

    // If no valid session cookie is present, redirect to the login terminal
    if (!adminToken || adminToken !== 'authenticated') {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('role', 'admin');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};