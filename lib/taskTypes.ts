export type TaskStatus = 'open' | 'in_progress' | 'done';
export type TaskSource = 'telegram' | 'web';

export interface Task {
  id: string;
  title: string;
  description?: string;
  source: TaskSource;
  created_by: string;
  created_at: string;
  chat_id: string;
  chat_title?: string;
  message_id: number;
  user_id: string;
  username?: string;
  name?: string;
  status: TaskStatus;
  raw_text: string;
}

export interface TaskFilter {
  status?: TaskStatus;
  chat_id?: string;
  source?: TaskSource;
  search?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
  };
  text?: string;
  date: number;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
  }>;
  // Forwarded message fields
  forward_from?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  forward_from_chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
  };
  forward_from_message_id?: number;
  forward_date?: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}
