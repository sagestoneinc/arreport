import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { Task, TaskFilter } from './taskTypes';
import { ITaskStorage } from './taskStorageInterface';

export class MySQLTaskStorage implements ITaskStorage {
  private pool: mysql.Pool | null = null;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // Use a single initialization promise to prevent race conditions
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    if (this.pool) {
      return;
    }

    // Railway provides MySQL environment variables with different naming conventions
    // Support both MYSQL_* and MYSQLHOST patterns
    const host = process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost';
    const port = parseInt(process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306');
    const user = process.env.MYSQL_USER || process.env.MYSQLUSER || 'root';
    const password = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '';
    const database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'arreport';

    console.log('[MySQL] Initializing connection to:', {
      host: host ? 'configured' : 'not set',
      port,
      user: user ? 'configured' : 'not set',
      database,
    });

    const config: mysql.PoolOptions = {
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000, // 10 seconds timeout for Railway
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    try {
      this.pool = mysql.createPool(config);

      // Test the connection by executing a simple query
      console.log('[MySQL] Testing database connection...');
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('[MySQL] Connection test successful');

      await this.initSchema();
      console.log('[MySQL] Database initialized successfully');
    } catch (error: unknown) {
      const err = error as Error & { code?: string; errno?: number; sqlState?: string };
      console.error('[MySQL] Failed to initialize database:', {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
      });

      // Clean up the pool if initialization failed
      if (this.pool) {
        await this.pool.end().catch((cleanupError) => {
          // Log cleanup error but don't throw - original error is more important
          console.error('[MySQL] Error during cleanup:', cleanupError);
        });
        this.pool = null;
      }

      throw new Error(`MySQL initialization failed: ${err.message}`);
    }
  }

  private async getPool(): Promise<mysql.Pool> {
    await this.initialize();
    if (!this.pool) {
      throw new Error(
        'Database pool not initialized. This indicates a bug in the initialization logic.'
      );
    }
    return this.pool;
  }

  private async initSchema(): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        created_at VARCHAR(50) NOT NULL,
        chat_id VARCHAR(255) NOT NULL,
        chat_title VARCHAR(255),
        message_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        name VARCHAR(255),
        description TEXT NOT NULL,
        status VARCHAR(10) NOT NULL DEFAULT 'open',
        raw_text TEXT NOT NULL,
        UNIQUE KEY unique_chat_message (chat_id, message_id),
        INDEX idx_tasks_status (status),
        INDEX idx_tasks_chat_id (chat_id),
        INDEX idx_tasks_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      console.log('[MySQL] Creating tasks table if not exists...');
      await this.pool.execute(createTableQuery);
      console.log('[MySQL] Tasks table ready');
    } catch (error: unknown) {
      const err = error as Error & { code?: string; sqlState?: string };
      console.error('[MySQL] Failed to create schema:', {
        message: err.message,
        code: err.code,
        sqlState: err.sqlState,
      });
      throw error;
    }
  }

  async saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> {
    const pool = await this.getPool();

    const id = randomUUID();
    const created_at = new Date().toISOString();
    const status = 'open';

    const query = `
      INSERT INTO tasks (
        id, created_at, chat_id, chat_title, message_id,
        user_id, username, name, description, status, raw_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
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
      task.raw_text,
    ]);

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
    description: string,
    rawText: string
  ): Promise<void> {
    const pool = await this.getPool();

    const query = `
      UPDATE tasks 
      SET description = ?, raw_text = ?
      WHERE chat_id = ? AND message_id = ?
    `;

    await pool.execute(query, [description, rawText, chatId, messageId]);
  }

  async taskExists(chatId: string, messageId: number): Promise<boolean> {
    const pool = await this.getPool();

    const query = `
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE chat_id = ? AND message_id = ?
    `;

    const [rows] = await pool.execute(query, [chatId, messageId]);
    const result = (rows as Array<{ count: number }>)[0];
    return result.count > 0;
  }

  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    const pool = await this.getPool();

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

    const [rows] = await pool.execute(query, params);
    return rows as Task[];
  }

  async getTaskById(id: string): Promise<Task | null> {
    const pool = await this.getPool();

    const query = 'SELECT * FROM tasks WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    const tasks = rows as Task[];
    return tasks.length > 0 ? tasks[0] : null;
  }

  async updateTaskStatus(id: string, status: 'open' | 'done'): Promise<boolean> {
    const pool = await this.getPool();

    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    const [result] = await pool.execute(query, [status, id]);
    const updateResult = result as mysql.ResultSetHeader;
    return updateResult.affectedRows > 0;
  }

  async deleteTask(id: string): Promise<boolean> {
    const pool = await this.getPool();

    const query = 'DELETE FROM tasks WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.initializationPromise = null;
    }
  }
}
