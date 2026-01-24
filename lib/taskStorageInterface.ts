import { Task, TaskFilter } from './taskTypes';

/**
 * Interface for task storage implementations
 */
export interface ITaskStorage {
  initialize(): Promise<void>;
  saveTask(task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task>;
  updateTask(chatId: string, messageId: number, description: string, rawText: string): Promise<void>;
  taskExists(chatId: string, messageId: number): Promise<boolean>;
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  updateTaskStatus(id: string, status: 'open' | 'done'): Promise<boolean>;
  deleteTask(id: string): Promise<boolean>;
  close(): Promise<void>;
}
