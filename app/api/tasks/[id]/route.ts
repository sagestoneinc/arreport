import { NextRequest, NextResponse } from 'next/server';
import { getTaskStorage } from '@/lib/taskStorage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || (status !== 'open' && status !== 'done')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid status. Must be "open" or "done"' },
        { status: 400 }
      );
    }

    const storage = getTaskStorage();
    await storage.initialize();
    const success = await storage.updateTaskStatus(id, status);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = await storage.getTaskById(id);
    return NextResponse.json({ ok: true, task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const storage = getTaskStorage();
    await storage.initialize();
    const success = await storage.deleteTask(id);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
