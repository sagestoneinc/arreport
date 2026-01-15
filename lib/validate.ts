import { AppState } from './types';

/**
 * Validate JSON structure for import
 */
export function validateAppState(data: unknown): AppState | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (
    typeof obj.dateISO !== 'string' ||
    typeof obj.timeHHMM !== 'string' ||
    typeof obj.threshold !== 'number' ||
    typeof obj.notes !== 'string'
  ) {
    return null;
  }

  // Validate dailySummary
  if (
    !obj.dailySummary ||
    typeof obj.dailySummary !== 'object' ||
    typeof (obj.dailySummary as Record<string, unknown>).sales !== 'number' ||
    typeof (obj.dailySummary as Record<string, unknown>).declines !== 'number'
  ) {
    return null;
  }

  // Validate visaMids array
  if (!Array.isArray(obj.visaMids)) {
    return null;
  }

  // Validate mcMids array
  if (!Array.isArray(obj.mcMids)) {
    return null;
  }

  // Validate each MID row
  const validateMidRow = (mid: unknown): boolean => {
    if (!mid || typeof mid !== 'object') return false;
    const m = mid as Record<string, unknown>;
    return (
      typeof m.id === 'string' &&
      typeof m.name === 'string' &&
      typeof m.sales === 'number' &&
      typeof m.declines === 'number'
    );
  };

  if (!obj.visaMids.every(validateMidRow) || !obj.mcMids.every(validateMidRow)) {
    return null;
  }

  return obj as unknown as AppState;
}
