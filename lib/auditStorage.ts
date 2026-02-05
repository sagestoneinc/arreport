/**
 * Audit Log Storage using SQLite
 * Records key events for accountability and debugging
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID, createHash } from 'crypto';
import { AuditLogEntry, AuditLogFilter, CreateAuditLogParams } from './auditTypes';
import { resolveDataDir } from './storagePaths';

let db: Database.Database | null = null;
let initialized = false;

function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const explicitDbPath = process.env.AUDIT_DB_PATH?.trim();
  if (explicitDbPath) {
    if (explicitDbPath === ':memory:' || explicitDbPath.toLowerCase() === 'memory') {
      db = new Database(':memory:');
      return db;
    }
    try {
      fs.mkdirSync(path.dirname(explicitDbPath), { recursive: true });
      db = new Database(explicitDbPath);
      return db;
    } catch (error) {
      console.warn(`[AuditStorage] Failed to open AUDIT_DB_PATH at "${explicitDbPath}", falling back to in-memory.`, error);
      db = new Database(':memory:');
      return db;
    }
  }

  try {
    const { dir, isTemp } = resolveDataDir();
    if (isTemp) {
      console.warn('[AuditStorage] Using temporary data directory; audit logs will not persist across restarts.');
    }
    const dbPath = path.join(dir, 'audit.db');
    db = new Database(dbPath);
  } catch (error) {
    console.warn('[AuditStorage] Failed to initialize file-backed audit storage, falling back to in-memory.', error);
    db = new Database(':memory:');
  }
  
  return db;
}

function initSchema(): void {
  if (initialized) {
    return;
  }

  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      user_id TEXT,
      user_email TEXT,
      action_type TEXT NOT NULL,
      report_slug TEXT,
      report_title TEXT,
      telegram_chat_id TEXT,
      telegram_chat_title TEXT,
      telegram_message_preview TEXT,
      telegram_payload_full TEXT,
      payload_hash TEXT,
      status TEXT NOT NULL,
      error_message TEXT,
      metadata_json TEXT
    )
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_action_type ON audit_logs(action_type);
    CREATE INDEX IF NOT EXISTS idx_audit_user_email ON audit_logs(user_email);
    CREATE INDEX IF NOT EXISTS idx_audit_report_slug ON audit_logs(report_slug);
    CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_logs(status);
  `);

  initialized = true;
}

/**
 * Create a hash of the telegram payload for deduplication/verification
 */
function hashPayload(payload: string): string {
  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Create a preview of the telegram message (first 200 chars)
 */
function createPreview(payload: string | null | undefined, maxLength: number = 200): string | null {
  if (!payload) return null;
  if (payload.length <= maxLength) return payload;
  return payload.substring(0, maxLength) + '...';
}

/**
 * Create a new audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<AuditLogEntry> {
  initSchema();
  const database = getDb();

  const id = randomUUID();
  const created_at = new Date().toISOString();
  
  // Calculate hash and preview if telegram payload is provided
  const payload_hash = params.telegram_payload ? hashPayload(params.telegram_payload) : null;
  const telegram_message_preview = createPreview(params.telegram_payload);
  
  // For SEND_TELEGRAM, store full payload; for others, truncate if too large
  let telegram_payload_full: string | null = null;
  if (params.telegram_payload) {
    if (params.action_type === 'SEND_TELEGRAM') {
      // Store full payload for SEND_TELEGRAM
      telegram_payload_full = params.telegram_payload;
    } else if (params.telegram_payload.length <= 5000) {
      // Store if reasonably sized
      telegram_payload_full = params.telegram_payload;
    }
  }

  const stmt = database.prepare(`
    INSERT INTO audit_logs (
      id, created_at, user_id, user_email, action_type,
      report_slug, report_title, telegram_chat_id, telegram_chat_title,
      telegram_message_preview, telegram_payload_full, payload_hash,
      status, error_message, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const metadata_json = params.metadata ? JSON.stringify(params.metadata) : null;

  stmt.run(
    id,
    created_at,
    params.user_id || null,
    params.user_email || null,
    params.action_type,
    params.report_slug || null,
    params.report_title || null,
    params.telegram_chat_id || null,
    params.telegram_chat_title || null,
    telegram_message_preview,
    telegram_payload_full,
    payload_hash,
    params.status,
    params.error_message || null,
    metadata_json
  );

  return {
    id,
    created_at,
    user_id: params.user_id || null,
    user_email: params.user_email || null,
    action_type: params.action_type,
    report_slug: params.report_slug || null,
    report_title: params.report_title || null,
    telegram_chat_id: params.telegram_chat_id || null,
    telegram_chat_title: params.telegram_chat_title || null,
    telegram_message_preview,
    telegram_payload_full,
    payload_hash,
    status: params.status,
    error_message: params.error_message || null,
    metadata_json
  };
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filter?: AuditLogFilter): Promise<AuditLogEntry[]> {
  initSchema();
  const database = getDb();

  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: (string | number)[] = [];

  if (filter?.action_type) {
    query += ' AND action_type = ?';
    params.push(filter.action_type);
  }

  if (filter?.user_email) {
    query += ' AND user_email = ?';
    params.push(filter.user_email);
  }

  if (filter?.report_slug) {
    query += ' AND report_slug = ?';
    params.push(filter.report_slug);
  }

  if (filter?.status) {
    query += ' AND status = ?';
    params.push(filter.status);
  }

  if (filter?.date_from) {
    query += ' AND created_at >= ?';
    params.push(filter.date_from);
  }

  if (filter?.date_to) {
    query += ' AND created_at <= ?';
    params.push(filter.date_to);
  }

  query += ' ORDER BY created_at DESC';

  if (filter?.limit) {
    query += ' LIMIT ?';
    params.push(filter.limit);
  }

  if (filter?.offset) {
    query += ' OFFSET ?';
    params.push(filter.offset);
  }

  const stmt = database.prepare(query);
  return stmt.all(...params) as AuditLogEntry[];
}

/**
 * Get a single audit log entry by ID
 */
export async function getAuditLogById(id: string): Promise<AuditLogEntry | null> {
  initSchema();
  const database = getDb();

  const stmt = database.prepare('SELECT * FROM audit_logs WHERE id = ?');
  const result = stmt.get(id) as AuditLogEntry | undefined;
  return result || null;
}

/**
 * Get unique user emails from audit logs (for filter dropdown)
 */
export async function getAuditUsers(): Promise<string[]> {
  initSchema();
  const database = getDb();

  const stmt = database.prepare('SELECT DISTINCT user_email FROM audit_logs WHERE user_email IS NOT NULL ORDER BY user_email');
  const results = stmt.all() as Array<{ user_email: string }>;
  return results.map(r => r.user_email);
}

/**
 * Get unique report slugs from audit logs (for filter dropdown)
 */
export async function getAuditReportSlugs(): Promise<string[]> {
  initSchema();
  const database = getDb();

  const stmt = database.prepare('SELECT DISTINCT report_slug FROM audit_logs WHERE report_slug IS NOT NULL ORDER BY report_slug');
  const results = stmt.all() as Array<{ report_slug: string }>;
  return results.map(r => r.report_slug);
}
