/** Reference data for government procurement (spec §13). */
export interface RefItem {
  code: string;
  label: string;
}

export const PROCUREMENT_TYPES: RefItem[] = [
  { code: 'RFI', label: 'Request for Information' },
  { code: 'RFQ', label: 'Request for Qualification' },
  { code: 'RFP', label: 'Request for Proposal' },
  { code: 'ITT', label: 'Invitation to Tender' },
  { code: 'UNSOLICITED', label: 'Unsolicited Proposal' },
];

export const TENDER_STAGES: RefItem[] = [
  { code: 'DRAFT', label: 'Draft' },
  { code: 'PUBLISHED', label: 'Published' },
  { code: 'CLARIFICATION', label: 'Clarification' },
  { code: 'SUBMISSION_CLOSED', label: 'Submission closed' },
  { code: 'UNDER_EVALUATION', label: 'Under evaluation' },
  { code: 'PREFERRED_BIDDER', label: 'Preferred bidder' },
  { code: 'FINANCIAL_CLOSE', label: 'Financial close' },
  { code: 'CANCELLED', label: 'Cancelled' },
];

/** Payment mechanisms for PPP/concession contracts (spec §13). */
export const PAYMENT_MECHANISMS: RefItem[] = [
  { code: 'government-pay', label: 'Government pays (availability)' },
  { code: 'user-pay', label: 'Users pay (demand)' },
  { code: 'hybrid', label: 'Hybrid (government + user)' },
  { code: 'revenue-share', label: 'Revenue share to authority' },
  { code: 'upfront-premium', label: 'Upfront premium' },
];

/** Standard risks for the allocation matrix (spec §13). */
export const RISK_CATEGORIES: RefItem[] = [
  { code: 'site', label: 'Site & ground conditions' },
  { code: 'design', label: 'Design' },
  { code: 'construction', label: 'Construction & completion' },
  { code: 'cost-overrun', label: 'Cost overrun' },
  { code: 'demand', label: 'Demand / volume' },
  { code: 'revenue', label: 'Revenue' },
  { code: 'operating', label: 'Operating & maintenance' },
  { code: 'financing', label: 'Financing & interest rate' },
  { code: 'currency', label: 'Currency' },
  { code: 'inflation', label: 'Inflation' },
  { code: 'regulatory', label: 'Regulatory & permits' },
  { code: 'political', label: 'Political & change in law' },
  { code: 'force-majeure', label: 'Force majeure' },
  { code: 'handback', label: 'Handback & residual value' },
];

export const RISK_BEARERS: RefItem[] = [
  { code: 'authority', label: 'Authority' },
  { code: 'private', label: 'Private party' },
  { code: 'shared', label: 'Shared' },
  { code: 'insured', label: 'Insured / transferred' },
];

/** Default weighted evaluation criteria — authorities may override (spec §13). */
export const DEFAULT_EVALUATION_CRITERIA = [
  { key: 'technical', label: 'Technical solution', weight: 30 },
  { key: 'financial', label: 'Financial offer', weight: 30 },
  { key: 'experience', label: 'Experience & track record', weight: 15 },
  { key: 'delivery', label: 'Delivery programme', weight: 10 },
  { key: 'financialCapacity', label: 'Financial capacity', weight: 10 },
  { key: 'localContent', label: 'Local content & ESG', weight: 5 },
];

export const PROCUREMENT_REFERENCE = {
  procurementTypes: PROCUREMENT_TYPES,
  tenderStages: TENDER_STAGES,
  paymentMechanisms: PAYMENT_MECHANISMS,
  riskCategories: RISK_CATEGORIES,
  riskBearers: RISK_BEARERS,
  defaultEvaluationCriteria: DEFAULT_EVALUATION_CRITERIA,
};

export const PROCUREMENT_TYPE_CODES = PROCUREMENT_TYPES.map((p) => p.code);
export const PAYMENT_MECHANISM_CODES = PAYMENT_MECHANISMS.map((p) => p.code);
export const RISK_BEARER_CODES = RISK_BEARERS.map((r) => r.code);
