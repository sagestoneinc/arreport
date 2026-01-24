import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '../app/api/debug-storage/route';
import { NextRequest } from 'next/server';

describe('/api/debug-storage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should return 403 when DEBUG_API_KEY is not configured', async () => {
      delete process.env.DEBUG_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/debug-storage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        ok: false,
        error: 'Debug endpoint not available in production',
      });
    });

    it('should return 401 when DEBUG_API_KEY does not match', async () => {
      process.env.DEBUG_API_KEY = 'correct-key-123';

      const request = new NextRequest('http://localhost:3000/api/debug-storage?key=wrong-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        ok: false,
        error: 'Unauthorized',
      });
    });

    it('should return 401 when no key is provided', async () => {
      process.env.DEBUG_API_KEY = 'correct-key-123';

      const request = new NextRequest('http://localhost:3000/api/debug-storage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        ok: false,
        error: 'Unauthorized',
      });
    });

    it('should return success when DEBUG_API_KEY matches via query parameter', async () => {
      process.env.DEBUG_API_KEY = 'correct-key-123';
      process.env.TASKS_STORAGE = 'memory';

      const request = new NextRequest(
        'http://localhost:3000/api/debug-storage?key=correct-key-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.storage_type).toBe('memory');
      expect(data.tasks_count).toBeDefined();
      // In production, configuration details should not be exposed
      expect(data.mysql_host).toBeUndefined();
      expect(data.mysql_database).toBeUndefined();
    });

    it('should return success when DEBUG_API_KEY matches via Authorization header', async () => {
      process.env.DEBUG_API_KEY = 'correct-key-123';
      process.env.TASKS_STORAGE = 'memory';

      const request = new NextRequest('http://localhost:3000/api/debug-storage', {
        headers: {
          Authorization: 'Bearer correct-key-123',
        },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.storage_type).toBe('memory');
      // In production, configuration details should not be exposed
      expect(data.mysql_host).toBeUndefined();
      expect(data.mysql_database).toBeUndefined();
    });
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return success without authentication in development', async () => {
      process.env.TASKS_STORAGE = 'memory';
      delete process.env.DEBUG_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/debug-storage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.storage_type).toBe('memory');
      expect(data.tasks_count).toBeDefined();
      // In development, configuration details should be included
      expect(data.mysql_host).toBeDefined();
      expect(data.mysql_database).toBeDefined();
    });
  });

  describe('Test Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should allow access without authentication in test environment', async () => {
      process.env.TASKS_STORAGE = 'memory';

      const request = new NextRequest('http://localhost:3000/api/debug-storage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });
});
