import { describe, it, expect } from 'vitest';
import { formatTemplateA } from '../lib/formatTemplateA';
import { AppState } from '../lib/types';

describe('formatTemplateA', () => {
  it('generates correct output for Template A with sample data', () => {
    const state: AppState = {
      templateType: 'template-a',
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

    const output = formatTemplateA(state);

    // Check header
    expect(output).toContain('📊 AR Update – MID Optimization');
    expect(output).toContain('🗓️ 01/15/2026 | 🕐 1:00 AM EST');
    expect(output).toContain('🎯 Threshold (Performing): 38%');

    // Check daily summary
    expect(output).toContain('📌 DAILY SUMMARY');
    expect(output).toContain('Overall AR: 24.73% (918 sales / 2794 declines)');

    // Check VISA sections
    expect(output).toContain('✅ VISA – PERFORMING MIDs');
    expect(output).toContain('CS_396_SkinPuraVida_0100: 40.95% (43 / 62)');
    expect(output).toContain('⚠️ VISA – LOW MIDs');
    expect(output).toContain('CS_395_VitalComplexion_0164: 35.00% (28 / 52)');

    // Check MASTERCARD sections
    expect(output).toContain('✅ MASTERCARD – PERFORMING MIDs');
    expect(output).toContain('PAY-REV_372_FitFlexDiet_6315: 64.52% (20 / 11)');
    expect(output).toContain('⚠️ MASTERCARD – LOW MIDs');
    expect(output).toContain('(none)');

    // Check notes
    expect(output).toContain('📝 Notes / Action Taken:');
    expect(output).toContain(
      'Enter optimization notes, routing changes, or monitoring actions here.'
    );
  });

  it('handles empty MID lists correctly', () => {
    const state: AppState = {
      templateType: 'template-a',
      dateISO: '2026-01-15',
      timeHHMM: '13:30',
      threshold: 50,
      dailySummary: { sales: 100, declines: 100 },
      visaMids: [],
      mcMids: [],
      notes: 'Test notes',
    };

    const output = formatTemplateA(state);

    // Should show sections but be empty or show (none)
    expect(output).toContain('✅ VISA – PERFORMING MIDs');
    expect(output).toContain('⚠️ VISA – LOW MIDs');
    expect(output).toContain('✅ MASTERCARD – PERFORMING MIDs');
    expect(output).toContain('⚠️ MASTERCARD – LOW MIDs');
  });

  it('formats time correctly for PM', () => {
    const state: AppState = {
      templateType: 'template-a',
      dateISO: '2026-12-31',
      timeHHMM: '13:30',
      threshold: 38,
      dailySummary: { sales: 100, declines: 100 },
      visaMids: [],
      mcMids: [],
      notes: 'Test',
    };

    const output = formatTemplateA(state);
    expect(output).toContain('🕐 1:30 PM EST');
  });
});
