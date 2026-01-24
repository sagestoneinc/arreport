import { NextRequest, NextResponse } from 'next/server';
import { TelegramUpdate, Task } from '@/lib/taskTypes';
import { parseTaskFromMessage, shouldReply, rateLimiter } from '@/lib/taskParser';
import { getTaskStorage } from '@/lib/taskStorage';

export const dynamic = 'force-dynamic';

// Track last invalid token log to reduce noise
let lastInvalidTokenLog = 0;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secretToken = request.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error('TELEGRAM_WEBHOOK_SECRET not configured');
      return NextResponse.json({ ok: false, error: 'Webhook not configured' }, { status: 500 });
    }

    if (secretToken !== expectedSecret) {
      // Don't log every invalid attempt to reduce noise - these are expected from unauthorized sources
      // Only log once per minute to avoid spam
      const now = Date.now();
      if (now - lastInvalidTokenLog > 60000) {
        console.warn('[Webhook] Unauthorized webhook attempt detected');
        lastInvalidTokenLog = now;
      }
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse Telegram update
    const update: TelegramUpdate = await request.json();

    // Handle both message and edited_message
    const message = update.message || update.edited_message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    // Check rate limit
    const chatId = message.chat.id.toString();
    if (!rateLimiter.canProceed(chatId)) {
      console.log(`Rate limit exceeded for chat ${chatId}`);
      return NextResponse.json({ ok: true });
    }

    // Initialize storage and ensure schema is created
    const storage = getTaskStorage();
    try {
      await storage.initialize();
    } catch (initError) {
      console.error('Failed to initialize storage:', initError);
      return NextResponse.json({ ok: true });
    }

    // Parse task from message
    const botUsername = process.env.BOT_USERNAME;
    const parsedTask = parseTaskFromMessage(message, botUsername);

    if (!parsedTask) {
      return NextResponse.json({ ok: true });
    }

    // Save or update task
    const isEdited = !!update.edited_message;
    const messageId = message.message_id;
    const userName = message.from
      ? [message.from.first_name, message.from.last_name].filter(Boolean).join(' ')
      : undefined;
    const createdBy = message.from?.username || userName || 'unknown';

    try {
      if (isEdited && (await storage.taskExists(chatId, messageId))) {
        // Update existing task
        await storage.updateTask(chatId, messageId, parsedTask.title, parsedTask.description, message.text || '');
        console.log(`Updated task from message ${messageId} in chat ${chatId}`);
      } else if (!(await storage.taskExists(chatId, messageId))) {
        // Check for duplicate open task with same title
        const duplicateTask = await storage.findDuplicateOpenTask(parsedTask.title);
        
        if (duplicateTask && shouldReply(message, botUsername)) {
          // Send duplicate warning
          await sendDuplicateWarning(chatId, messageId, duplicateTask);
          return NextResponse.json({ ok: true });
        }

        // Save new task
        const task = await storage.saveTask({
          title: parsedTask.title,
          description: parsedTask.description,
          source: 'telegram',
          created_by: createdBy,
          chat_id: chatId,
          chat_title: message.chat.title,
          message_id: messageId,
          user_id: message.from?.id.toString() || 'unknown',
          username: message.from?.username,
          name: userName,
          raw_text: message.text || '',
        });

        console.log(`Saved new task: ${task.id}`);

        // Send confirmation reply if appropriate
        if (shouldReply(message, botUsername)) {
          await sendTelegramReply(chatId, messageId, task);
        }
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Return ok:true to prevent Telegram from retrying
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: true });
  }
}

async function sendTelegramReply(
  chatId: string,
  messageId: number,
  task: Task
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const baseUrl = process.env.APP_BASE_URL;
    const tasksUrl = baseUrl ? `${baseUrl}/tasks` : null;

    let replyText = `✅ Task saved: ${task.title}\n🕒 Status: Open`;
    if (tasksUrl) {
      replyText += `\n\n🔗 View tasks: ${tasksUrl}`;
    }

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        reply_to_message_id: messageId,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Failed to send Telegram reply:', data);
    }
  } catch (error) {
    console.error('Error sending Telegram reply:', error);
  }
}

async function sendDuplicateWarning(
  chatId: string,
  messageId: number,
  existingTask: Task
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const baseUrl = process.env.APP_BASE_URL;
    const tasksUrl = baseUrl ? `${baseUrl}/tasks` : null;

    let replyText = `⚠️ Task already exists and is still open:\n"${existingTask.title}"`;
    if (tasksUrl) {
      replyText += `\n\n🔗 View tasks: ${tasksUrl}`;
    }

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        reply_to_message_id: messageId,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Failed to send Telegram duplicate warning:', data);
    }
  } catch (error) {
    console.error('Error sending Telegram duplicate warning:', error);
  }
}
