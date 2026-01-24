import { describe, it, expect } from 'vitest';
import { telegramToPreviewHtml, telegramToPlainText, generateTelegramMessage } from '../lib/telegramMessageGenerator';

describe('telegramMessageGenerator', () => {
  describe('telegramToPreviewHtml', () => {
    it('removes escape backslashes', () => {
      const input = '\\- Test \\(example\\)';
      const result = telegramToPreviewHtml(input);
      expect(result).toContain('- Test (example)');
    });

    it('converts *bold* to <strong>bold</strong>', () => {
      const input = '*This is bold*';
      const result = telegramToPreviewHtml(input);
      expect(result).toBe('<strong>This is bold</strong>');
    });

    it('converts _italic_ to <em>italic</em>', () => {
      const input = '_This is italic_';
      const result = telegramToPreviewHtml(input);
      expect(result).toBe('<em>This is italic</em>');
    });

    it('handles escaped bold text', () => {
      const input = '*Daily Report \\- 01\\/24\\/2026*';
      const result = telegramToPreviewHtml(input);
      expect(result).toBe('<strong>Daily Report - 01/24/2026</strong>');
    });

    it('converts line breaks to <br />', () => {
      const input = 'Line 1\nLine 2';
      const result = telegramToPreviewHtml(input);
      expect(result).toBe('Line 1<br />Line 2');
    });

    it('handles mixed formatting', () => {
      const input = '*Bold* and _italic_ with \\- dash';
      const result = telegramToPreviewHtml(input);
      expect(result).toBe('<strong>Bold</strong> and <em>italic</em> with - dash');
    });

    it('preserves emojis', () => {
      const input = '📊 *Report Summary*';
      const result = telegramToPreviewHtml(input);
      expect(result).toContain('📊');
      expect(result).toContain('<strong>Report Summary</strong>');
    });
  });

  describe('telegramToPlainText', () => {
    it('removes escape backslashes', () => {
      const input = '\\- Test \\(example\\)';
      const result = telegramToPlainText(input);
      expect(result).toBe('- Test (example)');
    });

    it('removes *bold* markers but keeps text', () => {
      const input = '*This is bold*';
      const result = telegramToPlainText(input);
      expect(result).toBe('This is bold');
    });

    it('removes _italic_ markers but keeps text', () => {
      const input = '_This is italic_';
      const result = telegramToPlainText(input);
      expect(result).toBe('This is italic');
    });

    it('preserves line breaks', () => {
      const input = 'Line 1\nLine 2';
      const result = telegramToPlainText(input);
      expect(result).toBe('Line 1\nLine 2');
    });

    it('preserves emojis', () => {
      const input = '📊 Report Summary';
      const result = telegramToPlainText(input);
      expect(result).toContain('📊');
    });
  });

  describe('generateTelegramMessage', () => {
    it('returns all three text versions', () => {
      const result = generateTelegramMessage('mint-additional-sales', {
        additional_sales: 100,
        affiliate_lines: '',
        c1c3_lines: ''
      });

      expect(result).toHaveProperty('telegramText');
      expect(result).toHaveProperty('previewText');
      expect(result).toHaveProperty('plainText');
      expect(result.parseMode).toBe('MarkdownV2');
    });

    it('telegramText contains escape characters', () => {
      const result = generateTelegramMessage('mint-additional-sales', {
        additional_sales: 100,
        affiliate_lines: '',
        c1c3_lines: ''
      });

      // Telegram text should contain escaped characters
      expect(result.telegramText).toContain('\\');
    });

    it('previewText does not contain escape characters', () => {
      const result = generateTelegramMessage('mint-additional-sales', {
        additional_sales: 100,
        affiliate_lines: '',
        c1c3_lines: ''
      });

      // Preview text should not have backslash escapes before special chars
      expect(result.previewText).not.toMatch(/\\[_*\[\]()~`>#+\-=|{}.!]/);
    });
  });
});
