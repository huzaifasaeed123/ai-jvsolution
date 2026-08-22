export type AccessStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export interface AccessRequest {
  id: string;
  opportunityId: string;
  opportunity: { id: string; reference: string; title: string };
  requesterId: string;
  requester: { id: string; fullName: string; email: string };
  ownerId: string;
  status: AccessStatus;
  message: string | null;
  ndaSignedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  accessGranted: boolean;
}
