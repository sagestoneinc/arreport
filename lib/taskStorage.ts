import { ITaskStorage } from './taskStorageInterface';
import { SQLiteTaskStorage } from './taskStorageSqlite';
import { MySQLTaskStorage } from './taskStorageMysql';
import { Task, TaskFilter } from './taskTypes';

// Singleton instance
let storage: ITaskStorage | null = null;

/**
 * Wrapper that provides fallback support for MySQL storage.
 * When MySQL fails, it automatically falls back to in-memory SQLite.
 */
export class FallbackTaskStorage implements ITaskStorage {
  private primary: MySQLTaskStorage;
  private fallback: SQLiteTaskStorage;
  private useFallback: boolean = false;

  constructor() {
    this.primary = new MySQLTaskStorage();
    this.fallback = new SQLiteTaskStorage(true); // in-memory SQLite
  }

  private getActiveStorage(): ITaskStorage {
    return this.useFallback ? this.fallback : this.primary;
  }

  async initialize(): Promise<void> {
    if (this.useFallback) {
      // Already using fallback, just initialize it
      await this.fallback.initialize();
      return;
    }

    try {
      await this.primary.initialize();
    } catch {
      // MySQL failed, switch to fallback
      console.warn('[TaskStorage] MySQL initialization failed, falling back to in-memory SQLite');
      console.warn('[TaskStorage] Note: Data will NOT persist across restarts when using fallback storage');
      this.useFallback = true;
      await this.fallback.initialize();
    }
  }

  async saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> {
    await this.initialize();
    return this.getActiveStorage().saveTask(task);
  }

  async updateTask(chatId: string, messageId: number, description: string, rawText: string): Promise<void> {
    await this.initialize();
    return this.getActiveStorage().updateTask(chatId, messageId, description, rawText);
  }

  async taskExists(chatId: string, messageId: number): Promise<boolean> {
    await this.initialize();
    return this.getActiveStorage().taskExists(chatId, messageId);
  }

  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    await this.initialize();
    return this.getActiveStorage().getTasks(filter);
  }

  async getTaskById(id: string): Promise<Task | null> {
    await this.initialize();
    return this.getActiveStorage().getTaskById(id);
  }

  async updateTaskStatus(id: string, status: 'open' | 'done'): Promise<boolean> {
    await this.initialize();
    return this.getActiveStorage().updateTaskStatus(id, status);
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.initialize();
    return this.getActiveStorage().deleteTask(id);
  }

  async close(): Promise<void> {
    await this.primary.close();
    await this.fallback.close();
  }

  isUsingFallback(): boolean {
    return this.useFallback;
  }
}

export function getTaskStorage(): ITaskStorage {
  if (!storage) {
    const storageType = process.env.TASKS_STORAGE || 'sqlite';

    if (storageType === 'mysql') {
      // Use FallbackTaskStorage which wraps MySQL with SQLite fallback
      storage = new FallbackTaskStorage();
    } else if (storageType === 'memory') {
      storage = new SQLiteTaskStorage(true);
    } else {
      // Default to SQLite (includes 'sqlite' and 'file')
      storage = new SQLiteTaskStorage(false);
    }
  }
  return storage;
}

/**
 * Check if the task storage is using fallback mode.
 * Returns true if MySQL failed and we're using in-memory SQLite.
 */
export function isUsingFallbackStorage(): boolean {
  if (storage instanceof FallbackTaskStorage) {
    return storage.isUsingFallback();
  }
  return false;
}
