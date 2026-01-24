import { AppState } from './types';

export const DEFAULT_STATE_TEMPLATE_A: AppState = {
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

export const DEFAULT_STATE_TEMPLATE_B: AppState = {
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

export const DEFAULT_STATE_APPROVAL_RATE_HOURLY: AppState = {
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
    { id: 'visa-3', name: 'NS_043_SharpBloodHealth_UPDATED_7883', sales: 11, declines: 45 },
    { id: 'visa-4', name: 'NS_045_BloodFocusSupport_UPDATED_3889', sales: 7, declines: 35 },
  ],
  mcMids: [
    { id: 'mc-1', name: 'PAY-REV_346_RapidHealthScreen_0147', sales: 12, declines: 6 },
    { id: 'mc-2', name: 'PAY-REV_330_MedicalCheckPro_7697', sales: 13, declines: 9 },
    { id: 'mc-3', name: 'PAY-REV_368_HealthScreenStation_5989', sales: 8, declines: 7 },
    { id: 'mc-4', name: 'PAY-REV_348_BloodBoostPro_1090', sales: 8, declines: 8 },
  ],
  notes: 'All PAY REVs have been performing over the past few hours, with performance above and within the 50% threshold. \nRotating out the NS_045 and enabling NS_029 to see if that will drive the AR better. \nI\'ll continue monitoring performance over the next few hours.',
};

export const DEFAULT_STATE_DAILY_BATCH_RERUNS: AppState = {
  templateType: 'daily-batch-reruns',
  dateISO: '2026-01-23',
  timeHHMM: '13:45',
  threshold: 50,
  dailySummary: {
    sales: 0,
    declines: 0,
  },
  visaMids: [],
  mcMids: [],
  notes: 'Enter batch rerun notes and details here.',
};

export const DEFAULT_STATE_DAILY_SUMMARY_REBILLS: AppState = {
  templateType: 'daily-summary-rebills',
  dateISO: '2026-01-23',
  timeHHMM: '13:45',
  threshold: 50,
  dailySummary: {
    sales: 0,
    declines: 0,
  },
  visaMids: [],
  mcMids: [],
  notes: 'Enter daily summary rebills notes here.',
};

export const DEFAULT_STATE_MINT_ADDITIONAL_SALES: AppState = {
  templateType: 'mint-additional-sales',
  dateISO: '2026-01-23',
  timeHHMM: '13:45',
  threshold: 50,
  dailySummary: {
    sales: 0,
    declines: 0,
  },
  visaMids: [],
  mcMids: [],
  notes: 'Enter mint additional sales notes here.',
};

export const DEFAULT_STATE = DEFAULT_STATE_TEMPLATE_A;
