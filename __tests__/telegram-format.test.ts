import { describe, it, expect } from 'vitest';
import {
  escapeMarkdownV2,
  bold,
  formatTitle,
  formatSectionHeader,
  escapeIfNeeded,
  formatBullet,
  validateMessageLength,
  formatDateForReport,
  EMOJI,
  MAX_TELEGRAM_MESSAGE_LENGTH,
} from '../lib/telegram-format';

describe('telegram-format utilities', () => {
  describe('escapeMarkdownV2', () => {
    it('escapes underscores', () => {
      expect(escapeMarkdownV2('test_value')).toBe('test\\_value');
    });

    it('escapes periods', () => {
      expect(escapeMarkdownV2('50.00%')).toBe('50\\.00%');
    });

    it('escapes dashes/hyphens', () => {
      expect(escapeMarkdownV2('PAY-REV')).toBe('PAY\\-REV');
    });

    it('escapes parentheses', () => {
      expect(escapeMarkdownV2('(test)')).toBe('\\(test\\)');
    });

    it('escapes multiple special characters', () => {
      expect(escapeMarkdownV2('CS_395 - 50.00% (10/20)')).toBe('CS\\_395 \\- 50\\.00% \\(10/20\\)');
    });

    it('escapes brackets', () => {
      expect(escapeMarkdownV2('[link](url)')).toBe('\\[link\\]\\(url\\)');
    });

    it('returns empty string for empty input', () => {
      expect(escapeMarkdownV2('')).toBe('');
    });

    it('does not escape regular text', () => {
      expect(escapeMarkdownV2('simple text')).toBe('simple text');
    });
  });

  describe('bold', () => {
    it('wraps text in asterisks and escapes content', () => {
      expect(bold('Title')).toBe('*Title*');
    });

    it('escapes special characters inside bold text', () => {
      expect(bold('Test_Name')).toBe('*Test\\_Name*');
    });

    it('handles complex text', () => {
      expect(bold('Report - 01/24/2026')).toBe('*Report \\- 01/24/2026*');
    });
  });

  describe('formatTitle', () => {
    it('formats title with emoji and bold in telegram mode', () => {
      const result = formatTitle('📊', 'Daily Report', 'telegram');
      expect(result).toBe('📊 *Daily Report*');
    });

    it('formats title with emoji but no bold in plain mode', () => {
      const result = formatTitle('📊', 'Daily Report', 'plain');
      expect(result).toBe('📊 Daily Report');
    });

    it('escapes special characters in telegram mode', () => {
      const result = formatTitle('📊', 'Report — 01/24/2026', 'telegram');
      expect(result).toContain('Report');
      expect(result).toContain('📊');
      expect(result).toContain('*');
    });
  });

  describe('formatSectionHeader', () => {
    it('formats section header with emoji and bold in telegram mode', () => {
      const result = formatSectionHeader('💳', 'VISA', 'telegram');
      expect(result).toBe('💳 *VISA*');
    });

    it('formats section header with emoji but no bold in plain mode', () => {
      const result = formatSectionHeader('💳', 'VISA', 'plain');
      expect(result).toBe('💳 VISA');
    });
  });

  describe('escapeIfNeeded', () => {
    it('escapes text in telegram mode', () => {
      expect(escapeIfNeeded('test_value', 'telegram')).toBe('test\\_value');
    });

    it('does not escape text in plain mode', () => {
      expect(escapeIfNeeded('test_value', 'plain')).toBe('test_value');
    });

    it('uses telegram mode by default', () => {
      expect(escapeIfNeeded('test_value')).toBe('test\\_value');
    });
  });

  describe('formatBullet', () => {
    it('formats bullet with escaped dash in telegram mode', () => {
      const result = formatBullet('Item 1', 'telegram');
      expect(result).toBe('\\- Item 1');
    });

    it('formats bullet with plain dash in plain mode', () => {
      const result = formatBullet('Item 1', 'plain');
      expect(result).toBe('- Item 1');
    });

    it('escapes content in telegram mode', () => {
      const result = formatBullet('Value: 50.00%', 'telegram');
      expect(result).toBe('\\- Value: 50\\.00%');
    });
  });

  describe('validateMessageLength', () => {
    it('returns valid for short messages', () => {
      const result = validateMessageLength('Short message');
      expect(result.isValid).toBe(true);
      expect(result.length).toBe(13);
      expect(result.maxLength).toBe(MAX_TELEGRAM_MESSAGE_LENGTH);
    });

    it('returns invalid for messages exceeding max length', () => {
      const longMessage = 'a'.repeat(MAX_TELEGRAM_MESSAGE_LENGTH + 1);
      const result = validateMessageLength(longMessage);
      expect(result.isValid).toBe(false);
      expect(result.length).toBe(MAX_TELEGRAM_MESSAGE_LENGTH + 1);
    });

    it('returns valid for messages at exactly max length', () => {
      const maxMessage = 'a'.repeat(MAX_TELEGRAM_MESSAGE_LENGTH);
      const result = validateMessageLength(maxMessage);
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatDateForReport', () => {
    it('formats ISO date to MM/DD/YYYY', () => {
      expect(formatDateForReport('2026-01-24')).toBe('01/24/2026');
    });

    it('handles single digit month and day', () => {
      expect(formatDateForReport('2026-01-05')).toBe('01/05/2026');
    });

    it('handles December', () => {
      expect(formatDateForReport('2026-12-31')).toBe('12/31/2026');
    });
  });

  describe('EMOJI constants', () => {
    it('has all required emojis defined', () => {
      expect(EMOJI.REPORT_SUMMARY).toBe('📊');
      expect(EMOJI.RERUNS).toBe('🔁');
      expect(EMOJI.SALES).toBe('💰');
      expect(EMOJI.APPROVAL_RATE).toBe('📈');
      expect(EMOJI.CARD_NETWORK).toBe('💳');
      expect(EMOJI.DECLINES).toBe('⚠️');
      expect(EMOJI.INSIGHTS).toBe('🧠');
      expect(EMOJI.ACTION_REQUIRED).toBe('🚀');
      expect(EMOJI.TOP_PERFORMER).toBe('🟢⬆️');
      expect(EMOJI.LOW_PERFORMER).toBe('🔴⬇️');
      expect(EMOJI.US_FLAG).toBe('🇺🇸');
      expect(EMOJI.GLOBE).toBe('🌍');
      expect(EMOJI.CLOCK).toBe('⏱');
    });
  });
});
