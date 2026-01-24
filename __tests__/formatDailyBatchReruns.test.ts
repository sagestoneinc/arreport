import { describe, it, expect } from 'vitest';
import { formatDailyBatchReruns } from '../lib/formatDailyBatchReruns';
import { AppState } from '../lib/types';

describe('formatDailyBatchReruns', () => {
  it('generates correct output for Daily Batch Reruns with sample data', () => {
    const state: AppState = {
      templateType: 'daily-batch-reruns',
      dateISO: '2026-01-24',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes:
        'I re-ran 100 US/CA declines from yesterday to PAY-REV and got 25 sales (25% approval).\n\nVisa: 30% (15 approvals, 50 txns)\nMC: 20% (10 approvals, 50 txns)\nCommon Declines: Do Not Honor (40%), Insufficient Funds (30%), Invalid Card (20%)\n\nI re-ran 50 declines (all other geos) to NS and got 10 sales (20% approval).\nVisa: 25% (5 approvals, 20 txns)\nMC: 16.7% (5 approvals, 30 txns)\nCommon Declines: Do Not Honor (50%), Insufficient Funds (30%), Invalid Card (20%)',
    };

    const output = formatDailyBatchReruns(state);

    // Check header
    expect(output).toContain('Daily Batch Re-runs Summary: 01/24/2026');

    // Check content
    expect(output).toContain(
      'I re-ran 100 US/CA declines from yesterday to PAY-REV and got 25 sales (25% approval).'
    );
    expect(output).toContain('Visa: 30% (15 approvals, 50 txns)');
    expect(output).toContain('MC: 20% (10 approvals, 50 txns)');
    expect(output).toContain(
      'Common Declines: Do Not Honor (40%), Insufficient Funds (30%), Invalid Card (20%)'
    );
    expect(output).toContain(
      'I re-ran 50 declines (all other geos) to NS and got 10 sales (20% approval).'
    );
  });

  it('generates correct output with template placeholder', () => {
    const state: AppState = {
      templateType: 'daily-batch-reruns',
      dateISO: '2026-01-24',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes:
        'I re-ran __ US/CA declines from yesterday to PAY-REV and got __ sales (__ approval).\n\nVisa: __ (__ approvals, __ txns)\nMC: __ (__ approvals, __ txns)\nCommon Declines: __ (), __ (), __ ()',
    };

    const output = formatDailyBatchReruns(state);

    // Check that template format is maintained
    expect(output).toContain('Daily Batch Re-runs Summary: 01/24/2026');
    expect(output).toContain(
      'I re-ran __ US/CA declines from yesterday to PAY-REV and got __ sales (__ approval).'
    );
    expect(output).toContain('Visa: __ (__ approvals, __ txns)');
  });
});
