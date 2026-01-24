export interface MidRow {
  id: string;
  name: string;
  sales: number;
  declines: number;
}

export interface Summary {
  sales: number;
  declines: number;
}

export type TemplateType =
  | 'template-a'
  | 'template-b'
  | 'approval-rate-hourly'
  | 'daily-batch-reruns'
  | 'daily-summary-rebills'
  | 'mint-additional-sales';

export interface AppState {
  templateType: TemplateType;
  dateISO: string; // YYYY-MM-DD
  timeHHMM: string; // HH:mm
  timeEndHHMM?: string; // HH:mm for time range
  threshold: number;
  dailySummary: Summary;
  visaMids: MidRow[];
  mcMids: MidRow[];
  notes: string;
}
