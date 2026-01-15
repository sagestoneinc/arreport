import { describe, it, expect } from 'vitest';
import { formatTemplateB } from '../lib/formatTemplateB';
import { AppState } from '../lib/types';

describe('formatTemplateB', () => {
  it('generates exact output for Template B with default data', () => {
    const state: AppState = {
      templateType: 'template-b',
      dateISO: '2026-01-15',
      timeHHMM: '01:00',
      threshold: 38,
      dailySummary: {
        sales: 918,
        declines: 2794,
      },
      visaMids: [
        { id: 'visa-1', name: 'CS_396_SkinPuraVida_0100', sales: 43, declines: 62 },
        { id: 'visa-2', name: 'CS_395_VitalComplexion_0164', sales: 28, declines: 52 },
      ],
      mcMids: [
        { id: 'mc-1', name: 'PAY-REV_372_FitFlexDiet_6315', sales: 20, declines: 11 },
        { id: 'mc-2', name: 'PAY-REV_349_MedicalScreenPro_0535', sales: 20, declines: 9 },
        { id: 'mc-3', name: 'PAY-REV_352_HealthScreenAssist_9594', sales: 19, declines: 18 },
        { id: 'mc-4', name: 'PAY-REV_347_SmoothSkinRevival_7651', sales: 14, declines: 13 },
      ],
      notes: 'Enter optimization notes, routing changes, or monitoring actions here.',
    };

    const output = formatTemplateB(state);

    const expectedOutput = `📊 AR Update – MID Optimization
🗓️ 01/15/2026 | 🕐 1:00 AM EST
🎯 Threshold (Performing): 38%

📌 DAILY SUMMARY
Overall AR: 24.73% (918 sales / 2794 declines)

✅ VISA – PERFORMING MIDs
- CS_396_SkinPuraVida_0100: 40.95% (43 / 62)

⚠️ VISA – LOW MIDs
- CS_395_VitalComplexion_0164: 35.00% (28 / 52)

✅ MASTERCARD – PERFORMING MIDs
- PAY-REV_372_FitFlexDiet_6315: 64.52% (20 / 11)
- PAY-REV_349_MedicalScreenPro_0535: 68.97% (20 / 9)
- PAY-REV_352_HealthScreenAssist_9594: 51.35% (19 / 18)
- PAY-REV_347_SmoothSkinRevival_7651: 51.85% (14 / 13)

⚠️ MASTERCARD – LOW MIDs
(none)


📝 Notes / Action Taken:
Enter optimization notes, routing changes, or monitoring actions here.`;

    expect(output).toBe(expectedOutput);
  });

  it('shows (none) for empty performing/low sections', () => {
    const state: AppState = {
      templateType: 'template-b',
      dateISO: '2026-01-15',
      timeHHMM: '01:00',
      threshold: 100, // Very high threshold so all are LOW
      dailySummary: { sales: 100, declines: 100 },
      visaMids: [{ id: 'visa-1', name: 'TestMID', sales: 10, declines: 10 }],
      mcMids: [],
      notes: 'Test',
    };

    const output = formatTemplateB(state);

    // VISA PERFORMING should be (none)
    expect(output).toContain('✅ VISA – PERFORMING MIDs\n(none)');
    // VISA LOW should have the MID
    expect(output).toContain('⚠️ VISA – LOW MIDs\n- TestMID: 50.00% (10 / 10)');
    // MASTERCARD sections should be (none)
    expect(output).toContain('✅ MASTERCARD – PERFORMING MIDs\n(none)');
    expect(output).toContain('⚠️ MASTERCARD – LOW MIDs\n(none)');
  });

  it('uses en dash in section headers', () => {
    const state: AppState = {
      templateType: 'template-b',
      dateISO: '2026-01-15',
      timeHHMM: '01:00',
      threshold: 38,
      dailySummary: { sales: 100, declines: 100 },
      visaMids: [],
      mcMids: [],
      notes: 'Test',
    };

    const output = formatTemplateB(state);

    // Check for en dash (–) not hyphen (-)
    expect(output).toContain('VISA – PERFORMING');
    expect(output).toContain('VISA – LOW');
    expect(output).toContain('MASTERCARD – PERFORMING');
    expect(output).toContain('MASTERCARD – LOW');
  });

  it('formats MID line correctly as: {MID}: {AR}% ({sales} / {declines})', () => {
    const state: AppState = {
      templateType: 'template-b',
      dateISO: '2026-01-15',
      timeHHMM: '01:00',
      threshold: 38,
      dailySummary: { sales: 100, declines: 100 },
      visaMids: [{ id: 'visa-1', name: 'TestMID_123', sales: 43, declines: 62 }],
      mcMids: [],
      notes: 'Test',
    };

    const output = formatTemplateB(state);

    // Check exact format
    expect(output).toContain('- TestMID_123: 40.95% (43 / 62)');
  });

  it('has double blank line before Notes section', () => {
    const state: AppState = {
      templateType: 'template-b',
      dateISO: '2026-01-15',
      timeHHMM: '01:00',
      threshold: 38,
      dailySummary: { sales: 100, declines: 100 },
      visaMids: [],
      mcMids: [],
      notes: 'Test notes here',
    };

    const output = formatTemplateB(state);

    // Check for double newline before Notes
    expect(output).toContain('(none)\n\n\n📝 Notes / Action Taken:');
  });
});
