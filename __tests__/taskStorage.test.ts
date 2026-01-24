import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteTaskStorage } from '../lib/taskStorageSqlite';

describe('SQLiteTaskStorage', () => {
  let storage: SQLiteTaskStorage;

  // Helper function to create task data with required fields
  const createTaskData = (overrides: Partial<{
    chat_id: string;
    chat_title: string;
    message_id: number;
    user_id: string;
    username: string;
    name: string;
    title: string;
    description: string;
    source: 'telegram' | 'web';
    created_by: string;
    raw_text: string;
  }> = {}) => ({
    chat_id: '123456',
    message_id: 1,
    user_id: 'user123',
    title: 'Test task',
    description: 'Test task description',
    source: 'telegram' as const,
    created_by: 'testuser',
    raw_text: '/task Test task',
    ...overrides,
  });

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

      const task = await storage.saveTask(createTaskData({
        chat_title: 'Test Chat',
        username: 'testuser',
        name: 'Test User',
      }));

      expect(task.id).toBeDefined();
      expect(task.created_at).toBeDefined();
      expect(task.status).toBe('open');
      expect(task.title).toBe('Test task');
      expect(task.chat_id).toBe('123456');
      expect(task.source).toBe('telegram');
      expect(task.created_by).toBe('testuser');
    });

    it('should prevent duplicate tasks with same chat_id and message_id', async () => {
      await storage.initialize();

      const taskData = createTaskData({
        chat_title: 'Test Chat',
      });

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

      await storage.saveTask(createTaskData());

      const exists = await storage.taskExists('123456', 1);
      expect(exists).toBe(true);
    });
  });

  describe('findDuplicateOpenTask', () => {
    it('should return null when no duplicate exists', async () => {
      await storage.initialize();
      const duplicate = await storage.findDuplicateOpenTask('Non-existent task');
      expect(duplicate).toBeNull();
    });

    it('should find duplicate open task with same title', async () => {
      await storage.initialize();

      await storage.saveTask(createTaskData({
        title: 'Review the PR',
      }));

      const duplicate = await storage.findDuplicateOpenTask('Review the PR');
      expect(duplicate).not.toBeNull();
      expect(duplicate?.title).toBe('Review the PR');
    });

    it('should be case-insensitive', async () => {
      await storage.initialize();

      await storage.saveTask(createTaskData({
        title: 'Review the PR',
      }));

      const duplicate = await storage.findDuplicateOpenTask('review the pr');
      expect(duplicate).not.toBeNull();
    });

    it('should not find closed tasks', async () => {
      await storage.initialize();

      const task = await storage.saveTask(createTaskData({
        title: 'Review the PR',
      }));

      await storage.updateTaskStatus(task.id, 'done');

      const duplicate = await storage.findDuplicateOpenTask('Review the PR');
      expect(duplicate).toBeNull();
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

      await storage.saveTask(createTaskData({
        message_id: 1,
        title: 'Task 1',
      }));

      await storage.saveTask(createTaskData({
        message_id: 2,
        title: 'Task 2',
      }));

      const tasks = await storage.getTasks();
      expect(tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      await storage.initialize();

      const task1 = await storage.saveTask(createTaskData({
        message_id: 1,
        title: 'Task 1',
      }));

      const task2 = await storage.saveTask(createTaskData({
        message_id: 2,
        title: 'Task 2',
      }));

      // Mark task2 as done
      await storage.updateTaskStatus(task2.id, 'done');

      const openTasks = await storage.getTasks({ status: 'open' });
      expect(openTasks).toHaveLength(1);
      expect(openTasks[0].id).toBe(task1.id);

      const doneTasks = await storage.getTasks({ status: 'done' });
      expect(doneTasks).toHaveLength(1);
      expect(doneTasks[0].id).toBe(task2.id);
    });

    it('should filter tasks by in_progress status', async () => {
      await storage.initialize();

      const task1 = await storage.saveTask(createTaskData({
        message_id: 1,
        title: 'Task 1',
      }));

      await storage.saveTask(createTaskData({
        message_id: 2,
        title: 'Task 2',
      }));

      // Mark task1 as in_progress
      await storage.updateTaskStatus(task1.id, 'in_progress');

      const inProgressTasks = await storage.getTasks({ status: 'in_progress' });
      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].id).toBe(task1.id);
    });

    it('should filter tasks by chat_id', async () => {
      await storage.initialize();

      await storage.saveTask(createTaskData({
        chat_id: '123456',
        message_id: 1,
        title: 'Task from chat 1',
      }));

      await storage.saveTask(createTaskData({
        chat_id: '789012',
        message_id: 1,
        title: 'Task from chat 2',
      }));

      const chat1Tasks = await storage.getTasks({ chat_id: '123456' });
      expect(chat1Tasks).toHaveLength(1);
      expect(chat1Tasks[0].chat_id).toBe('123456');

      const chat2Tasks = await storage.getTasks({ chat_id: '789012' });
      expect(chat2Tasks).toHaveLength(1);
      expect(chat2Tasks[0].chat_id).toBe('789012');
    });

    it('should filter tasks by source', async () => {
      await storage.initialize();

      await storage.saveTask(createTaskData({
        message_id: 1,
        source: 'telegram',
      }));

      await storage.saveTask(createTaskData({
        message_id: 2,
        source: 'web',
      }));

      const telegramTasks = await storage.getTasks({ source: 'telegram' });
      expect(telegramTasks).toHaveLength(1);
      expect(telegramTasks[0].source).toBe('telegram');

      const webTasks = await storage.getTasks({ source: 'web' });
      expect(webTasks).toHaveLength(1);
      expect(webTasks[0].source).toBe('web');
    });

    it('should filter tasks by search query', async () => {
      await storage.initialize();

      await storage.saveTask(createTaskData({
        message_id: 1,
        title: 'Review the PR',
      }));

      await storage.saveTask(createTaskData({
        message_id: 2,
        title: 'Deploy to production',
      }));

      const searchResults = await storage.getTasks({ search: 'review' });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('Review the PR');
    });
  });

  describe('updateTask', () => {
    it('should update task title, description and raw_text', async () => {
      await storage.initialize();

      await storage.saveTask(createTaskData({
        title: 'Original task',
        description: 'Original description',
        raw_text: 'Original text',
      }));

      await storage.updateTask('123456', 1, 'Updated task', 'Updated description', 'Updated text');

      const exists = await storage.taskExists('123456', 1);
      expect(exists).toBe(true);

      const tasks = await storage.getTasks({ chat_id: '123456' });
      expect(tasks[0].title).toBe('Updated task');
      expect(tasks[0].description).toBe('Updated description');
      expect(tasks[0].raw_text).toBe('Updated text');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      await storage.initialize();

      const task = await storage.saveTask(createTaskData());

      expect(task.status).toBe('open');

      const success = await storage.updateTaskStatus(task.id, 'done');
      expect(success).toBe(true);

      const updatedTask = await storage.getTaskById(task.id);
      expect(updatedTask?.status).toBe('done');
    });

    it('should support in_progress status', async () => {
      await storage.initialize();

      const task = await storage.saveTask(createTaskData());

      const success = await storage.updateTaskStatus(task.id, 'in_progress');
      expect(success).toBe(true);

      const updatedTask = await storage.getTaskById(task.id);
      expect(updatedTask?.status).toBe('in_progress');
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

      const task = await storage.saveTask(createTaskData());

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
