/**
 * Shared Telegram message generator
 * Single source of truth for both preview and sending to Telegram
 */

import { formatMessage, FormDataType, FormatMessageOptions } from './formatters';

/**
 * Generated Telegram message result
 */
export interface TelegramMessageResult {
  /** Escaped MarkdownV2 text for sending to Telegram */
  telegramText: string;
  /** Human-readable preview text (HTML formatted) */
  previewText: string;
  /** Plain text version (no formatting) */
  plainText: string;
  /** Parse mode for Telegram API */
  parseMode: 'MarkdownV2';
}

/**
 * Convert MarkdownV2 escaped text to human-readable preview HTML
 * - Removes escape backslashes
 * - Converts *bold* to <strong>bold</strong>
 * - Converts _italic_ to <em>italic</em>
 * - Preserves emojis and line breaks
 */
export function telegramToPreviewHtml(telegramText: string): string {
  // First, remove all backslash escapes (for display)
  // This handles all MarkdownV2 special characters that might be escaped
  let preview = telegramText.replace(/\\([_*\[\]()~`>#+\-=|{}.!\\/])/g, '$1');
  
  // Convert *bold* to <strong>bold</strong>
  // Match *text* but not escaped \*
  preview = preview.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  
  // Convert _italic_ to <em>italic</em>
  preview = preview.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Convert line breaks to <br> for HTML
  preview = preview.replace(/\n/g, '<br />');
  
  return preview;
}

/**
 * Convert MarkdownV2 escaped text to plain text
 * - Removes all escape backslashes
 * - Removes markdown formatting (*bold*, _italic_)
 */
export function telegramToPlainText(telegramText: string): string {
  // First, remove all backslash escapes
  let plain = telegramText.replace(/\\([_*\[\]()~`>#+\-=|{}.!\\/])/g, '$1');
  
  // Remove *bold* markers but keep text
  plain = plain.replace(/\*([^*]+)\*/g, '$1');
  
  // Remove _italic_ markers but keep text
  plain = plain.replace(/_([^_]+)_/g, '$1');
  
  return plain;
}

/**
 * Generate Telegram message with both telegram-ready and preview versions
 * 
 * @param slug - Template slug (e.g., 'batch-reruns', 'manual-rebills')
 * @param formData - Form data for the template
 * @param options - Additional formatting options
 * @returns TelegramMessageResult with telegramText, previewText, and plainText
 */
export function generateTelegramMessage(
  slug: string,
  formData: FormDataType,
  options?: Omit<FormatMessageOptions, 'mode'>
): TelegramMessageResult {
  // Generate the telegram-ready text (with MarkdownV2 escaping)
  const telegramText = formatMessage(slug, formData, { ...options, mode: 'telegram' });
  
  // Generate preview HTML from the telegram text
  const previewText = telegramToPreviewHtml(telegramText);
  
  // Generate plain text version
  const plainText = telegramToPlainText(telegramText);
  
  return {
    telegramText,
    previewText,
    plainText,
    parseMode: 'MarkdownV2'
  };
}
