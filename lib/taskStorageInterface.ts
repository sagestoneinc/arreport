import { Task, TaskFilter, TaskStatus } from './taskTypes';

/**
 * Interface for task storage implementations
 */
export interface ITaskStorage {
  initialize(): Promise<void>;
  saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task>;
  updateTask(
    chatId: string,
    messageId: number,
    title: string,
    description: string | undefined,
    rawText: string
  ): Promise<void>;
  taskExists(chatId: string, messageId: number): Promise<boolean>;
  findDuplicateOpenTask(title: string): Promise<Task | null>;
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<boolean>;
  deleteTask(id: string): Promise<boolean>;
  close(): Promise<void>;
}
