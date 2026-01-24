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

    // Check header - now with emoji and bold formatting (Telegram mode by default)
    expect(output).toContain('Hourly MID Ops Report');
    expect(output).toContain('01/23/2026');
    expect(output).toContain('13:00');
    expect(output).toContain('16:00 EST');

    // Check VISA section - should be sorted by AR% desc
    // With Telegram formatting, underscores and special chars are escaped
    expect(output).toContain('VISA');
    expect(output).toContain('CS\\_397'); // 66.67% - top performer (escaped underscore)
    expect(output).toContain('CS\\_395'); // 40%
    expect(output).toContain('CS\\_396'); // 30% - low performer
    expect(output).toContain('10 sales');
    expect(output).toContain('5 declines');
    expect(output).toContain('66\\.67%'); // Escaped period

    // Check MasterCard section - should be sorted by AR% desc
    expect(output).toContain('MasterCard');
    expect(output).toContain('PAY\\-REV\\_331'); // 80% - top performer (escaped dash and underscore)
    expect(output).toContain('PAY\\-REV\\_346'); // 66.67%
    expect(output).toContain('PAY\\-REV\\_330'); // 59.09% - low performer
    expect(output).toContain('80\\.00%');
    expect(output).toContain('59\\.09%');

    // Check insights
    expect(output).toContain('Insights');
    expect(output).toContain('All PAY REVs have been performing over the past few hours');
    
    // Check for performer indicators
    expect(output).toContain('🟢⬆️'); // Top performer indicator
    expect(output).toContain('🔴⬇️'); // Low performer indicator
  });

  it('generates plain format when mode is plain', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 6, initial_decline: 9 },
      ],
      mc_mids: [],
      insights: 'Test',
    };

    const output = formatHourlyApprovalRate(data, 'plain');

    // Should NOT contain escaped characters in plain mode
    expect(output).not.toContain('\\_');
    expect(output).not.toContain('\\(');
    expect(output).not.toContain('*VISA*'); // Bold markers
    
    // Should contain plain text
    expect(output).toContain('VISA');
    expect(output).toContain('CS_395');
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
    expect(output).toContain('VISA');
    expect(output).toContain('MasterCard');
    expect(output).toContain('—'); // Em dash for empty
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

    // CS_396 (30%) should come before CS_395 (null AR)
    const visaIndex = output.indexOf('VISA');
    const mcIndex = output.indexOf('MasterCard');
    const visaSection = output.substring(visaIndex, mcIndex);
    
    // Use escaped versions for search
    const cs396Index = visaSection.indexOf('CS\\_396');
    const cs395Index = visaSection.indexOf('CS\\_395');
    
    expect(cs396Index).toBeLessThan(cs395Index); // CS_396 (30%) should come first
    expect(output).toContain('30\\.00%');
    expect(output).toContain('—'); // null AR shows as "—"
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
    const visaIndex = output.indexOf('VISA');
    const mcIndex = output.indexOf('MasterCard');
    const visaSection = output.substring(visaIndex, mcIndex);
    
    // Use escaped versions for search
    const cs396Index = visaSection.indexOf('CS\\_396'); // total 10
    const cs395Index = visaSection.indexOf('CS\\_395'); // total 4
    const cs397Index = visaSection.indexOf('CS\\_397'); // total 2
    
    expect(cs396Index).toBeLessThan(cs395Index);
    expect(cs395Index).toBeLessThan(cs397Index);
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

    expect(output).toContain('CS\\_395'); // Escaped underscore
    expect(output).toContain('10 sales');
    expect(output).toContain('0 declines');
    expect(output).toContain('100\\.00%'); // Escaped period
  });

  it('includes Filter Used field when provided', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      filter_used: 'Affiliate > Card Brand > Merchant Account',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 6, initial_decline: 9 },
      ],
      mc_mids: [],
      insights: 'Test',
    };

    const output = formatHourlyApprovalRate(data);

    expect(output).toContain('Time Range: 13:00 \\- 16:00 EST');
    expect(output).toContain('Filter Used: Affiliate \\> Card Brand \\> Merchant Account');
  });

  it('handles single MID correctly (shows only top performer emoji)', () => {
    const data = {
      date: '2026-01-23',
      time_range: '13:00 - 16:00 EST',
      visa_mids: [
        { mid_name: 'CS_395', initial_sales: 6, initial_decline: 9 }, // Only one
      ],
      mc_mids: [
        { mid_name: 'PAY-REV_346', initial_sales: 12, initial_decline: 6 }, // Only one
      ],
      insights: 'Test',
    };

    const output = formatHourlyApprovalRate(data);

    // Should show green up arrow for single MIDs
    expect(output).toContain('🟢⬆️ CS\\_395');
    expect(output).toContain('🟢⬆️ PAY\\-REV\\_346');
    
    // Should NOT show red down arrow for single MIDs
    const visaSection = output.substring(output.indexOf('VISA'), output.indexOf('MasterCard'));
    const mcSection = output.substring(output.indexOf('MasterCard'), output.indexOf('Insights'));
    
    // Count red arrows - should be 0
    const redArrowCount = (output.match(/🔴⬇️/g) || []).length;
    expect(redArrowCount).toBe(0);
  });
});
