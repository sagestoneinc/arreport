import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/auditStorage';
import { CreateAuditLogParams } from '@/lib/auditTypes';
import { getSession, SESSION_COOKIE_NAME, isAuthEnabled } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    let userEmail: string | null = null;
    let userId: string | null = null;

    if (isAuthEnabled()) {
      const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (sessionId) {
        const session = getSession(sessionId);
        if (session) {
          userEmail = session.user.email;
          userId = session.user.id;
        }
      }
    }

    const body = await request.json();
    const {
      action_type,
      report_slug,
      report_title,
      telegram_chat_id,
      telegram_chat_title,
      telegram_payload,
      status,
      error_message,
      metadata
    } = body;

    if (!action_type || !status) {
      return NextResponse.json(
        { ok: false, error: 'action_type and status are required' },
        { status: 400 }
      );
    }

    // For SEND_TELEGRAM, get chat ID from server environment if not provided
    let chatId = telegram_chat_id;
    if (action_type === 'SEND_TELEGRAM' && !chatId) {
      chatId = process.env.TELEGRAM_CHAT_ID || 'configured';
    }

    const params: CreateAuditLogParams = {
      user_id: userId,
      user_email: userEmail,
      action_type,
      report_slug,
      report_title,
      telegram_chat_id: chatId,
      telegram_chat_title,
      telegram_payload,
      status,
      error_message,
      metadata
    };

    const entry = await createAuditLog(params);

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    console.error('Audit log error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
