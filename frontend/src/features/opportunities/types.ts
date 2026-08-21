export type OwnerCategory = 'PRIVATE' | 'SEMI_GOVERNMENT' | 'GOVERNMENT';
export type OpportunityStatus = 'DRAFT' | 'PUBLISHED' | 'MATCHED' | 'IN_DEAL' | 'CLOSED' | 'ARCHIVED';
export type VerificationTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
export type RiskLevel = 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH';
export type PermitStatus = 'NONE' | 'PRELIMINARY' | 'IN_PROGRESS' | 'APPROVED';
export type DataRoomReadiness = 'EMPTY' | 'BASIC' | 'PARTIAL' | 'COMPLETE';

/** Shape returned by the API (public view). Confidential fields are optional and
 * only present in the owner/admin (full) view. */
export interface Opportunity {
  id: string;
  reference: string;
  title: string;
  summary: string | null;
  sector: string;
  projectType: string | null;
  ownerCategory: OwnerCategory;
  status: OpportunityStatus;
  verification: VerificationTier;

  countryCode: string;
  region: string | null;
  city: string | null;

  landAreaSqm: number | null;
  gfaSqm: number | null;
  buaSqm: number | null;
  nsaSqm: number | null;
  plotRatio: number | null;
  landUse: string | null;
  heightLimit: string | null;

  currency: string;
  projectValue: number | null;
  investmentRequired: number | null;
  targetIrr: number | null;
  developmentPeriodMonths: number | null;
  concessionPeriodYears: number | null;

  structures: string[];
  riskLevel: RiskLevel | null;
  permitStatus: PermitStatus;
  dataRoomReadiness: DataRoomReadiness;

  requiredDeveloperExperience: string | null;
  requiredContractorClass: string | null;
  requiredOperatorType: string | null;
  financingRequired: boolean;

  createdAt: string;
  confidentialLocked: boolean;

  // Full view only:
  addressLine?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  owner?: { id: string; fullName: string; email: string; companyId: string | null };
  ownerId?: string;
}

export interface OpportunityListResult {
  items: Opportunity[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface RefItem {
  code: string;
  label: string;
}

export interface OpportunityReference {
  sectors: RefItem[];
  projectTypes: RefItem[];
  structures: RefItem[];
  ownerCategories: RefItem[];
  riskLevels: RefItem[];
  permitStatuses: RefItem[];
  dataRoomReadiness: RefItem[];
  verificationTiers: RefItem[];
}
