import { TelegramMessage } from './taskTypes';

/**
 * Result of parsing a task from a message
 */
export interface ParsedTask {
  title: string;
  description?: string;
}

/**
 * Extracts a clean title from raw task text.
 * - Removes bot mentions and punctuation at the start
 * - Capitalizes the first letter
 * - Truncates very long text to create a reasonable title
 */
export function extractCleanTitle(rawText: string): string {
  if (!rawText || !rawText.trim()) {
    return '';
  }

  let cleaned = rawText.trim();

  // Remove leading punctuation and whitespace (like dashes)
  cleaned = cleaned.replace(/^[-–—:,;.!?\s]+/, '');

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Truncate to max 100 chars for title, adding ellipsis if needed
  const maxLength = 100;
  if (cleaned.length > maxLength) {
    // Try to cut at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.7) {
      cleaned = truncated.substring(0, lastSpace) + '...';
    } else {
      cleaned = truncated + '...';
    }
  }

  return cleaned;
}

/**
 * Parses a Telegram message to extract task information.
 * Supports formats:
 * - @botname - task description
 * - @botname task description
 * - /task task description
 * - /task@botname task description (group chat format)
 * - /todo task description
 * - /todo@botname task description (group chat format)
 * - Forwarded messages (uses the forwarded message text as task)
 *
 * Returns both a clean title and the original description.
 */
export function parseTaskFromMessage(
  message: TelegramMessage,
  botUsername?: string
): ParsedTask | null {
  // Handle forwarded messages - use the forwarded text as the task description
  if (message.forward_from || message.forward_from_chat) {
    if (message.text && message.text.trim()) {
      const rawText = message.text.trim();
      return {
        title: extractCleanTitle(rawText),
        description: rawText,
      };
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
    const rawText = taskCommandMatch[1].trim();
    if (!rawText) return null;
    return {
      title: extractCleanTitle(rawText),
      description: rawText,
    };
  }

  const todoCommandMatch = text.match(/^\/todo(?:@[\w-]+)?\s+(.+)/i);
  if (todoCommandMatch) {
    const rawText = todoCommandMatch[1].trim();
    if (!rawText) return null;
    return {
      title: extractCleanTitle(rawText),
      description: rawText,
    };
  }

  // Mention format: @botname - task or @botname task
  if (botUsername) {
    const mentionPattern = new RegExp(`^@${botUsername}(?:\\s*-\\s*|\\s+)(.+)`, 'i');
    const match = text.match(mentionPattern);
    if (match && match[1]) {
      const rawText = match[1].trim();
      if (!rawText) return null;
      return {
        title: extractCleanTitle(rawText),
        description: rawText,
      };
    }
  }

  return null;
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
