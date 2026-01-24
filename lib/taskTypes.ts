export interface Task {
  id: string;
  created_at: string;
  chat_id: string;
  chat_title?: string;
  message_id: number;
  user_id: string;
  username?: string;
  name?: string;
  description: string;
  status: 'open' | 'done';
  raw_text: string;
}

export interface TaskFilter {
  status?: 'open' | 'done';
  chat_id?: string;
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
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}
