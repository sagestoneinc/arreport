import { describe, it, expect } from 'vitest';
import { formatHourlyApprovalRate } from '../lib/formatters/hourly-approval-rate';

describe('formatHourlyApprovalRate - New Template System', () => {
  it('generates correct output with VISA and MasterCard MIDs sorted by AR%', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 6, initial_decline: 9 }, // AR = 40%
        { mid_name: 'CS_396', initial_sales: 6, initial_decline: 14 }, // AR = 30%
        { mid_name: 'CS_397', initial_sales: 10, initial_decline: 5 }, // AR = 66.67%
      ],
      mc_mids: [
        { mid_name: 'PAY-REV_346', initial_sales: 12, initial_decline: 6 }, // AR = 66.67%
        { mid_name: 'PAY-REV_330', initial_sales: 13, initial_decline: 9 }, // AR = 59.09%
        { mid_name: 'PAY-REV_331', initial_sales: 8, initial_decline: 2 }, // AR = 80%
      ],
      insights: 'All PAY REVs have been performing over the past few hours.',
    };

    const output = formatHourlyApprovalRate(data);

    // Check header
    expect(output).toContain('HOURLY MID OPS REPORT');
    expect(output).toContain('Date: 01/23/2026');
    expect(output).toContain('Time Range: 13:00 - 16:00 EST');

    // Check VISA section - should be sorted by AR% desc
    const visaSection = output.substring(output.indexOf('VISA'), output.indexOf('MasterCard'));
    const visaLines = visaSection.split('\n').filter((line) => line.startsWith('-'));
    expect(visaLines[0]).toContain('CS_397'); // 66.67%
    expect(visaLines[0]).toContain('10 sales / 5 declines');
    expect(visaLines[0]).toContain('66.67%');
    expect(visaLines[1]).toContain('CS_395'); // 40%
    expect(visaLines[1]).toContain('6 sales / 9 declines');
    expect(visaLines[1]).toContain('40.00%');
    expect(visaLines[2]).toContain('CS_396'); // 30%
    expect(visaLines[2]).toContain('6 sales / 14 declines');
    expect(visaLines[2]).toContain('30.00%');

    // Check MasterCard section - should be sorted by AR% desc
    const mcSection = output.substring(output.indexOf('MasterCard'), output.indexOf('Insights/Actions'));
    const mcLines = mcSection.split('\n').filter((line) => line.startsWith('-'));
    expect(mcLines[0]).toContain('PAY-REV_331'); // 80%
    expect(mcLines[0]).toContain('8 sales / 2 declines');
    expect(mcLines[0]).toContain('80.00%');
    expect(mcLines[1]).toContain('PAY-REV_346'); // 66.67%
    expect(mcLines[1]).toContain('12 sales / 6 declines');
    expect(mcLines[1]).toContain('66.67%');
    expect(mcLines[2]).toContain('PAY-REV_330'); // 59.09%
    expect(mcLines[2]).toContain('13 sales / 9 declines');
    expect(mcLines[2]).toContain('59.09%');

    // Check insights
    expect(output).toContain('Insights/Actions:');
    expect(output).toContain('All PAY REVs have been performing over the past few hours.');
  });

  it('handles empty MID lists correctly', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [],
      mc_mids: [],
      insights: 'No MIDs to report',
    };

    const output = formatHourlyApprovalRate(data);

    // Should show "—" for empty sections
    expect(output).toContain('VISA\n- —');
    expect(output).toContain('MasterCard\n- —');
    expect(output).toContain('No MIDs to report');
  });

  it('handles zero total (null AR%) correctly', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 0, initial_decline: 0 }, // null AR
        { mid_name: 'CS_396', initial_sales: 6, initial_decline: 14 }, // 30% AR
      ],
      mc_mids: [],
      insights: 'Test',
    };

    const output = formatHourlyApprovalRate(data);

    // CS_396 (30%) should come first, CS_395 (null) should come last
    const visaSection = output.substring(output.indexOf('VISA'), output.indexOf('MasterCard'));
    const visaLines = visaSection.split('\n').filter((line) => line.startsWith('-'));
    expect(visaLines[0]).toContain('CS_396');
    expect(visaLines[0]).toContain('30.00%');
    expect(visaLines[1]).toContain('CS_395');
    expect(visaLines[1]).toContain('—'); // null AR shows as "—"
  });

  it('uses total as tie-breaker when AR% is equal', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 2, initial_decline: 2 }, // 50%, total 4
        { mid_name: 'CS_396', initial_sales: 5, initial_decline: 5 }, // 50%, total 10
        { mid_name: 'CS_397', initial_sales: 1, initial_decline: 1 }, // 50%, total 2
      ],
      mc_mids: [],
      insights: 'Test',
    };

    const output = formatHourlyApprovalRate(data);

    // All have 50% AR, should be sorted by total desc: 10, 4, 2
    const visaSection = output.substring(output.indexOf('VISA'), output.indexOf('MasterCard'));
    const visaLines = visaSection.split('\n').filter((line) => line.startsWith('-'));
    expect(visaLines[0]).toContain('CS_396'); // total 10
    expect(visaLines[1]).toContain('CS_395'); // total 4
    expect(visaLines[2]).toContain('CS_397'); // total 2
  });

  it('treats blank values as 0 for computation', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 10, initial_decline: 0 }, // 100%
      ],
      mc_mids: [],
      insights: 'Test',
    };

    const output = formatHourlyApprovalRate(data);

    expect(output).toContain('CS_395 - 10 sales / 0 declines - 100.00%');
  });
});
