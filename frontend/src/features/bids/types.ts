export type BidStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'WITHDRAWN'
  | 'DISQUALIFIED'
  | 'EVALUATED'
  | 'PREFERRED'
  | 'UNSUCCESSFUL';

/** Fields always present — even when the authority's view is sealed. */
export interface BidBase {
  id: string;
  reference: string;
  tenderId: string;
  status: BidStatus;
  bidder: { id: string; fullName: string; email: string; companyId: string | null };
  consortium: { id: string; name: string } | null;
  bidSecurityProvided: boolean;
  checklistComplete: boolean;
  submittedAt: string | null;
  withdrawnAt: string | null;
  disqualifiedReason: string | null;
  createdAt: string;
  updatedAt: string;
  sealed: boolean;
}

/** Envelope contents — present only when unsealed. */
export interface BidEnvelope {
  technicalProposal: string | null;
  methodology: string | null;
  deliveryMonths: number | null;
  experienceYears: number | null;
  keyPersonnel: string | null;
  localContentPct: number | null;
  currency: string;
  bidPrice: number | null;
  annualPayment: number | null;
  revenueSharePct: number | null;
  financialCapacity: number | null;
  declarations: string | null;
}

export type Bid = BidBase & Partial<BidEnvelope>;

export interface BidInput {
  consortiumId?: string;
  technicalProposal?: string;
  methodology?: string;
  deliveryMonths?: number;
  experienceYears?: number;
  keyPersonnel?: string;
  localContentPct?: number;
  currency?: string;
  bidPrice?: number;
  annualPayment?: number;
  revenueSharePct?: number;
  financialCapacity?: number;
  bidSecurityProvided?: boolean;
  checklistComplete?: boolean;
  declarations?: string;
}

export interface TenderBids {
  sealed: boolean;
  submissionDeadline: string | null;
  count: number;
  bids: Bid[];
}

/** Evaluation (spec §13) — scored against the criteria published with the tender. */
export interface CriterionResult {
  key: string;
  label: string;
  weight: number;
  normalized: number;
  points: number;
  source: 'objective' | 'manual' | 'unscored';
}

export interface BidEvaluation {
  bidId: string;
  reference: string;
  bidderName: string;
  score: number;
  rank: number;
  criteria: CriterionResult[];
  notes: string[];
}

export interface EvaluationOutput {
  version: string;
  criteria: { key: string; label: string; weight: number }[];
  evaluated: BidEvaluation[];
  recommendedBidId: string | null;
}
