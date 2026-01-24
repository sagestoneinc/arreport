import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession, SESSION_COOKIE_NAME, isAuthEnabled } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // If auth is disabled, return success
    if (!isAuthEnabled()) {
      return NextResponse.json({ ok: true, message: 'Auth disabled' });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authenticateUser(email, password);

    if (!authResult.ok || !authResult.user) {
      return NextResponse.json(
        { ok: false, error: authResult.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = createSession(authResult.user);

    // Set session cookie
    const response = NextResponse.json({
      ok: true,
      user: {
        email: authResult.user.email,
        name: authResult.user.name,
        role: authResult.user.role
      }
    });

    // Set httpOnly cookie for session
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
