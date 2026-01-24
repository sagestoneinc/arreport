import { NextRequest, NextResponse } from 'next/server';
import { getTaskStorage } from '@/lib/taskStorage';
import { TaskFilter } from '@/lib/taskTypes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'open' | 'done' | null;
    const chat_id = searchParams.get('chat_id');

    const filter: TaskFilter = {};
    if (status) {
      filter.status = status;
    }
    if (chat_id) {
      filter.chat_id = chat_id;
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
    console.error('[Tasks API] Error fetching tasks:', error);
    console.error('[Tasks API] Error code:', err.code);
    console.error('[Tasks API] Error stack:', err.stack);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to fetch tasks',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined 
      },
      { status: 500 }
    );
  }
}
