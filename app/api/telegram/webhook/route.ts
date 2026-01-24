import { NextRequest, NextResponse } from 'next/server';
import { TelegramUpdate, Task } from '@/lib/taskTypes';
import { parseTaskFromMessage, shouldReply, rateLimiter, isOpenTaskCommand, parseDoneCommand, isHelpCommand, isStartCommand } from '@/lib/taskParser';
import { getTaskStorage } from '@/lib/taskStorage';
import { createAuditLog } from '@/lib/auditStorage';

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

    const botUsername = process.env.BOT_USERNAME;

    // Handle /help command
    if (isHelpCommand(message)) {
      await handleHelpCommand(chatId, message.message_id);
      return NextResponse.json({ ok: true });
    }

    // Handle /start command
    if (isStartCommand(message)) {
      await handleStartCommand(chatId, message.message_id);
      return NextResponse.json({ ok: true });
    }

    // Handle /opentask command
    if (isOpenTaskCommand(message)) {
      await handleOpenTaskCommand(chatId, message.message_id);
      return NextResponse.json({ ok: true });
    }

    // Handle /done command
    const doneCommand = parseDoneCommand(message);
    if (doneCommand) {
      await handleDoneCommand(chatId, message.message_id, doneCommand);
      return NextResponse.json({ ok: true });
    }

    // Parse task from message
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
        await storage.updateTask(chatId, messageId, parsedTask.title, parsedTask.description, message.text || message.caption || '');
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
          name: message.from
            ? [message.from.first_name, message.from.last_name].filter(Boolean).join(' ')
            : undefined,
          raw_text: message.text || message.caption || '',
        });

        console.log(`Saved new task: ${task.id}`);
        
        // Log to audit
        try {
          await createAuditLog({
            user_email: createdBy,
            action_type: 'TASK_CREATE',
            telegram_chat_id: chatId,
            telegram_chat_title: message.chat.title || undefined,
            status: 'SUCCESS',
            metadata: { taskId: task.id, taskTitle: task.title }
          });
        } catch (auditError) {
          console.error('Failed to write audit log:', auditError);
        }

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

async function handleOpenTaskCommand(chatId: string, messageId: number): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    const storage = getTaskStorage();
    const tasks = await storage.getTasks({ status: 'open', chat_id: chatId });

    let replyText: string;
    if (tasks.length === 0) {
      replyText = '📋 No open tasks found in this chat.';
    } else {
      const taskLines = tasks.map((task, index) => `${index + 1}. ${task.description}`);
      replyText = `📋 Open Tasks (${tasks.length}):\n\n${taskLines.join('\n')}\n\n💡 Use /done <number> to mark a task as completed.`;
    }

    await sendTelegramMessage(chatId, messageId, replyText);
  } catch (error) {
    console.error('Error handling /opentask command:', error);
    await sendTelegramMessage(chatId, messageId, '❌ Failed to fetch open tasks.');
  }
}

async function handleDoneCommand(
  chatId: string,
  messageId: number,
  command: { type: 'number'; value: number } | { type: 'text'; value: string }
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    const storage = getTaskStorage();
    const openTasks = await storage.getTasks({ status: 'open', chat_id: chatId });

    if (openTasks.length === 0) {
      await sendTelegramMessage(chatId, messageId, '📋 No open tasks to mark as done.');
      return;
    }

    let taskToComplete;
    if (command.type === 'number') {
      // Mark by task number (1-indexed)
      const taskIndex = command.value - 1;
      if (taskIndex < 0 || taskIndex >= openTasks.length) {
        await sendTelegramMessage(
          chatId,
          messageId,
          `❌ Invalid task number. Please use a number between 1 and ${openTasks.length}.`
        );
        return;
      }
      taskToComplete = openTasks[taskIndex];
    } else {
      // Match by partial description (case-insensitive)
      const searchText = command.value.toLowerCase();
      taskToComplete = openTasks.find((task) =>
        task.description?.toLowerCase().includes(searchText)
      );
      if (!taskToComplete) {
        await sendTelegramMessage(
          chatId,
          messageId,
          `❌ No open task found matching "${command.value}".`
        );
        return;
      }
    }

    const success = await storage.updateTaskStatus(taskToComplete.id, 'done');
    if (success) {
      await sendTelegramMessage(
        chatId,
        messageId,
        `✅ Task completed: ${taskToComplete.description}`
      );
    } else {
      await sendTelegramMessage(chatId, messageId, '❌ Failed to update task status.');
    }
  } catch (error) {
    console.error('Error handling /done command:', error);
    await sendTelegramMessage(chatId, messageId, '❌ Failed to mark task as done.');
  }
}

async function sendTelegramMessage(
  chatId: string,
  replyToMessageId: number,
  text: string
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_to_message_id: replyToMessageId,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Failed to send Telegram message:', data);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
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
        disable_web_page_preview: true,
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

async function handleHelpCommand(chatId: string, messageId: number): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  const baseUrl = process.env.APP_BASE_URL || 'https://arreport.jesscura.com';
  
  const helpText = `🤖 *AR Report Bot — Help*

📝 *Task Commands*
• /task <text> — Create a new task
• /todo <text> — Same as /task
• /opentask — List all open tasks
• /done <number> — Mark task as done by number
• /done <text> — Mark task as done by description

💬 *Quick Actions*
• @botname - <text> — Create task with dash separator
• Forward a message — Auto-creates a task

📊 *Other Commands*
• /help — Show this help menu
• /start — Welcome message

🔗 *Web Dashboard*
${baseUrl}/tasks — View & manage all tasks
${baseUrl}/audit — View activity log

💡 Tasks are deduplicated — duplicate open tasks are rejected.`;

  await sendTelegramMessage(chatId, messageId, helpText);
}

async function handleStartCommand(chatId: string, messageId: number): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  const baseUrl = process.env.APP_BASE_URL || 'https://arreport.jesscura.com';
  
  const welcomeText = `👋 *Welcome to AR Report Bot!*

I help you manage tasks and track reports.

🚀 *Quick Start:*
• Type /task Buy groceries to create a task
• Type /opentask to see all open tasks
• Type /done 1 to complete task #1

📱 *Web Dashboard:*
${baseUrl}

Type /help for all commands.`;

  await sendTelegramMessage(chatId, messageId, welcomeText);
}
