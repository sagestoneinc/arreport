import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Task, TaskFilter, TaskStatus } from './taskTypes';
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

    // Check if we need to migrate the schema
    const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
    const existingColumns = tableInfo.map((col) => col.name);
    const hasTitle = existingColumns.includes('title');
    const hasSource = existingColumns.includes('source');
    const hasCreatedBy = existingColumns.includes('created_by');

    if (tableInfo.length > 0 && (!hasTitle || !hasSource || !hasCreatedBy)) {
      // Need to migrate existing table
      console.log('[SQLite] Migrating tasks table to add new columns...');
      
      if (!hasTitle) {
        db.exec(`ALTER TABLE tasks ADD COLUMN title TEXT DEFAULT ''`);
        // Backfill title from description
        db.exec(`UPDATE tasks SET title = description WHERE title = '' OR title IS NULL`);
      }
      if (!hasSource) {
        db.exec(`ALTER TABLE tasks ADD COLUMN source TEXT DEFAULT 'telegram'`);
      }
      if (!hasCreatedBy) {
        db.exec(`ALTER TABLE tasks ADD COLUMN created_by TEXT DEFAULT 'unknown'`);
        // Backfill created_by from username or name
        db.exec(`UPDATE tasks SET created_by = COALESCE(username, name, 'unknown') WHERE created_by = 'unknown' OR created_by IS NULL`);
      }
      console.log('[SQLite] Migration completed');
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        description TEXT,
        source TEXT NOT NULL DEFAULT 'telegram',
        created_by TEXT NOT NULL DEFAULT 'unknown',
        created_at TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        chat_title TEXT,
        message_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT,
        name TEXT,
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
      CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source);
      CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);
    `);
  }

  async saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> {
    const db = this.getDb();

    const id = randomUUID();
    const created_at = new Date().toISOString();
    const status: TaskStatus = 'open';

    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, source, created_by, created_at, 
        chat_id, chat_title, message_id, user_id, username, name, 
        status, raw_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      task.title,
      task.description || null,
      task.source,
      task.created_by,
      created_at,
      task.chat_id,
      task.chat_title || null,
      task.message_id,
      task.user_id,
      task.username || null,
      task.name || null,
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

  async updateTask(
    chatId: string,
    messageId: number,
    title: string,
    description: string | undefined,
    rawText: string
  ): Promise<void> {
    const db = this.getDb();

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, raw_text = ?
      WHERE chat_id = ? AND message_id = ?
    `);

    stmt.run(title, description || null, rawText, chatId, messageId);
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

  async findDuplicateOpenTask(title: string): Promise<Task | null> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT * FROM tasks 
      WHERE LOWER(title) = LOWER(?) AND status = 'open'
      LIMIT 1
    `);

    const result = stmt.get(title) as Task | undefined;
    return result || null;
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

    if (filter?.source) {
      query += ' AND source = ?';
      params.push(filter.source);
    }

    if (filter?.search) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)';
      const searchTerm = `%${filter.search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
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

  async updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
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
