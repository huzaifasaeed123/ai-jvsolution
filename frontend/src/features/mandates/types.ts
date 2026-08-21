import type { Opportunity } from '@/features/opportunities/types';

export type OwnerCategory = 'PRIVATE' | 'SEMI_GOVERNMENT' | 'GOVERNMENT';
export type RiskLevel = 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH';

export interface Mandate {
  id: string;
  title: string;
  ownerId: string;
  sectors: string[];
  countryCodes: string[];
  projectTypes: string[];
  structures: string[];
  ownerCategories: OwnerCategory[];
  currency: string;
  minInvestment: number | null;
  maxInvestment: number | null;
  targetIrr: number | null;
  riskAppetite: RiskLevel | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FitFactor {
  key: string;
  label: string;
  weight: number;
  score: number;
  points: number;
  applicable: boolean;
  detail: string;
}

export interface FitResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  gradeLabel: string;
  factors: FitFactor[];
  reasons: string[];
}

export interface MatchItem {
  opportunity: Opportunity;
  fit: FitResult;
}

export interface MatchResult {
  mandateId: string;
  count: number;
  matches: MatchItem[];
}
