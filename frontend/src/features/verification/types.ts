export type VerificationTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export interface Passport {
  tier: VerificationTier;
  verifiedFields: string[];
  unresolvedItems: string[];
  reviewedAt: string | null;
  canVerify: boolean;
  reviewer?: string | null;
  notes?: string | null;
}

export interface RefItem {
  code: string;
  label: string;
}

export interface VerificationReference {
  tiers: RefItem[];
  verifiableFields: RefItem[];
}
