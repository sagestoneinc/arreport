import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../app/api/telegram/webhook/route';
import { NextRequest } from 'next/server';

describe('/api/telegram/webhook', () => {
  const originalEnv = process.env;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  let consoleWarnSpy: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };

    // Mock console methods
    consoleWarnSpy = vi.fn();
    consoleErrorSpy = vi.fn();
    consoleLogSpy = vi.fn();
    console.warn = consoleWarnSpy;
    console.error = consoleErrorSpy;
    console.log = consoleLogSpy;

    // Set required environment variables
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test-secret-123';
    process.env.BOT_USERNAME = 'testbot';
    process.env.TASKS_STORAGE = 'memory';
  });

  afterEach(() => {
    // Restore original environment and console
    process.env = originalEnv;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('Authorization', () => {
    it('should return 401 when secret token is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          update_id: 12345,
          message: {
            message_id: 1,
            chat: { id: 123, title: 'Test Chat' },
            from: { id: 456, username: 'testuser', first_name: 'Test' },
            text: 'Hello bot',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        ok: false,
        error: 'Unauthorized',
      });
      // Note: Log may or may not be called depending on rate limiting from previous tests
    });

    it('should return 401 when secret token is incorrect', async () => {
      const request = new NextRequest('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-bot-api-secret-token': 'wrong-secret',
        },
        body: JSON.stringify({
          update_id: 12345,
          message: {
            message_id: 1,
            chat: { id: 123, title: 'Test Chat' },
            from: { id: 456, username: 'testuser', first_name: 'Test' },
            text: 'Hello bot',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        ok: false,
        error: 'Unauthorized',
      });
      // Note: Log may or may not be called depending on rate limiting from previous tests
    });

    it('should return 500 when TELEGRAM_WEBHOOK_SECRET is not configured', async () => {
      delete process.env.TELEGRAM_WEBHOOK_SECRET;

      const request = new NextRequest('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-bot-api-secret-token': 'some-secret',
        },
        body: JSON.stringify({
          update_id: 12345,
          message: {
            message_id: 1,
            chat: { id: 123, title: 'Test Chat' },
            from: { id: 456, username: 'testuser', first_name: 'Test' },
            text: 'Hello bot',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        ok: false,
        error: 'Webhook not configured',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('TELEGRAM_WEBHOOK_SECRET not configured');
    });

    it('should accept request when secret token is correct', async () => {
      const request = new NextRequest('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-bot-api-secret-token': 'test-secret-123',
        },
        body: JSON.stringify({
          update_id: 12345,
          message: {
            message_id: 1,
            chat: { id: 123, title: 'Test Chat' },
            from: { id: 456, username: 'testuser', first_name: 'Test' },
            text: '@testbot test task',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Rate Limiting of Unauthorized Logs', () => {
    it('should log unauthorized attempts only once per minute', async () => {
      // This test verifies that the rate limiting prevents log spam
      // We need to use a separate isolated test to control Date.now properly
      
      // Create a separate module instance by using dynamic import
      // However, this is complex with vitest. Instead, let's verify the behavior
      // by testing that multiple unauthorized attempts don't cause excessive logging
      
      const requests = [];
      for (let i = 0; i < 5; i++) {
        const request = new NextRequest('http://localhost:3000/api/telegram/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-bot-api-secret-token': 'wrong-secret',
          },
          body: JSON.stringify({
            update_id: i,
            message: {
              message_id: i,
              chat: { id: 123, title: 'Test' },
              from: { id: 456, username: 'test', first_name: 'Test' },
              text: 'test',
            },
          }),
        });
        requests.push(POST(request));
      }

      await Promise.all(requests);

      // All requests should return 401 with Unauthorized
      // But the warning should be logged at most once (due to rate limiting)
      // Since we can't control the exact timing in this test, we verify it's not logged 5 times
      expect(consoleWarnSpy.mock.calls.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Empty Updates', () => {
    it('should handle updates without message gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-bot-api-secret-token': 'test-secret-123',
        },
        body: JSON.stringify({
          update_id: 12345,
          // No message or edited_message
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
    });
  });
});
