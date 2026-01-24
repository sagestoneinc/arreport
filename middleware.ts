import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'ar_session';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/api/auth'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/reports', '/tasks', '/history', '/audit'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and other special paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if auth is disabled via environment variable
  // Note: Environment variables in middleware need to be edge-compatible
  const authEnabled = process.env.AUTH_ENABLED !== 'false';

  if (!authEnabled) {
    return NextResponse.next();
  }

  // Check if this is a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if this is the home page - allow access for better UX
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionId) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes under protected paths, return 401 if not authenticated
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const isProtectedApi = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(`/api${route}`)
    );
    
    if (isProtectedApi && !sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
