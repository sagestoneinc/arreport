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
  notes:
    "All PAY REVs have been performing over the past few hours, with performance above and within the 50% threshold. \nRotating out the NS_045 and enabling NS_029 to see if that will drive the AR better. \nI'll continue monitoring performance over the next few hours.",
};

export const DEFAULT_STATE_DAILY_BATCH_RERUNS: AppState = {
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
    'I re-ran __ US/CA declines from yesterday to PAY-REV and got __ sales (__ approval).\n\nVisa: __ (__ approvals, __ txns)\nMC: __ (__ approvals, __ txns)\nCommon Declines: __ (), __ (), __ ()\n\nI re-ran __ declines (all other geos) to NS and got __ sales (__ approval).\nVisa: __ (__ approvals, __ txns)\nMC: __ (__ approvals, __ txns)\nCommon Declines: __ (), __ (), __ ()',
};

export const DEFAULT_STATE_DAILY_SUMMARY_REBILLS: AppState = {
  templateType: 'daily-summary-rebills',
  dateISO: '2026-01-21',
  timeHHMM: '13:45',
  threshold: 50,
  dailySummary: {
    sales: 0,
    declines: 0,
  },
  visaMids: [],
  mcMids: [],
  notes:
    'I re-ran 541 rebills declines from yesterday to PayCafe and got 77 sales (14.2% approval).\n\nVisa: 16.9% (48 approvals, 284 txns)\nMC: 11.3% (29 approvals, 257 txns)\nCommon Declines: Do Not Honor (34.9%)',
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
  notes:
    "Hey guys, we re-ran yesterday's declines and got an additional 80 sales for you:\n3: 22\n22: 4\n51: 32\n60: 1\n88: 1\n235: 2\n301: 4\n331: 1\n346: 1\n377: 2\n404: 4\n579: 1\n585: 2\n586: 1\n587: 1\n670: 1\n\nc1 & c3's:\n3 - bffb00689c484df0bc1c61607358ef10\n3 - 18bde3794d894856ae1925d410680fb3\n3 - 108e68801cc243ae857096a684979c19\n3 - 67c60e635a0a4628b9da539318991af6\n3 - b9a4ea67df814b3b9eeef01cdd56e01d\n3 - cb4c5640932545bc975f129fe74a70ac\n3 - 6597225d680f4b338a78ff57914e5669\n3 - 4e0a215b19344c73b8ad50ef1fef0509\n3 - e1ac263de029409fbda2cb4d7c4efdca\n3 - 8bef6ba39d694803a1ab82ca9907bb89\n3 - aa76ab832634440fab35f00051756902\n3 - 8fe98c5a1e914cd0b4a13ffd783d5c1b\n3 - aae46ee571e140c49db318f2f6cb0205\n3 - e3ce6f4eafc34d8897275ae8263b731d\n3 - ae83742a4439417595da7f40508ab210\n3 - 5eb3d51839514c4988556aa5559d83d7\n3 - 592b58cb70bf4883bc0a0985ff3225ab\n3 - 62909d2db8b449a490a38aa56711cd31\n3 - 6db6dae20a934ef0a1ebb32891bc7aa4\n3 - fba35a5916564b9b896133162b54ccc1\n3 - 8525d70682fb4fe4ad221b7c7516275b\n3 - e20fcbfd2694411a91407b032f953839\n22 - 06197b10f6854b0aa3350d2ca1f3a5d3\n22 - d1bed7f7ce8a4b0883b1094ad2d9a994\n22 - 2c848fb5a6ed4af59bf1956746072498",
};

export const DEFAULT_STATE = DEFAULT_STATE_TEMPLATE_A;
