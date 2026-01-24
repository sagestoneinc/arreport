import { ITaskStorage } from './taskStorageInterface';
import { SQLiteTaskStorage } from './taskStorageSqlite';
import { MySQLTaskStorage } from './taskStorageMysql';

// Singleton instance
let storage: ITaskStorage | null = null;

export function getTaskStorage(): ITaskStorage {
  if (!storage) {
    const storageType = process.env.TASKS_STORAGE || 'sqlite';

    if (storageType === 'mysql') {
      storage = new MySQLTaskStorage();
    } else if (storageType === 'memory') {
      storage = new SQLiteTaskStorage(true);
    } else {
      // Default to SQLite (includes 'sqlite' and 'file')
      storage = new SQLiteTaskStorage(false);
    }
  }
  return storage;
}
