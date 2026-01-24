/**
 * Format date from YYYY-MM-DD to M/D/YYYY
 */
export function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split('-');
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}

/**
 * Format time from HH:mm (24h) to h:mm AM/PM
 */
export function formatTime(timeHHMM: string): string {
  const [hours, minutes] = timeHHMM.split(':');
  let hourNum = parseInt(hours);
  const period = hourNum >= 12 ? 'PM' : 'AM';

  if (hourNum === 0) hourNum = 12;
  else if (hourNum > 12) hourNum -= 12;

  return `${hourNum}:${minutes} ${period}`;
}
