import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, botToken, chatId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use provided credentials or fall back to environment variables
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || process.env. TELEGRAM_CHAT_ID;

    if (!token || !chat) {
      return NextResponse.json(
        {
          error: 
            'Bot token and chat ID are required. Either provide them in the request or set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.',
        },
        { status: 400 }
      );
    }

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chat,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const telegramData = await telegramResponse. json();

    if (!telegramResponse.ok) {
      return NextResponse.json(
        {
          error: telegramData. description || 'Failed to send message to Telegram',
          details: telegramData,
        },
        { status:  telegramResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: telegramData,
    });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}