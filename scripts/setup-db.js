#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script initializes the database tables for the Task Collector.
 *
 * Usage:
 *   npm run setup:db
 *   # or
 *   node scripts/setup-db.js
 *
 * Environment variables:
 *   - TASKS_STORAGE: "sqlite" | "mysql" | "memory" (default: sqlite)
 *   - For MySQL: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const path = require('path');
const fs = require('fs');

const storageType = process.env.TASKS_STORAGE || 'sqlite';

console.log('🗄️  Database Setup Script');
console.log(`📋 Storage type: ${storageType}`);
console.log('');

async function setupSqlite() {
  const Database = require('better-sqlite3');

  // Create /data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'tasks.db');
  console.log('🔌 Initializing SQLite database...');
  const db = new Database(dbPath);

  // Create tasks table
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

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_chat_id ON tasks(chat_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
  `);

  db.close();
  console.log('✅ SQLite database initialized successfully!');
  console.log(`📝 Database location: ${dbPath}`);
  console.log('📝 Tables created: tasks');
}

async function setupMysql() {
  const mysql = require('mysql2/promise');

  // Support both MYSQL_* and MYSQLHOST patterns (Railway compatibility)
  const host = process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306');
  const user = process.env.MYSQL_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'arreport';

  console.log('🔌 Connecting to MySQL...');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   User: ${user}`);
  console.log(`   Database: ${database}`);

  if (!password) {
    console.log('⚠️  Warning: No MySQL password set. This may be insecure in production.');
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    connectTimeout: 10000,
  });

  // Create tasks table
  await connection.execute(`
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
  `);

  await connection.end();
  console.log('✅ MySQL database initialized successfully!');
  console.log('📝 Tables created: tasks');
}

/**
 * Format an error for display.
 * MySQL errors from mysql2 may have an empty message but contain useful info in error.code.
 * @param {Error} error - The error object
 * @returns {string} A formatted error message
 */
function formatError(error) {
  // If we have a non-empty message, use it
  if (error.message && error.message.trim()) {
    return error.message;
  }

  // mysql2 errors often have a code but empty message (e.g., ECONNREFUSED)
  if (error.code) {
    switch (error.code) {
      case 'ECONNREFUSED':
        return `Connection refused (${error.code}). MySQL server may not be running or is not accessible.`;
      case 'ENOTFOUND':
        return `Host not found (${error.code}). Check your MySQL host configuration.`;
      case 'ETIMEDOUT':
        return `Connection timed out (${error.code}). MySQL server may be slow or unreachable.`;
      case 'ER_ACCESS_DENIED_ERROR':
        return `Access denied (${error.code}). Check your MySQL credentials.`;
      case 'ER_BAD_DB_ERROR':
        return `Database does not exist (${error.code}). Create the database first.`;
      default:
        return `Database error: ${error.code}`;
    }
  }

  // Fallback to string representation
  return String(error) || 'Unknown error';
}

async function main() {
  try {
    if (storageType === 'mysql') {
      await setupMysql();
    } else if (storageType === 'memory') {
      console.log('💾 Memory storage does not require initialization.');
      console.log('   (Data will be stored in memory and lost on restart)');
    } else {
      // SQLite (default)
      await setupSqlite();
    }
    console.log('');
    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('');
    console.error('❌ Database setup failed:', formatError(error));
    console.error('');
    console.error('💡 Troubleshooting tips:');
    if (storageType === 'mysql') {
      console.error('   - Verify MySQL is running and accessible');
      console.error('   - Check MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
      console.error('   - Ensure the database exists: CREATE DATABASE arreport;');
    } else {
      console.error('   - Ensure the data/ directory is writable');
      console.error('   - Check disk space availability');
    }
    process.exit(1);
  }
}

main();
