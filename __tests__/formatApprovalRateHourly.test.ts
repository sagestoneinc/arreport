import { describe, it, expect } from 'vitest';
import { formatApprovalRateHourly } from '../lib/formatApprovalRateHourly';
import { AppState } from '../lib/types';

describe('formatApprovalRateHourly', () => {
  it('generates correct output for Approval Rate Hourly Report with time range', () => {
    const state: AppState = {
      templateType: 'approval-rate-hourly',
      dateISO: '2026-01-23',
      timeHHMM: '13:45',
      timeEndHHMM: '16:00',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [
        { id: 'visa-1', name: 'CS_395_VitalComplexion_0164', sales: 6, declines: 9 },
        { id: 'visa-2', name: 'CS_396_SkinPuraVida_0100', sales: 6, declines: 14 },
      ],
      mcMids: [
        { id: 'mc-1', name: 'PAY-REV_346_RapidHealthScreen_0147', sales: 12, declines: 6 },
        { id: 'mc-2', name: 'PAY-REV_330_MedicalCheckPro_7697', sales: 13, declines: 9 },
      ],
      notes: 'All PAY REVs have been performing over the past few hours.',
    };

    const output = formatApprovalRateHourly(state);

    // Check header
    expect(output).toContain('Date: 1/23/2026');
    expect(output).toContain('Time Range: 1:45 PM - 4:00 PM EST');
    expect(output).toContain('Filter Used: Affiliate > Card Brand > Merchant Account');

    // Check MASTERCARD section
    expect(output).toContain('Master Card - Active PAY REV MIDs');
    expect(output).toContain('PAY-REV_346_RapidHealthScreen_0147 - 12/6 trxns - 66.67%');
    expect(output).toContain('PAY-REV_330_MedicalCheckPro_7697 - 13/9 trxns - 59.09%');

    // Check VISA section
    expect(output).toContain('VISA - Active CS MIDs');
    expect(output).toContain('CS_395_VitalComplexion_0164 - 6/9 trxns - 40.00%');
    expect(output).toContain('CS_396_SkinPuraVida_0100 - 6/14 trxns - 30.00%');

    // Check notes
    expect(output).toContain('Insights & Actions:');
    expect(output).toContain('All PAY REVs have been performing over the past few hours.');
  });

  it('generates correct output without time range', () => {
    const state: AppState = {
      templateType: 'approval-rate-hourly',
      dateISO: '2026-01-23',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [
        { id: 'mc-1', name: 'PAY-REV_346_RapidHealthScreen_0147', sales: 12, declines: 6 },
      ],
      notes: 'Test note',
    };

    const output = formatApprovalRateHourly(state);

    // Check single time instead of time range
    expect(output).toContain('Time: 1:45 PM EST');
    expect(output).not.toContain('Time Range:');
  });

  it('handles empty MIDs lists correctly', () => {
    const state: AppState = {
      templateType: 'approval-rate-hourly',
      dateISO: '2026-01-23',
      timeHHMM: '13:45',
      timeEndHHMM: '16:00',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes: 'No MIDs to report',
    };

    const output = formatApprovalRateHourly(state);

    // Should still have header and notes
    expect(output).toContain('Date: 1/23/2026');
    expect(output).toContain('Insights & Actions:');
    expect(output).toContain('No MIDs to report');
    
    // Should not have MID section headers when empty
    expect(output).not.toContain('Master Card - Active PAY REV MIDs');
    expect(output).not.toContain('VISA - Active CS MIDs');
  });
});
