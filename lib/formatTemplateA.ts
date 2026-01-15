import { AppState } from './types';
import { calculateAR, formatAR, determineStatus } from './calc';

/**
 * Format date from YYYY-MM-DD to MM/DD/YYYY
 */
function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split('-');
  return `${month}/${day}/${year}`;
}

/**
 * Format time from HH:mm (24h) to h:mm AM/PM
 */
function formatTime(timeHHMM: string): string {
  const [hours, minutes] = timeHHMM.split(':');
  let hourNum = parseInt(hours);
  const period = hourNum >= 12 ? 'PM' : 'AM';

  if (hourNum === 0) hourNum = 12;
  else if (hourNum > 12) hourNum -= 12;

  return `${hourNum}:${minutes} ${period}`;
}

/**
 * Format the Template A message (Top/Worst MIDs format)
 */
export function formatTemplateA(state: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push('📊 AR Update – MID Optimization');
  lines.push(`🗓️ ${formatDate(state.dateISO)} | 🕐 ${formatTime(state.timeHHMM)} EST`);
  lines.push(`🎯 Threshold (Performing): ${state.threshold}%`);
  lines.push('');

  // Daily Summary
  const dailyAR = calculateAR(state.dailySummary.sales, state.dailySummary.declines);
  lines.push('📌 DAILY SUMMARY');
  lines.push(
    `Overall AR: ${formatAR(dailyAR)}% (${state.dailySummary.sales} sales / ${state.dailySummary.declines} declines)`
  );
  lines.push('');

  // VISA MIDs
  const visaPerforming = state.visaMids.filter((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    return determineStatus(ar, state.threshold) === 'PERFORMING';
  });
  const visaLow = state.visaMids.filter((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    return determineStatus(ar, state.threshold) === 'LOW';
  });

  lines.push('✅ VISA – PERFORMING MIDs');
  if (visaPerforming.length > 0) {
    visaPerforming.forEach((mid) => {
      const ar = calculateAR(mid.sales, mid.declines);
      lines.push(`- ${mid.name}: ${formatAR(ar)}% (${mid.sales} / ${mid.declines})`);
    });
  }
  lines.push('');

  lines.push('⚠️ VISA – LOW MIDs');
  if (visaLow.length > 0) {
    visaLow.forEach((mid) => {
      const ar = calculateAR(mid.sales, mid.declines);
      lines.push(`- ${mid.name}: ${formatAR(ar)}% (${mid.sales} / ${mid.declines})`);
    });
  } else {
    lines.push('(none)');
  }
  lines.push('');

  // MASTERCARD MIDs
  const mcPerforming = state.mcMids.filter((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    return determineStatus(ar, state.threshold) === 'PERFORMING';
  });
  const mcLow = state.mcMids.filter((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    return determineStatus(ar, state.threshold) === 'LOW';
  });

  lines.push('✅ MASTERCARD – PERFORMING MIDs');
  if (mcPerforming.length > 0) {
    mcPerforming.forEach((mid) => {
      const ar = calculateAR(mid.sales, mid.declines);
      lines.push(`- ${mid.name}: ${formatAR(ar)}% (${mid.sales} / ${mid.declines})`);
    });
  }
  lines.push('');

  lines.push('⚠️ MASTERCARD – LOW MIDs');
  if (mcLow.length > 0) {
    mcLow.forEach((mid) => {
      const ar = calculateAR(mid.sales, mid.declines);
      lines.push(`- ${mid.name}: ${formatAR(ar)}% (${mid.sales} / ${mid.declines})`);
    });
  } else {
    lines.push('(none)');
  }
  lines.push('');
  lines.push('');

  // Notes
  lines.push('📝 Notes / Action Taken:');
  lines.push(state.notes);

  return lines.join('\n');
}
