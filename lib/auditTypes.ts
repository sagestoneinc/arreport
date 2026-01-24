/**
 * Audit Log Types
 */

export type AuditActionType = 
  | 'GENERATE_REPORT' 
  | 'SEND_TELEGRAM' 
  | 'TASK_CREATE' 
  | 'TASK_UPDATE';

export type AuditStatus = 'SUCCESS' | 'FAIL';

export interface AuditLogEntry {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  action_type: AuditActionType;
  report_slug: string | null;
  report_title: string | null;
  telegram_chat_id: string | null;
  telegram_chat_title: string | null;
  telegram_message_preview: string | null;
  telegram_payload_full: string | null;
  payload_hash: string | null;
  status: AuditStatus;
  error_message: string | null;
  metadata_json: string | null;
}

export interface AuditLogFilter {
  action_type?: AuditActionType;
  user_email?: string;
  report_slug?: string;
  status?: AuditStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAuditLogParams {
  user_id?: string | null;
  user_email?: string | null;
  action_type: AuditActionType;
  report_slug?: string | null;
  report_title?: string | null;
  telegram_chat_id?: string | null;
  telegram_chat_title?: string | null;
  telegram_payload?: string | null;
  status: AuditStatus;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
}
