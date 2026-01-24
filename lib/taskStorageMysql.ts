import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { Task, TaskFilter, TaskStatus } from './taskTypes';
import { ITaskStorage } from './taskStorageInterface';

export class MySQLTaskStorage implements ITaskStorage {
  private pool: mysql.Pool | null = null;
  private initializationPromise: Promise<void> | null = null;
  private initializationFailed: boolean = false;
  private lastFailureTime: number = 0;
  private retryDelayMs: number = 30000; // 30 seconds between retries

  async initialize(): Promise<void> {
    // If initialization previously failed, check if enough time has passed before retrying
    if (this.initializationFailed) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure < this.retryDelayMs) {
        throw new Error(
          `MySQL initialization failed previously. Will retry in ${Math.ceil((this.retryDelayMs - timeSinceFailure) / 1000)} seconds.`
        );
      }
      // Reset for retry
      this.initializationFailed = false;
      this.initializationPromise = null;
    }

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
      
      // Reset failure state on successful initialization
      this.initializationFailed = false;
      this.lastFailureTime = 0;
    } catch (error: unknown) {
      const err = error as Error & { code?: string; errno?: number; sqlState?: string };
      
      // Mark initialization as failed and record the time
      this.initializationFailed = true;
      this.lastFailureTime = Date.now();
      
      // Provide detailed error message based on error code
      let errorMessage = err.message;
      if (err.code === 'ECONNREFUSED') {
        errorMessage = `Cannot connect to MySQL server at ${host}:${port}. Please ensure MySQL is running and accessible.`;
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = `Access denied for MySQL user '${user}'. Please check your credentials.`;
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = `MySQL host '${host}' not found. Please check your MYSQL_HOST configuration.`;
      } else if (err.code === 'ETIMEDOUT') {
        errorMessage = `Connection to MySQL server at ${host}:${port} timed out. Please ensure the server is reachable and not overloaded.`;
      }

      console.error('[MySQL] Failed to initialize database:', {
        message: errorMessage,
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

      throw new Error(`MySQL initialization failed: ${errorMessage}`);
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

    // Check if table exists and needs migration
    try {
      const [columns] = await this.pool.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks'"
      );
      const existingColumns = (columns as Array<{ COLUMN_NAME: string }>).map(
        (col) => col.COLUMN_NAME
      );

      if (existingColumns.length > 0) {
        // Table exists, check for new columns
        if (!existingColumns.includes('title')) {
          console.log('[MySQL] Adding title column...');
          await this.pool.execute(`ALTER TABLE tasks ADD COLUMN title VARCHAR(255) DEFAULT ''`);
          await this.pool.execute(
            `UPDATE tasks SET title = SUBSTRING(description, 1, 255) WHERE title = '' OR title IS NULL`
          );
        }
        if (!existingColumns.includes('source')) {
          console.log('[MySQL] Adding source column...');
          await this.pool.execute(
            `ALTER TABLE tasks ADD COLUMN source VARCHAR(20) DEFAULT 'telegram'`
          );
        }
        if (!existingColumns.includes('created_by')) {
          console.log('[MySQL] Adding created_by column...');
          await this.pool.execute(
            `ALTER TABLE tasks ADD COLUMN created_by VARCHAR(255) DEFAULT 'unknown'`
          );
          await this.pool.execute(
            `UPDATE tasks SET created_by = COALESCE(username, name, 'unknown') WHERE created_by = 'unknown' OR created_by IS NULL`
          );
        }
      }
    } catch {
      // Table doesn't exist, will be created below
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT '',
        description TEXT,
        source VARCHAR(20) NOT NULL DEFAULT 'telegram',
        created_by VARCHAR(255) NOT NULL DEFAULT 'unknown',
        created_at VARCHAR(50) NOT NULL,
        chat_id VARCHAR(255) NOT NULL,
        chat_title VARCHAR(255),
        message_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        name VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        raw_text TEXT NOT NULL,
        UNIQUE KEY unique_chat_message (chat_id, message_id),
        INDEX idx_tasks_status (status),
        INDEX idx_tasks_chat_id (chat_id),
        INDEX idx_tasks_created_at (created_at),
        INDEX idx_tasks_source (source),
        INDEX idx_tasks_title (title)
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
    const status: TaskStatus = 'open';

    const query = `
      INSERT INTO tasks (
        id, title, description, source, created_by, created_at,
        chat_id, chat_title, message_id, user_id, username, name, 
        status, raw_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
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
    title: string,
    description: string | undefined,
    rawText: string
  ): Promise<void> {
    const pool = await this.getPool();

    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, raw_text = ?
      WHERE chat_id = ? AND message_id = ?
    `;

    await pool.execute(query, [title, description || null, rawText, chatId, messageId]);
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

  async findDuplicateOpenTask(title: string): Promise<Task | null> {
    const pool = await this.getPool();

    const query = `
      SELECT * FROM tasks 
      WHERE LOWER(title) = LOWER(?) AND status = 'open'
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [title]);
    const tasks = rows as Task[];
    return tasks.length > 0 ? tasks[0] : null;
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

  async updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
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
