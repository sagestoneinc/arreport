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
    const tasks = storage.getTasks(filter);

    return NextResponse.json({ ok: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
