import type { TenderStage } from './types';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

export const STAGE_TONE: Record<TenderStage, Tone> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  CLARIFICATION: 'primary',
  SUBMISSION_CLOSED: 'warning',
  UNDER_EVALUATION: 'warning',
  PREFERRED_BIDDER: 'accent',
  FINANCIAL_CLOSE: 'success',
  CANCELLED: 'danger',
};

export const STAGE_LABEL: Record<TenderStage, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Open for bids',
  CLARIFICATION: 'Clarification',
  SUBMISSION_CLOSED: 'Submission closed',
  UNDER_EVALUATION: 'Under evaluation',
  PREFERRED_BIDDER: 'Preferred bidder',
  FINANCIAL_CLOSE: 'Financial close',
  CANCELLED: 'Cancelled',
};

export const PROCUREMENT_LABEL: Record<string, string> = {
  RFI: 'Request for Information',
  RFQ: 'Request for Qualification',
  RFP: 'Request for Proposal',
  ITT: 'Invitation to Tender',
  UNSOLICITED: 'Unsolicited Proposal',
};

export const PAYMENT_LABEL: Record<string, string> = {
  'government-pay': 'Government pays (availability)',
  'user-pay': 'Users pay (demand)',
  hybrid: 'Hybrid (government + user)',
  'revenue-share': 'Revenue share to authority',
  'upfront-premium': 'Upfront premium',
};

export const RISK_BEARER_LABEL: Record<string, string> = {
  authority: 'Authority',
  private: 'Private party',
  shared: 'Shared',
  insured: 'Insured / transferred',
};

export const RISK_BEARER_TONE: Record<string, Tone> = {
  authority: 'primary',
  private: 'accent',
  shared: 'warning',
  insured: 'neutral',
};

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Human countdown that also communicates urgency. */
export function deadlineLabel(iso: string | null, daysRemaining: number | null): string {
  if (!iso) return 'No deadline set';
  if (daysRemaining === null) return formatDate(iso);
  if (daysRemaining === 0) return 'Closes today';
  if (daysRemaining === 1) return '1 day remaining';
  return `${daysRemaining} days remaining`;
}

export function deadlineTone(daysRemaining: number | null, passed: boolean): Tone {
  if (passed) return 'danger';
  if (daysRemaining === null) return 'neutral';
  if (daysRemaining <= 3) return 'danger';
  if (daysRemaining <= 10) return 'warning';
  return 'success';
}
