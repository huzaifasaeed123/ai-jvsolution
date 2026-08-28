import type { BidStatus } from './types';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

export const BID_STATUS_TONE: Record<BidStatus, Tone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'primary',
  WITHDRAWN: 'neutral',
  DISQUALIFIED: 'danger',
  EVALUATED: 'warning',
  PREFERRED: 'success',
  UNSUCCESSFUL: 'danger',
};

export const BID_STATUS_LABEL: Record<BidStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  WITHDRAWN: 'Withdrawn',
  DISQUALIFIED: 'Disqualified',
  EVALUATED: 'Evaluated',
  PREFERRED: 'Preferred bidder',
  UNSUCCESSFUL: 'Unsuccessful',
};

/** Statuses in which the bidder may still change their bid. */
export const EDITABLE_STATUSES: BidStatus[] = ['DRAFT', 'SUBMITTED'];
