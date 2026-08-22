export type RiskRating = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type ReceiptStatus = 'NOT_RECEIVED' | 'RECEIVED' | 'NOT_APPLICABLE';
export type DdReviewStatus = 'PENDING' | 'IN_REVIEW' | 'REVIEWED';
export type ClosureStatus = 'OPEN' | 'CLOSED';

export interface DdItem {
  id: string;
  opportunityId: string;
  category: string;
  title: string;
  receipt: ReceiptStatus;
  reviewStatus: DdReviewStatus;
  riskRating: RiskRating | null;
  finding: string | null;
  recommendation: string | null;
  responsibleParty: string | null;
  mitigation: string | null;
  evidence: string | null;
  deadline: string | null;
  closure: ClosureStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DdSummary {
  total: number;
  open: number;
  closed: number;
  byRisk: Record<string, number>;
}

export interface DueDiligence {
  items: DdItem[];
  summary: DdSummary;
  canEdit: boolean;
}

export interface RefItem {
  code: string;
  label: string;
}

export interface DdReference {
  categories: RefItem[];
  riskRatings: RefItem[];
  receiptStatuses: RefItem[];
  reviewStatuses: RefItem[];
  closureStatuses: RefItem[];
}
