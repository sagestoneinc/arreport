import { TelegramMessage } from './taskTypes';

/**
 * Parses a Telegram message to extract task description.
 * Supports formats:
 * - @botname - task description
 * - @botname task description
 * - /task task description
 * - /task@botname task description (group chat format)
 * - /todo task description
 * - /todo@botname task description (group chat format)
 * - Forwarded messages (uses the forwarded message text as task)
 * - Forwarded images (uses the caption as task)
 */
export function parseTaskFromMessage(
  message: TelegramMessage,
  botUsername?: string
): string | null {
  // Handle forwarded messages - use the forwarded text or caption as the task description
  if (message.forward_from || message.forward_from_chat) {
    // Check for text first
    if (message.text && message.text.trim()) {
      return message.text.trim();
    }
    // Check for caption (for forwarded images/media)
    if (message.caption && message.caption.trim()) {
      return message.caption.trim();
    }
    // Forwarded photo without caption - create a generic task description
    if (message.photo && message.photo.length > 0) {
      return '[Forwarded Image]';
    }
    return null;
  }

  if (!message.text) {
    return null;
  }

  const text = message.text.trim();
  if (!text) {
    return null;
  }

  // Command format: /task or /todo (also handles /task@botname format in groups)
  const taskCommandMatch = text.match(/^\/task(?:@[\w-]+)?\s+(.+)/i);
  if (taskCommandMatch) {
    return taskCommandMatch[1].trim() || null;
  }

  const todoCommandMatch = text.match(/^\/todo(?:@[\w-]+)?\s+(.+)/i);
  if (todoCommandMatch) {
    return todoCommandMatch[1].trim() || null;
  }

  // Mention format: @botname - task or @botname task
  if (botUsername) {
    const mentionPattern = new RegExp(`^@${botUsername}(?:\\s*-\\s*|\\s+)(.+)`, 'i');
    const match = text.match(mentionPattern);
    if (match && match[1]) {
      return match[1].trim() || null;
    }
  }

  return null;
}

/**
 * Checks if the message is an /opentask command
 */
export function isOpenTaskCommand(message: TelegramMessage): boolean {
  if (!message.text) {
    return false;
  }
  const text = message.text.trim();
  // Match /opentask or /opentask@botname (case insensitive)
  return /^\/opentask(?:@[\w-]+)?$/i.test(text);
}

/**
 * Checks if the message is a /done command and extracts the task reference
 * Formats:
 * - /done <task_number> - marks task by number (1-indexed from open task list)
 * - /done <partial_description> - marks task by matching description
 * 
 * Note: Numbers with leading zeros (e.g., "007") are treated as text, not numbers.
 * This is intentional to allow searching for task descriptions containing numbers.
 */
export function parseDoneCommand(message: TelegramMessage): { type: 'number'; value: number } | { type: 'text'; value: string } | null {
  if (!message.text) {
    return null;
  }
  const text = message.text.trim();
  // Match /done or /done@botname followed by argument
  const match = text.match(/^\/done(?:@[\w-]+)?\s+(.+)/i);
  if (!match) {
    return null;
  }
  
  const arg = match[1].trim();
  // Check if it's a positive integer (strict check: no leading zeros, no decimals)
  // Leading zeros are treated as text to allow searching for "007" etc.
  const num = parseInt(arg, 10);
  if (!isNaN(num) && num > 0 && num.toString() === arg) {
    return { type: 'number', value: num };
  }
  
  // Otherwise treat as text description to match
  return { type: 'text', value: arg };
}

/**
 * Determines if a bot should reply to the message.
 * Only replies for /task, /todo commands, or mentions with explicit "-"
 * Does not reply to forwarded messages to avoid spam
 */
export function shouldReply(message: TelegramMessage, botUsername?: string): boolean {
  // Don't reply to forwarded messages
  if (message.forward_from || message.forward_from_chat) {
    return false;
  }

  if (!message.text) {
    return false;
  }

  const text = message.text.trim();

  // Always reply to commands (handles /task and /task@botname formats)
  const commandPattern = /^\/(?:task|todo)(?:@[\w-]+)?\s+.+/i;
  if (commandPattern.test(text)) {
    return true;
  }

  // Reply to mentions with explicit "-"
  if (botUsername) {
    const mentionWithDash = new RegExp(`^@${botUsername}\\s*-\\s*.+`, 'i');
    if (mentionWithDash.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Simple in-memory rate limiter to prevent loops
 */
class RateLimiter {
  private records: Map<string, number[]> = new Map();
  private maxRequests = 5;
  private windowMs = 60000; // 1 minute

  canProceed(chatId: string): boolean {
    const now = Date.now();
    const chatRecords = this.records.get(chatId) || [];

    // Remove old records
    const recentRecords = chatRecords.filter((timestamp) => now - timestamp < this.windowMs);

    if (recentRecords.length >= this.maxRequests) {
      return false;
    }

    recentRecords.push(now);
    this.records.set(chatId, recentRecords);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
