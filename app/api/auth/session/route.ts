import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE_NAME, isAuthEnabled } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // If auth is disabled, return a mock user
    if (!isAuthEnabled()) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        user: {
          email: 'user@arreport.com',
          name: 'User',
          role: 'user'
        }
      });
    }

    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json({
        ok: true,
        authenticated: false
      });
    }

    const session = getSession(sessionId);

    if (!session) {
      // Session expired or invalid
      const response = NextResponse.json({
        ok: true,
        authenticated: false
      });
      
      // Clear the invalid cookie
      response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
