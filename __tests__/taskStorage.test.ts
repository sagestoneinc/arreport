import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteTaskStorage } from '../lib/taskStorageSqlite';

describe('SQLiteTaskStorage', () => {
  let storage: SQLiteTaskStorage;

  beforeEach(() => {
    // Use in-memory database for testing
    storage = new SQLiteTaskStorage(true);
  });

  afterEach(async () => {
    await storage.close();
  });

  describe('initialize', () => {
    it('should initialize database schema', async () => {
      // Initialize should not throw
      await expect(storage.initialize()).resolves.not.toThrow();
    });

    it('should be idempotent - multiple calls should not fail', async () => {
      await storage.initialize();
      await storage.initialize();
      await storage.initialize();
      
      // All calls should succeed without error
      expect(true).toBe(true);
    });
  });

  describe('saveTask', () => {
    it('should save a task and assign id, created_at, and status', async () => {
      await storage.initialize();

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
      expect(task.created_at).toBeDefined();
      expect(task.status).toBe('open');
      expect(task.description).toBe('Test task description');
      expect(task.chat_id).toBe('123456');
    });

    it('should prevent duplicate tasks with same chat_id and message_id', async () => {
      await storage.initialize();

      const taskData = {
        chat_id: '123456',
        chat_title: 'Test Chat',
        message_id: 1,
        user_id: 'user123',
        description: 'Test task',
        raw_text: 'Test task',
      };

      await storage.saveTask(taskData);

      // Second save with same chat_id and message_id should throw
      await expect(storage.saveTask(taskData)).rejects.toThrow();
    });
  });

  describe('taskExists', () => {
    it('should return false for non-existent task', async () => {
      await storage.initialize();
      const exists = await storage.taskExists('123456', 999);
      expect(exists).toBe(false);
    });

    it('should return true for existing task', async () => {
      await storage.initialize();

      await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Test task',
        raw_text: 'Test task',
      });

      const exists = await storage.taskExists('123456', 1);
      expect(exists).toBe(true);
    });
  });

  describe('getTasks', () => {
    it('should return empty array when no tasks exist', async () => {
      await storage.initialize();
      const tasks = await storage.getTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks', async () => {
      await storage.initialize();

      await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Task 1',
        raw_text: 'Task 1',
      });

      await storage.saveTask({
        chat_id: '123456',
        message_id: 2,
        user_id: 'user123',
        description: 'Task 2',
        raw_text: 'Task 2',
      });

      const tasks = await storage.getTasks();
      expect(tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      await storage.initialize();

      const task1 = await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Task 1',
        raw_text: 'Task 1',
      });

      const task2 = await storage.saveTask({
        chat_id: '123456',
        message_id: 2,
        user_id: 'user123',
        description: 'Task 2',
        raw_text: 'Task 2',
      });

      // Mark task2 as done
      await storage.updateTaskStatus(task2.id, 'done');

      const openTasks = await storage.getTasks({ status: 'open' });
      expect(openTasks).toHaveLength(1);
      expect(openTasks[0].id).toBe(task1.id);

      const doneTasks = await storage.getTasks({ status: 'done' });
      expect(doneTasks).toHaveLength(1);
      expect(doneTasks[0].id).toBe(task2.id);
    });

    it('should filter tasks by chat_id', async () => {
      await storage.initialize();

      await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Task from chat 1',
        raw_text: 'Task 1',
      });

      await storage.saveTask({
        chat_id: '789012',
        message_id: 1,
        user_id: 'user123',
        description: 'Task from chat 2',
        raw_text: 'Task 2',
      });

      const chat1Tasks = await storage.getTasks({ chat_id: '123456' });
      expect(chat1Tasks).toHaveLength(1);
      expect(chat1Tasks[0].chat_id).toBe('123456');

      const chat2Tasks = await storage.getTasks({ chat_id: '789012' });
      expect(chat2Tasks).toHaveLength(1);
      expect(chat2Tasks[0].chat_id).toBe('789012');
    });
  });

  describe('updateTask', () => {
    it('should update task description and raw_text', async () => {
      await storage.initialize();

      await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Original task',
        raw_text: 'Original text',
      });

      await storage.updateTask('123456', 1, 'Updated task', 'Updated text');

      const exists = await storage.taskExists('123456', 1);
      expect(exists).toBe(true);

      const tasks = await storage.getTasks({ chat_id: '123456' });
      expect(tasks[0].description).toBe('Updated task');
      expect(tasks[0].raw_text).toBe('Updated text');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      await storage.initialize();

      const task = await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Test task',
        raw_text: 'Test task',
      });

      expect(task.status).toBe('open');

      const success = await storage.updateTaskStatus(task.id, 'done');
      expect(success).toBe(true);

      const updatedTask = await storage.getTaskById(task.id);
      expect(updatedTask?.status).toBe('done');
    });

    it('should return false for non-existent task', async () => {
      await storage.initialize();
      const success = await storage.updateTaskStatus('non-existent-id', 'done');
      expect(success).toBe(false);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      await storage.initialize();

      const task = await storage.saveTask({
        chat_id: '123456',
        message_id: 1,
        user_id: 'user123',
        description: 'Test task',
        raw_text: 'Test task',
      });

      const success = await storage.deleteTask(task.id);
      expect(success).toBe(true);

      const deletedTask = await storage.getTaskById(task.id);
      expect(deletedTask).toBeNull();
    });

    it('should return false for non-existent task', async () => {
      await storage.initialize();
      const success = await storage.deleteTask('non-existent-id');
      expect(success).toBe(false);
    });
  });
});
