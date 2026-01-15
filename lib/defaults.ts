import { AppState } from './types';

export const DEFAULT_STATE: AppState = {
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
