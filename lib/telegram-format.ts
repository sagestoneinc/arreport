/**
 * Telegram formatting utilities for MarkdownV2 mode
 *
 * This module provides utilities to format messages for Telegram,
 * including character escaping and bold formatting.
 */

/**
 * Format mode: 'plain' for unformatted, 'telegram' for Telegram MarkdownV2
 */
export type FormatMode = 'plain' | 'telegram';

/**
 * Maximum message length for Telegram API (4096 characters)
 */
export const MAX_TELEGRAM_MESSAGE_LENGTH = 4096;

/**
 * Emoji constants for report formatting
 */
export const EMOJI = {
  REPORT_SUMMARY: '📊',
  RERUNS: '🔁',
  SALES: '💰',
  APPROVAL_RATE: '📈',
  CARD_NETWORK: '💳',
  DECLINES: '⚠️',
  INSIGHTS: '🧠',
  ACTION_REQUIRED: '🚀',
  TOP_PERFORMER: '🟢⬆️',
  MIDDLE_PERFORMER: '🟡➡️',
  LOW_PERFORMER: '🔴⬇️',
  US_FLAG: '🇺🇸',
  GLOBE: '🌍',
  CLOCK: '⏱',
} as const;

/**
 * Characters that need to be escaped in Telegram MarkdownV2
 * These characters have special meaning and must be escaped with backslash
 */
const MARKDOWN_V2_SPECIAL_CHARS = /([_*\[\]()~`>#+\-=|{}.!\\])/g;

/**
 * Escape special characters for Telegram MarkdownV2 mode
 * @param text - The text to escape
 * @returns Escaped text safe for MarkdownV2
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(MARKDOWN_V2_SPECIAL_CHARS, '\\$1');
}

/**
 * Format text as bold for Telegram MarkdownV2
 * @param text - The text to make bold
 * @returns Bold formatted text (already escaped internally)
 */
export function bold(text: string): string {
  return `*${escapeMarkdownV2(text)}*`;
}

/**
 * Format a title line with emoji for Telegram
 * @param emoji - The emoji to prepend
 * @param title - The title text
 * @param mode - Format mode
 * @returns Formatted title
 */
export function formatTitle(emoji: string, title: string, mode: FormatMode = 'telegram'): string {
  if (mode === 'plain') {
    return `${emoji} ${title}`;
  }
  return `${emoji} ${bold(title)}`;
}

/**
 * Format a section header with emoji for Telegram
 * @param emoji - The emoji to prepend
 * @param header - The header text
 * @param mode - Format mode
 * @returns Formatted header
 */
export function formatSectionHeader(
  emoji: string,
  header: string,
  mode: FormatMode = 'telegram'
): string {
  if (mode === 'plain') {
    return `${emoji} ${header}`;
  }
  return `${emoji} ${bold(header)}`;
}

/**
 * Escape text for Telegram if in telegram mode, otherwise return as-is
 * @param text - The text to potentially escape
 * @param mode - Format mode
 * @returns Escaped or plain text
 */
export function escapeIfNeeded(text: string, mode: FormatMode = 'telegram'): string {
  if (mode === 'plain') {
    return text;
  }
  return escapeMarkdownV2(text);
}

/**
 * Format a bullet point line
 * @param text - The text for the bullet point
 * @param mode - Format mode
 * @returns Formatted bullet line
 */
export function formatBullet(text: string, mode: FormatMode = 'telegram'): string {
  const prefix = mode === 'telegram' ? '\\- ' : '- ';
  if (mode === 'telegram') {
    return `${prefix}${escapeMarkdownV2(text)}`;
  }
  return `${prefix}${text}`;
}

/**
 * Validate message length for Telegram
 * @param message - The message to validate
 * @returns Object with isValid boolean and length info
 */
export function validateMessageLength(message: string): {
  isValid: boolean;
  length: number;
  maxLength: number;
} {
  return {
    isValid: message.length <= MAX_TELEGRAM_MESSAGE_LENGTH,
    length: message.length,
    maxLength: MAX_TELEGRAM_MESSAGE_LENGTH,
  };
}

/**
 * Format a date string for display in reports
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Formatted date string MM/DD/YYYY
 */
export function formatDateForReport(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format an ISO date string (YYYY-MM-DD) for display
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Formatted date string YYYY-MM-DD
 */
export function formatDateISO(dateStr: string): string {
  return dateStr;
}
