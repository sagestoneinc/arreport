import { NextRequest, NextResponse } from 'next/server';
import { getTaskStorage } from '@/lib/taskStorage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // In production, require authentication via DEBUG_API_KEY
  if (process.env.NODE_ENV === 'production') {
    const debugApiKey = process.env.DEBUG_API_KEY;

    // If no DEBUG_API_KEY is configured, deny access
    if (!debugApiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Debug endpoint not available in production',
        },
        { status: 403 }
      );
    }

    // Check for API key in Authorization header or query parameter
    const authHeader = request.headers.get('authorization');
    const queryKey = request.nextUrl.searchParams.get('key');
    const providedKey = authHeader?.replace('Bearer ', '') || queryKey;

    if (providedKey !== debugApiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }
  }

  try {
    const storageType = process.env.TASKS_STORAGE || 'sqlite';
    const isProduction = process.env.NODE_ENV === 'production';

    // Log configuration (without sensitive data)
    console.log('[Debug] Storage Type:', storageType);
    console.log(
      '[Debug] MySQL Host:',
      process.env.MYSQL_HOST || process.env.MYSQLHOST ? 'Set' : 'Not Set'
    );
    console.log(
      '[Debug] MySQL Database:',
      process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE ? 'Set' : 'Not Set'
    );

    // Try to initialize
    const storage = getTaskStorage();
    await storage.initialize();

    // Try to get tasks
    const tasks = await storage.getTasks({});

    // In production, return sanitized information only
    if (isProduction) {
      return NextResponse.json({
        ok: true,
        storage_type: storageType,
        tasks_count: tasks.length,
        can_read: true,
        message: 'Storage is working!',
        // Don't expose configuration details in production
      });
    }

    // In development, return full debug information
    return NextResponse.json({
      ok: true,
      storage_type: storageType,
      tasks_count: tasks.length,
      can_read: true,
      message: 'Storage is working!',
      mysql_host: process.env.MYSQL_HOST || process.env.MYSQLHOST ? 'configured' : 'missing',
      mysql_database:
        process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE ? 'configured' : 'missing',
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    const isProduction = process.env.NODE_ENV === 'production';
    console.error('[Debug] Storage error:', error);

    // Sanitize error messages in production
    const errorMessage = isProduction ? 'Storage initialization failed' : err.message;

    return NextResponse.json(
      {
        ok: false,
        storage_type: process.env.TASKS_STORAGE || 'sqlite',
        error: errorMessage,
        // Only include detailed error info in development
        ...(isProduction
          ? {}
          : {
              error_code: err.code,
              mysql_configured: !!(process.env.MYSQL_HOST || process.env.MYSQLHOST),
            }),
      },
      { status: 500 }
    );
  }
}
