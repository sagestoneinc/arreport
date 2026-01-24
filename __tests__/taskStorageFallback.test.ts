import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FallbackTaskStorage } from '../lib/taskStorage';

// Mock the MySQL storage to always fail
vi.mock('../lib/taskStorageMysql', () => ({
  MySQLTaskStorage: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockRejectedValue(new Error('MySQL connection failed')),
    close: vi.fn().mockResolvedValue(undefined),
    saveTask: vi.fn(),
    updateTask: vi.fn(),
    taskExists: vi.fn(),
    getTasks: vi.fn(),
    getTaskById: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
  })),
}));

describe('FallbackTaskStorage', () => {
  let storage: FallbackTaskStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new FallbackTaskStorage();
  });

  afterEach(async () => {
    await storage.close();
  });

  describe('MySQL fallback behavior', () => {
    it('should fall back to SQLite when MySQL fails', async () => {
      // Initialize should not throw even when MySQL fails
      await expect(storage.initialize()).resolves.not.toThrow();

      // Should be using fallback
      expect(storage.isUsingFallback()).toBe(true);
    });

    it('should be functional after fallback', async () => {
      await storage.initialize();

      // Should be able to save and retrieve tasks
      const task = await storage.saveTask({
        chat_id: '123456',
        chat_title: 'Test Chat',
        message_id: 1,
        user_id: 'user123',
        username: 'testuser',
        name: 'Test User',
        description: 'Test task description',
        raw_text: '/task Test task description',
      });

      expect(task.id).toBeDefined();
      expect(task.status).toBe('open');

      // Should be able to get tasks
      const tasks = await storage.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].description).toBe('Test task description');
    });

    it('should support all storage operations after fallback', async () => {
      await storage.initialize();

      // Save task
      const task = await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Test task',
        raw_text: 'Test task',
      });

      // Task exists
      const exists = await storage.taskExists('123456', 1);
      expect(exists).toBe(true);

      // Get task by ID
      const retrieved = await storage.getTaskById(task.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.description).toBe('Test task');

      // Update task status
      const updated = await storage.updateTaskStatus(task.id, 'done');
      expect(updated).toBe(true);

      // Verify status update
      const updatedTask = await storage.getTaskById(task.id);
      expect(updatedTask?.status).toBe('done');

      // Delete task
      const deleted = await storage.deleteTask(task.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const deletedTask = await storage.getTaskById(task.id);
      expect(deletedTask).toBeNull();
    });

    it('should filter tasks correctly after fallback', async () => {
      await storage.initialize();

      // Create multiple tasks
      const task1 = await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Task 1',
        raw_text: 'Task 1',
      });

      await storage.saveTask({
        chat_id: '789012',
        message_id: 2,
        user_id: 'user123',
        description: 'Task 2',
        raw_text: 'Task 2',
      });

      // Filter by chat_id
      const chat1Tasks = await storage.getTasks({ chat_id: '123456' });
      expect(chat1Tasks).toHaveLength(1);
      expect(chat1Tasks[0].chat_id).toBe('123456');

      // Mark first task as done
      await storage.updateTaskStatus(task1.id, 'done');

      // Filter by status
      const openTasks = await storage.getTasks({ status: 'open' });
      expect(openTasks).toHaveLength(1);
      expect(openTasks[0].chat_id).toBe('789012');

      const doneTasks = await storage.getTasks({ status: 'done' });
      expect(doneTasks).toHaveLength(1);
      expect(doneTasks[0].chat_id).toBe('123456');
    });
  });
});
