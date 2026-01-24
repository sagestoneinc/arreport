import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Task, TaskFilter } from './taskTypes';
import { ITaskStorage } from './taskStorageInterface';

export class SQLiteTaskStorage implements ITaskStorage {
  private db: Database.Database | null = null;
  private useMemory: boolean;
  private initialized: boolean = false;

  constructor(useMemory: boolean = false) {
    this.useMemory = useMemory;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    // Trigger database creation and schema initialization
    this.getDb();
    this.initialized = true;
  }

  private getDb(): Database.Database {
    if (this.db) {
      return this.db;
    }

    if (this.useMemory) {
      this.db = new Database(':memory:');
    } else {
      // Create /data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = path.join(dataDir, 'tasks.db');
      this.db = new Database(dbPath);
    }

    // Initialize schema
    this.initSchema();
    return this.db;
  }

  private initSchema(): void {
    const db = this.db!;
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        chat_title TEXT,
        message_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT,
        name TEXT,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        raw_text TEXT NOT NULL,
        UNIQUE(chat_id, message_id)
      )
    `);

    // Create indexes for better query performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_chat_id ON tasks(chat_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
    `);
  }

  async saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> {
    const db = this.getDb();
    
    const id = randomUUID();
    const created_at = new Date().toISOString();
    const status = 'open';

    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, created_at, chat_id, chat_title, message_id,
        user_id, username, name, description, status, raw_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      created_at,
      task.chat_id,
      task.chat_title || null,
      task.message_id,
      task.user_id,
      task.username || null,
      task.name || null,
      task.description,
      status,
      task.raw_text
    );

    return {
      id,
      created_at,
      status,
      ...task,
    };
  }

  async updateTask(chatId: string, messageId: number, description: string, rawText: string): Promise<void> {
    const db = this.getDb();
    
    const stmt = db.prepare(`
      UPDATE tasks 
      SET description = ?, raw_text = ?
      WHERE chat_id = ? AND message_id = ?
    `);

    stmt.run(description, rawText, chatId, messageId);
  }

  async taskExists(chatId: string, messageId: number): Promise<boolean> {
    const db = this.getDb();
    
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE chat_id = ? AND message_id = ?
    `);

    const result = stmt.get(chatId, messageId) as { count: number };
    return result.count > 0;
  }

  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    const db = this.getDb();
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: (string | number)[] = [];

    if (filter?.status) {
      query += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter?.chat_id) {
      query += ' AND chat_id = ?';
      params.push(filter.chat_id);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Task[];
  }

  async getTaskById(id: string): Promise<Task | null> {
    const db = this.getDb();
    
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const result = stmt.get(id) as Task | undefined;
    return result || null;
  }

  async updateTaskStatus(id: string, status: 'open' | 'done'): Promise<boolean> {
    const db = this.getDb();
    
    const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);
    return result.changes > 0;
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = this.getDb();
    
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
