import { NextRequest, NextResponse } from 'next/server';
import { getTaskStorage } from '@/lib/taskStorage';
import { TaskFilter, TaskStatus, TaskSource } from '@/lib/taskTypes';

export const dynamic = 'force-dynamic';

// Track last error log to reduce noise
const lastErrorLog = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as TaskStatus | null;
    const chat_id = searchParams.get('chat_id');
    const source = searchParams.get('source') as TaskSource | null;
    const search = searchParams.get('search');

    const filter: TaskFilter = {};
    if (status) {
      filter.status = status;
    }
    if (chat_id) {
      filter.chat_id = chat_id;
    }
    if (source) {
      filter.source = source;
    }
    if (search) {
      filter.search = search;
    }

    const storage = getTaskStorage();

    // Add detailed logging
    console.log('[Tasks API] Initializing storage...');
    await storage.initialize();
    console.log('[Tasks API] Storage initialized successfully');

    console.log('[Tasks API] Fetching tasks with filter:', filter);
    const tasks = await storage.getTasks(filter);
    console.log('[Tasks API] Tasks fetched:', tasks.length);

    return NextResponse.json({ ok: true, tasks });
  } catch (error: unknown) {
    const err = error as Error & { code?: string; stack?: string };
    
    // Only log detailed error once per minute to reduce noise
    const errorKey = `${err.message}:${err.code}`;
    const now = Date.now();
    const shouldLogDetailed = !lastErrorLog.has(errorKey) || 
                              now - (lastErrorLog.get(errorKey) || 0) > 60000;
    
    if (shouldLogDetailed) {
      console.error('[Tasks API] Error fetching tasks:', error);
      console.error('[Tasks API] Error code:', err.code);
      console.error('[Tasks API] Error stack:', err.stack);
      lastErrorLog.set(errorKey, now);
    }

    // Sanitize error message to avoid leaking sensitive information
    let errorMessage = 'Failed to fetch tasks';
    if (process.env.NODE_ENV === 'development') {
      // Only include basic error info without connection details
      errorMessage = err.message.replace(/password[^\s]*/gi, 'password=***');
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch tasks',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
