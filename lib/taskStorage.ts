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
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.primary = new MySQLTaskStorage();
    this.fallback = new SQLiteTaskStorage(true); // in-memory SQLite
  }

  private getActiveStorage(): ITaskStorage {
    return this.useFallback ? this.fallback : this.primary;
  }

  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.initialized) {
      return;
    }

    // Use a single initialization promise to prevent race conditions
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      await this.primary.initialize();
      this.initialized = true;
    } catch {
      // MySQL failed, switch to fallback
      console.warn('[TaskStorage] MySQL initialization failed, falling back to in-memory SQLite');
      console.warn('[TaskStorage] Note: Data will NOT persist across restarts when using fallback storage');
      this.useFallback = true;
      await this.fallback.initialize();
      this.initialized = true;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> {
    await this.ensureInitialized();
    return this.getActiveStorage().saveTask(task);
  }

  async updateTask(chatId: string, messageId: number, description: string, rawText: string): Promise<void> {
    await this.ensureInitialized();
    return this.getActiveStorage().updateTask(chatId, messageId, description, rawText);
  }

  async taskExists(chatId: string, messageId: number): Promise<boolean> {
    await this.ensureInitialized();
    return this.getActiveStorage().taskExists(chatId, messageId);
  }

  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    await this.ensureInitialized();
    return this.getActiveStorage().getTasks(filter);
  }

  async getTaskById(id: string): Promise<Task | null> {
    await this.ensureInitialized();
    return this.getActiveStorage().getTaskById(id);
  }

  async updateTaskStatus(id: string, status: 'open' | 'done'): Promise<boolean> {
    await this.ensureInitialized();
    return this.getActiveStorage().updateTaskStatus(id, status);
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.getActiveStorage().deleteTask(id);
  }

  async close(): Promise<void> {
    // Safely close both storages, ignoring errors from uninitialized storage
    try {
      await this.primary.close();
    } catch {
      // Primary may not have been initialized, ignore close errors
    }
    try {
      await this.fallback.close();
    } catch {
      // Fallback may not have been initialized, ignore close errors
    }
    this.initialized = false;
    this.initializationPromise = null;
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
