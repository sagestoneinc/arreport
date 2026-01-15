import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatId } = body;

    if (!message) {
      return NextResponse.json({ ok: false, error: 'Message is required' }, { status: 400 });
    }

    // Use provided chat ID or fall back to environment variable
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: 'TELEGRAM_BOT_TOKEN environment variable is not set.',
        },
        { status: 400 }
      );
    }

    if (!chat) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Chat ID is required. Either provide it in the request or set TELEGRAM_CHAT_ID environment variable.',
        },
        { status: 400 }
      );
    }

    // Send message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
      }),
    });

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: telegramData.description || 'Failed to send message to Telegram',
        },
        { status: telegramResponse.status }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
