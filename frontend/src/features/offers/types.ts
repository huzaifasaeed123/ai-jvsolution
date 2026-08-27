export type OfferType = 'EOI' | 'OFFER';
export type OfferStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Offer {
  id: string;
  opportunityId: string;
  type: OfferType;
  status: OfferStatus;
  structure: string | null;
  currency: string;
  investmentAmount: number | null;
  ownerSharePct: number | null;
  targetIrr: number | null;
  developmentMonths: number | null;
  experienceYears: number | null;
  financialCapacity: number | null;
  guarantees: string | null;
  message: string | null;
  submittedBy: { id: string; fullName: string; email: string; companyId: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface OfferInput {
  structure?: string;
  investmentAmount?: number;
  ownerSharePct?: number;
  targetIrr?: number;
  developmentMonths?: number;
  experienceYears?: number;
  financialCapacity?: number;
  guarantees?: string;
  message?: string;
}
