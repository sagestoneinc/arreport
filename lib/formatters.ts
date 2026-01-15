import { ARUpdateData } from './types';
import { calculateAR, formatMetric } from './calculations';

export function formatMessage(data: ARUpdateData): string {
  const lines: string[] = [];

  // Header
  lines.push('📊 AR Update – MID Optimization');
  lines.push(`🗓️ ${data.date} | 🕐 ${data.time} ${data.timezone}`);
  lines.push(`Key Action: ${data.keyAction}`);
  lines.push('');

  // Daily Summary
  lines.push('DAILY SUMMARY');
  const dailyOverallAR = calculateAR(
    data.dailySummary.overall.sales,
    data.dailySummary.overall.declines
  );
  lines.push(
    `Overall: ${formatMetric(
      dailyOverallAR,
      data.dailySummary.overall.sales,
      data.dailySummary.overall.declines,
      true
    )}`
  );

  const dailyVisaAR = calculateAR(
    data.dailySummary.visa.sales,
    data.dailySummary.visa.declines
  );
  lines.push(
    `VISA: ${formatMetric(
      dailyVisaAR,
      data.dailySummary.visa.sales,
      data.dailySummary.visa.declines,
      false
    )}`
  );

  const dailyMcAR = calculateAR(
    data.dailySummary.mc.sales,
    data.dailySummary.mc.declines
  );
  lines.push(
    `MC: ${formatMetric(
      dailyMcAR,
      data.dailySummary.mc.sales,
      data.dailySummary.mc.declines,
      false
    )}`
  );
  lines.push('');

  // Hourly Update
  lines.push('HOURLY UPDATE');
  const hourlyOverallAR = calculateAR(
    data.hourlyUpdate.overall.sales,
    data.hourlyUpdate.overall.declines
  );
  lines.push(
    `Overall: ${formatMetric(
      hourlyOverallAR,
      data.hourlyUpdate.overall.sales,
      data.hourlyUpdate.overall.declines,
      true
    )}`
  );

  const hourlyVisaAR = calculateAR(
    data.hourlyUpdate.visa.sales,
    data.hourlyUpdate.visa.declines
  );
  lines.push(
    `VISA: ${formatMetric(
      hourlyVisaAR,
      data.hourlyUpdate.visa.sales,
      data.hourlyUpdate.visa.declines,
      false
    )}`
  );

  const hourlyMcAR = calculateAR(
    data.hourlyUpdate.mc.sales,
    data.hourlyUpdate.mc.declines
  );
  lines.push(
    `MC: ${formatMetric(
      hourlyMcAR,
      data.hourlyUpdate.mc.sales,
      data.hourlyUpdate.mc.declines,
      false
    )}`
  );
  lines.push('');

  // VISA Top MIDs
  lines.push('VISA — Top MIDs');
  data.visaTopMids.forEach((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    lines.push(`- ${mid.midName}: ${ar}% (${mid.sales} sales / ${mid.declines} declines)`);
  });
  lines.push('');

  // VISA Worst MIDs
  lines.push('VISA — Worst MIDs');
  data.visaWorstMids.forEach((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    lines.push(`- ${mid.midName}: ${ar}% (${mid.sales} sales / ${mid.declines} declines)`);
  });
  lines.push('');

  // MASTERCARD Top MIDs
  lines.push('MASTERCARD — Top MIDs');
  data.mastercardTopMids.forEach((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    lines.push(`- ${mid.midName}: ${ar}% (${mid.sales} sales / ${mid.declines} declines)`);
  });
  lines.push('');

  // MASTERCARD Worst MIDs
  lines.push('MASTERCARD — Worst MIDs');
  data.mastercardWorstMids.forEach((mid) => {
    const ar = calculateAR(mid.sales, mid.declines);
    lines.push(`- ${mid.midName}: ${ar}% (${mid.sales} sales / ${mid.declines} declines)`);
  });
  lines.push('');

  return lines.join('\n');
}