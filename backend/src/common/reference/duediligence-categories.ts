/**
 * Due Diligence categories (spec §11). Used to group checklist items and to seed
 * a starter checklist. Validated string codes so new categories add without a migration.
 */
export interface RefItem {
  code: string;
  label: string;
}

export const DD_CATEGORIES: RefItem[] = [
  { code: 'legal', label: 'Legal' },
  { code: 'ownership', label: 'Ownership' },
  { code: 'corporate', label: 'Corporate' },
  { code: 'technical', label: 'Technical' },
  { code: 'design', label: 'Design' },
  { code: 'construction', label: 'Construction' },
  { code: 'financial', label: 'Financial' },
  { code: 'commercial', label: 'Commercial' },
  { code: 'market', label: 'Market' },
  { code: 'regulatory', label: 'Regulatory' },
  { code: 'planning', label: 'Planning' },
  { code: 'tax', label: 'Tax' },
  { code: 'environmental', label: 'Environmental' },
  { code: 'esg', label: 'ESG' },
  { code: 'operational', label: 'Operational' },
  { code: 'operator', label: 'Operator' },
  { code: 'brand', label: 'Brand' },
  { code: 'contractor', label: 'Contractor' },
  { code: 'consultant', label: 'Consultant' },
  { code: 'cybersecurity', label: 'Cybersecurity' },
  { code: 'government-contract', label: 'Government contract' },
  { code: 'ppp', label: 'PPP' },
  { code: 'concession', label: 'Concession' },
  { code: 'procurement', label: 'Procurement' },
  { code: 'financing', label: 'Financing' },
];

export const DD_CATEGORY_CODES = DD_CATEGORIES.map((c) => c.code);

export const RISK_RATINGS: RefItem[] = [
  { code: 'CRITICAL', label: 'Critical' },
  { code: 'HIGH', label: 'High' },
  { code: 'MEDIUM', label: 'Medium' },
  { code: 'LOW', label: 'Low' },
  { code: 'INFORMATIONAL', label: 'Informational' },
];

export const RECEIPT_STATUSES: RefItem[] = [
  { code: 'NOT_RECEIVED', label: 'Not received' },
  { code: 'RECEIVED', label: 'Received' },
  { code: 'NOT_APPLICABLE', label: 'Not applicable' },
];

export const DD_REVIEW_STATUSES: RefItem[] = [
  { code: 'PENDING', label: 'Pending' },
  { code: 'IN_REVIEW', label: 'In review' },
  { code: 'REVIEWED', label: 'Reviewed' },
];

export const CLOSURE_STATUSES: RefItem[] = [
  { code: 'OPEN', label: 'Open' },
  { code: 'CLOSED', label: 'Closed' },
];

export const DUE_DILIGENCE_REFERENCE = {
  categories: DD_CATEGORIES,
  riskRatings: RISK_RATINGS,
  receiptStatuses: RECEIPT_STATUSES,
  reviewStatuses: DD_REVIEW_STATUSES,
  closureStatuses: CLOSURE_STATUSES,
};
