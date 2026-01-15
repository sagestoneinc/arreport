export interface MetricData {
  sales: number;
  declines: number;
  approvalRate?: number; // calculated or manual override
}

export interface MIDData {
  id: string;
  midName: string;
  sales: number;
  declines: number;
}

export interface ARUpdateData {
  date: string; // MM/DD/YYYY
  time: string; // h:mm AM/PM
  timezone: string;
  keyAction: string;
  dailySummary: {
    overall: MetricData;
    visa: MetricData;
    mc: MetricData;
  };
  hourlyUpdate: {
    overall: MetricData;
    visa: MetricData;
    mc: MetricData;
  };
  visaTopMids: MIDData[];
  visaWorstMids: MIDData[];
  mastercardTopMids: MIDData[];
  mastercardWorstMids: MIDData[];
}