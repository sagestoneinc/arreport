import { TEMPLATES } from '@/lib/templates';

export interface HistoryEntry {
  id: string;
  slug: string;
  templateName: string;
  message: string;
  createdAt: string;
}

const HISTORY_STORAGE_KEY = 'ar-report-history';

export function saveToHistory(slug: string, message: string): void {
  if (typeof window === 'undefined') return;

  const template = TEMPLATES.find((t) => t.slug === slug);
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    slug,
    templateName: template?.name || slug,
    message,
    createdAt: new Date().toISOString(),
  };

  const existingHistory = getHistory();
  // Keep only the last 50 entries
  const updatedHistory = [entry, ...existingHistory].slice(0, 50);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const history = getHistory();
  const updatedHistory = history.filter((entry) => entry.id !== id);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
}
