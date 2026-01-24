import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, SESSION_COOKIE_NAME, isAuthEnabled } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // If auth is disabled, just return success
    if (!isAuthEnabled()) {
      return NextResponse.json({ ok: true });
    }

    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      deleteSession(sessionId);
    }

    // Clear the session cookie
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
