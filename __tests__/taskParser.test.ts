import { describe, it, expect } from 'vitest';
import { parseTaskFromMessage, shouldReply } from '../lib/taskParser';
import { TelegramMessage } from '../lib/taskTypes';

describe('taskParser', () => {
  describe('parseTaskFromMessage', () => {
    it('parses /task command format', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/task Review the PR',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('Review the PR');
    });

    it('parses /todo command format', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/todo Fix the bug',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('Fix the bug');
    });

    it('parses @botname - task format', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '@testbot - Update the documentation',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message, 'testbot');
      expect(result).toBe('Update the documentation');
    });

    it('parses @botname task format (without dash)', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '@testbot Deploy to production',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message, 'testbot');
      expect(result).toBe('Deploy to production');
    });

    it('returns null for non-task messages', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: 'Just a regular message',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBeNull();
    });

    it('returns null for empty task description', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/task',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBeNull();
    });

    it('handles case-insensitive bot mention', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '@TestBot - Case insensitive task',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message, 'testbot');
      expect(result).toBe('Case insensitive task');
    });

    it('parses /task@botname format (group chat with multiple bots)', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/task@mybot Review the pull request',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('Review the pull request');
    });

    it('parses /todo@botname format (group chat with multiple bots)', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/todo@mybot Update documentation',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('Update documentation');
    });

    it('parses /task@bot-name format with hyphen in bot name', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/task@my-task-bot Deploy the app',
        date: Date.now(),
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('Deploy the app');
    });

    it('parses forwarded message with text as task', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: 'This is a forwarded message that should become a task',
        date: Date.now(),
        forward_from: {
          id: 999,
          first_name: 'John',
          last_name: 'Doe',
        },
        forward_date: Date.now() - 3600,
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('This is a forwarded message that should become a task');
    });

    it('parses forwarded message from channel as task', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: 'Message forwarded from a channel',
        date: Date.now(),
        forward_from_chat: {
          id: 888,
          type: 'channel',
          title: 'Test Channel',
        },
        forward_from_message_id: 42,
        forward_date: Date.now() - 7200,
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBe('Message forwarded from a channel');
    });

    it('returns null for forwarded message without text', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        date: Date.now(),
        forward_from: {
          id: 999,
          first_name: 'John',
        },
        forward_date: Date.now() - 3600,
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBeNull();
    });

    it('returns null for forwarded message with empty text', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '   ',
        date: Date.now(),
        forward_from: {
          id: 999,
          first_name: 'John',
        },
        forward_date: Date.now() - 3600,
      };

      const result = parseTaskFromMessage(message);
      expect(result).toBeNull();
    });
  });

  describe('shouldReply', () => {
    it('returns true for /task command', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/task Some task',
        date: Date.now(),
      };

      expect(shouldReply(message)).toBe(true);
    });

    it('returns true for /todo command', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/todo Some task',
        date: Date.now(),
      };

      expect(shouldReply(message)).toBe(true);
    });

    it('returns true for mention with dash', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '@testbot - Task with explicit dash',
        date: Date.now(),
      };

      expect(shouldReply(message, 'testbot')).toBe(true);
    });

    it('returns false for mention without dash', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '@testbot Task without dash',
        date: Date.now(),
      };

      expect(shouldReply(message, 'testbot')).toBe(false);
    });

    it('returns false for regular messages', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: 'Regular message',
        date: Date.now(),
      };

      expect(shouldReply(message)).toBe(false);
    });

    it('returns true for /task@botname command (group chat)', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/task@mybot Some task',
        date: Date.now(),
      };

      expect(shouldReply(message)).toBe(true);
    });

    it('returns true for /todo@botname command (group chat)', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: '/todo@mybot Some task',
        date: Date.now(),
      };

      expect(shouldReply(message)).toBe(true);
    });

    it('returns false for forwarded messages', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: 'This is a forwarded message',
        date: Date.now(),
        forward_from: {
          id: 999,
          first_name: 'John',
        },
        forward_date: Date.now() - 3600,
      };

      expect(shouldReply(message)).toBe(false);
    });

    it('returns false for messages forwarded from channels', () => {
      const message: TelegramMessage = {
        message_id: 1,
        chat: { id: 123, type: 'group' },
        text: 'This is forwarded from a channel',
        date: Date.now(),
        forward_from_chat: {
          id: 888,
          type: 'channel',
          title: 'Test Channel',
        },
        forward_from_message_id: 42,
        forward_date: Date.now() - 7200,
      };

      expect(shouldReply(message)).toBe(false);
    });
  });
});
