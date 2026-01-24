import { NextResponse } from 'next/server';
import { getTaskStorage } from '@/lib/taskStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Restrict debug endpoint to development and test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      ok: false,
      error: 'Debug endpoint not available in production'
    }, { status: 403 });
  }

  try {
    const storageType = process.env.TASKS_STORAGE || 'sqlite';
    
    // Log configuration (without sensitive data)
    console.log('[Debug] Storage Type:', storageType);
    console.log('[Debug] MySQL Host:', process.env.MYSQL_HOST || process.env.MYSQLHOST ? 'Set' : 'Not Set');
    console.log('[Debug] MySQL Database:', process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE ? 'Set' : 'Not Set');
    
    // Try to initialize
    const storage = getTaskStorage();
    await storage.initialize();
    
    // Try to get tasks
    const tasks = await storage.getTasks({});
    
    return NextResponse.json({
      ok: true,
      storage_type: storageType,
      tasks_count: tasks.length,
      can_read: true,
      message: 'Storage is working!',
      mysql_host: (process.env.MYSQL_HOST || process.env.MYSQLHOST) ? 'configured' : 'missing',
      mysql_database: (process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE) ? 'configured' : 'missing',
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error('[Debug] Storage error:', error);
    return NextResponse.json({
      ok: false,
      storage_type: process.env.TASKS_STORAGE || 'sqlite',
      error: err.message,
      error_code: err.code,
      mysql_configured: !!(process.env.MYSQL_HOST || process.env.MYSQLHOST),
    }, { status: 500 });
  }
}
