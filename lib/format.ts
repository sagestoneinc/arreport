import { AppState } from './types';
import { formatTemplateA } from './formatTemplateA';
import { formatTemplateB } from './formatTemplateB';

/**
 * Format the complete Telegram message based on template type
 */
export function formatTelegramMessage(state: AppState): string {
  if (state.templateType === 'template-b') {
    return formatTemplateB(state);
  }
  return formatTemplateA(state);
}

