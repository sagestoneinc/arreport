import { describe, it, expect } from 'vitest';
import { formatXShieldHourlyApproval } from '../lib/formatters/xshield-hourly-approval';

describe('formatXShieldHourlyApproval', () => {
  it('formats sales/declines order and AR% correctly', () => {
    const data = {
      header_time_start: '9:00 AM',
      header_time_end: '10:00 AM',
      yesterday_from_time: '9:00 AM',
      yesterday_to_time: '10:00 AM',
      today_as_of_from_time: '9:00 AM',
      today_as_of_to_time: '10:00 AM',
      insights: 'Test',
      yesterday_merchants: [
        {
          merchant_name: 'MID Alpha',
          visa_sales: 28,
          visa_declines: 36,
          mc_sales: 10,
          mc_declines: 10,
        },
      ],
      today_merchants: [
        {
          merchant_name: 'MID Alpha',
          visa_sales: 28,
          visa_declines: 36,
          mc_sales: 10,
          mc_declines: 10,
        },
      ],
    };

    const output = formatXShieldHourlyApproval(data);

    expect(output).toContain('XSHIELD MID Performance Report');
    expect(output).toContain('Merchant Account Name: MID Alpha');
    expect(output).toContain('- VISA: 28/36 trxns - 43.75%');
  });
});
