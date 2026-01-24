export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export interface TemplateDefinition {
  slug: string;
  name: string;
  description: string;
  fields: TemplateField[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    slug: 'batch-reruns',
    name: 'Daily Batch Re-runs',
    description: 'Generate daily batch re-runs summary with US/CA and other geo declines',
    fields: [
      {
        name: 'date',
        label: 'Date',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
        required: true,
      },
      // US/CA Section
      {
        name: 'usca_reruns',
        label: 'US/CA Re-runs',
        type: 'number',
        defaultValue: 0,
        required: true,
      },
      { name: 'usca_sales', label: 'US/CA Sales', type: 'number', defaultValue: 0, required: true },
      {
        name: 'usca_approval',
        label: 'US/CA Approval %',
        type: 'number',
        defaultValue: 0,
        helpText: 'Leave blank to auto-calculate from Visa+MC data',
      },
      { name: 'usca_visa_appr', label: 'US/CA Visa Approval %', type: 'number', defaultValue: 0 },
      {
        name: 'usca_visa_approvals',
        label: 'US/CA Visa Approvals',
        type: 'number',
        defaultValue: 0,
      },
      { name: 'usca_visa_txns', label: 'US/CA Visa Transactions', type: 'number', defaultValue: 0 },
      { name: 'usca_mc_appr', label: 'US/CA MC Approval %', type: 'number', defaultValue: 0 },
      { name: 'usca_mc_approvals', label: 'US/CA MC Approvals', type: 'number', defaultValue: 0 },
      { name: 'usca_mc_txns', label: 'US/CA MC Transactions', type: 'number', defaultValue: 0 },
      {
        name: 'usca_decline1_reason',
        label: 'US/CA Decline 1 Reason',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'usca_decline1_count',
        label: 'US/CA Decline 1 Count',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'usca_decline2_reason',
        label: 'US/CA Decline 2 Reason',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'usca_decline2_count',
        label: 'US/CA Decline 2 Count',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'usca_decline3_reason',
        label: 'US/CA Decline 3 Reason',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'usca_decline3_count',
        label: 'US/CA Decline 3 Count',
        type: 'number',
        defaultValue: 0,
      },
      // Other Geos Section
      {
        name: 'other_reruns',
        label: 'Other Geos Re-runs',
        type: 'number',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'other_sales',
        label: 'Other Geos Sales',
        type: 'number',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'other_approval',
        label: 'Other Geos Approval %',
        type: 'number',
        defaultValue: 0,
        helpText: 'Leave blank to auto-calculate from Visa+MC data',
      },
      {
        name: 'other_visa_appr',
        label: 'Other Geos Visa Approval %',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'other_visa_approvals',
        label: 'Other Geos Visa Approvals',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'other_visa_txns',
        label: 'Other Geos Visa Transactions',
        type: 'number',
        defaultValue: 0,
      },
      { name: 'other_mc_appr', label: 'Other Geos MC Approval %', type: 'number', defaultValue: 0 },
      {
        name: 'other_mc_approvals',
        label: 'Other Geos MC Approvals',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'other_mc_txns',
        label: 'Other Geos MC Transactions',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'other_decline1_reason',
        label: 'Other Geos Decline 1 Reason',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'other_decline1_count',
        label: 'Other Geos Decline 1 Count',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'other_decline2_reason',
        label: 'Other Geos Decline 2 Reason',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'other_decline2_count',
        label: 'Other Geos Decline 2 Count',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'other_decline3_reason',
        label: 'Other Geos Decline 3 Reason',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'other_decline3_count',
        label: 'Other Geos Decline 3 Count',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },
  {
    slug: 'manual-rebills',
    name: 'Manual Rebills',
    description: 'Generate manual rebills summary report',
    fields: [
      {
        name: 'date',
        label: 'Date',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
        required: true,
      },
      {
        name: 'rebills_reruns',
        label: 'Rebills Re-runs',
        type: 'number',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'rebills_sales',
        label: 'Rebills Sales',
        type: 'number',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'rebills_approval',
        label: 'Rebills Approval %',
        type: 'number',
        defaultValue: 0,
        helpText: 'Leave blank to auto-calculate from Visa+MC data',
      },
      { name: 'visa_appr', label: 'Visa Approval %', type: 'number', defaultValue: 0 },
      { name: 'visa_approvals', label: 'Visa Approvals', type: 'number', defaultValue: 0 },
      { name: 'visa_txns', label: 'Visa Transactions', type: 'number', defaultValue: 0 },
      { name: 'mc_appr', label: 'MC Approval %', type: 'number', defaultValue: 0 },
      { name: 'mc_approvals', label: 'MC Approvals', type: 'number', defaultValue: 0 },
      { name: 'mc_txns', label: 'MC Transactions', type: 'number', defaultValue: 0 },
      { name: 'decline1_reason', label: 'Decline 1 Reason', type: 'text', defaultValue: '' },
      { name: 'decline1_count', label: 'Decline 1 Count', type: 'number', defaultValue: 0 },
      { name: 'decline2_reason', label: 'Decline 2 Reason', type: 'text', defaultValue: '' },
      { name: 'decline2_count', label: 'Decline 2 Count', type: 'number', defaultValue: 0 },
      { name: 'decline3_reason', label: 'Decline 3 Reason', type: 'text', defaultValue: '' },
      { name: 'decline3_count', label: 'Decline 3 Count', type: 'number', defaultValue: 0 },
    ],
  },
  {
    slug: 'mint-additional-sales',
    name: 'MInt Additional Sales',
    description: "Report additional sales from re-running yesterday's declines",
    fields: [
      {
        name: 'additional_sales',
        label: 'Additional Sales',
        type: 'number',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'affiliate_lines',
        label: 'Affiliate Lines',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'c1: 22\nc2: 15\nc3: 8',
        helpText: 'Enter affiliate sales, one per line',
      },
      {
        name: 'c1c3_lines',
        label: 'C1 & C3 Transaction IDs',
        type: 'textarea',
        defaultValue: '',
        placeholder: '3 - abc123\n3 - def456',
        helpText: 'Enter transaction IDs, one per line',
      },
    ],
  },
  {
    slug: 'hourly-approval-rate',
    name: 'Hourly Approval Rate Report',
    description: 'Generate hourly MID operations report with approval rates',
    fields: [
      {
        name: 'date',
        label: 'Date',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
        required: true,
      },
      {
        name: 'time_range',
        label: 'Time Range',
        type: 'text',
        defaultValue: '13:00 - 16:00 EST',
        required: true,
      },
      {
        name: 'filter_used',
        label: 'Filter Used',
        type: 'text',
        defaultValue: 'Affiliate > Card Brand > Merchant Account',
      },
      {
        name: 'mc_mid_lines',
        label: 'MasterCard MID Lines',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'PAY-REV_346 - 12/6 trxns - 66.67%',
        helpText: 'Enter MasterCard MID data, one per line',
      },
      {
        name: 'visa_mid_lines',
        label: 'VISA MID Lines',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'CS_395 - 6/9 trxns - 40.00%',
        helpText: 'Enter VISA MID data, one per line',
      },
      {
        name: 'insights',
        label: 'Insights & Actions',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Enter insights and actions taken',
        required: true,
      },
    ],
  },
];

export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
