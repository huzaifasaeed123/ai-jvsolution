export type ProcurementType = 'RFI' | 'RFQ' | 'RFP' | 'ITT' | 'UNSOLICITED';

export type TenderStage =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CLARIFICATION'
  | 'SUBMISSION_CLOSED'
  | 'UNDER_EVALUATION'
  | 'PREFERRED_BIDDER'
  | 'FINANCIAL_CLOSE'
  | 'CANCELLED';

export interface RiskAllocationItem {
  risk: string;
  bearer: string;
  notes?: string;
}

export interface EvaluationCriterion {
  key: string;
  label: string;
  weight: number;
}

export interface Tender {
  id: string;
  reference: string;
  title: string;
  procurementType: ProcurementType;
  stage: TenderStage;
  opportunity: { id: string; reference: string; title: string; countryCode: string; sector: string };
  authority: { id: string; name: string };
  isAuthority: boolean;

  employerRequirements: string | null;
  outputSpecification: string | null;
  siteInformation: string | null;
  governmentSupport: string | null;
  paymentMechanism: string | null;
  riskAllocation: RiskAllocationItem[];
  evaluationCriteria: EvaluationCriterion[];

  currency: string;
  estimatedValue: number | null;
  bidSecurity: number | null;
  concessionYears: number | null;

  clarificationDeadline: string | null;
  submissionDeadline: string | null;
  publishedAt: string | null;

  isOpenForBids: boolean;
  deadlinePassed: boolean;
  daysRemaining: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface Addendum {
  id: string;
  number: number;
  title: string;
  description: string;
  newSubmissionDeadline: string | null;
  issuedAt: string;
}

export interface Clarification {
  id: string;
  tenderId: string;
  question: string;
  answer: string | null;
  published: boolean;
  answeredAt: string | null;
  askedByMe: boolean;
  createdAt: string;
}

export type ChallengeStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'ORIGINAL_WINS'
  | 'CHALLENGER_WINS'
  | 'CANCELLED';

export interface SwissChallenge {
  id: string;
  tenderId: string;
  originatorId: string;
  status: ChallengeStatus;
  challengeWindowDays: number;
  challengeDeadline: string;
  originatorMayMatch: boolean;
  windowOpen: boolean;
  daysRemaining: number;
  outcomeNotes: string | null;
  decidedAt: string | null;
}

export interface ProcurementReference {
  procurementTypes: { code: string; label: string }[];
  tenderStages: { code: string; label: string }[];
  paymentMechanisms: { code: string; label: string }[];
  riskCategories: { code: string; label: string }[];
  riskBearers: { code: string; label: string }[];
  defaultEvaluationCriteria: EvaluationCriterion[];
}
