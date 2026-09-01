import type { Role, AccessLevel } from '@/features/auth/types';
import type { OpportunityStatus, VerificationTier, OwnerCategory } from '@/features/opportunities/types';
import type { TenderStage, ProcurementType } from '@/features/tenders/types';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessLevel: AccessLevel;
  status: UserStatus;
  country: string | null;
  avatarUrl: string | null;
  companyId: string | null;
  company?: { id: string; name: string } | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  suspendedById: string | null;
  lastLoginAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOpportunity {
  id: string;
  reference: string;
  title: string;
  summary?: string | null;
  sector: string;
  countryCode: string;
  city: string | null;
  status: OpportunityStatus;
  verification: VerificationTier;
  ownerCategory: OwnerCategory;
  currency: string;
  projectValue: number | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner: { id: string; fullName: string; email: string; role: Role };
}

/** A queue row explains why it is in the queue, so a reviewer can triage. */
export interface QueueItem extends AdminOpportunity {
  neverReviewed: boolean;
  unresolvedCount: number;
  verifiedCount: number;
  reviewedAt: string | null;
  reviewerName: string | null;
  reason: string;
}

export interface AdminTender {
  id: string;
  reference: string;
  title: string;
  stage: TenderStage;
  procurementType: ProcurementType;
  currency: string;
  estimatedValue: number | null;
  submissionDeadline: string | null;
  publishedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  authority: { id: string; fullName: string; email: string };
  opportunity: { id: string; reference: string; countryCode: string };
  bidCount: number;
  deadlinePassed: boolean;
  /** Live procurement sitting past its own deadline — needs intervention. */
  stalled: boolean;
}

export interface AuditEntry {
  id: string;
  action: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  actor: { id: string; fullName?: string; email?: string; role?: Role } | null;
  targetUser: { id: string; fullName?: string; email?: string } | null;
  opportunity: { id: string; reference?: string; title?: string } | null;
}

export interface AdminAccessRequest {
  id: string;
  status: AccessRequestStatus;
  message: string | null;
  ndaSignedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  pendingDays: number | null;
  accessGranted: boolean;
  requester: { id: string; fullName: string; email: string; role: Role };
  opportunity: { id: string; reference: string; title: string; ownerId: string };
}

export interface AdminOverview {
  users: {
    total: number;
    byRole: { role: Role; _count: number }[];
    byStatus: { status: UserStatus; _count: number }[];
  };
  opportunities: { status: OpportunityStatus; _count: number }[];
  tenders: { stage: TenderStage; _count: number }[];
  engines: { feasibility: number; valuation: number; estimate: number; total: number };
  accessRequests: { status: AccessRequestStatus; count: number }[];
}

export interface GrowthPoint {
  month: string;
  count: number;
}

export interface Growth {
  since: string;
  users: GrowthPoint[];
  opportunities: GrowthPoint[];
  tenders: GrowthPoint[];
  bids: GrowthPoint[];
  offers: GrowthPoint[];
}
