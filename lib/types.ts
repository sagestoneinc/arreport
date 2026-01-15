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

export interface AppState {
  dateISO: string; // YYYY-MM-DD
  timeHHMM: string; // HH:mm
  threshold: number;
  dailySummary: Summary;
  visaMids: MidRow[];
  mcMids: MidRow[];
  notes: string;
}