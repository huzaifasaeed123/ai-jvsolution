import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { UserStatus, AccessRequestStatus } from './types';
import type { Role, AccessLevel } from '@/features/auth/types';
import type { OpportunityStatus } from '@/features/opportunities/types';

/** Shared display helpers for the back-office tables. */

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  DEVELOPER: 'Developer',
  INVESTOR: 'Investor',
  GOVERNMENT: 'Government',
  ADMIN: 'Admin',
};

export const ACCESS_LABEL: Record<AccessLevel, string> = {
  PUBLIC: 'Public',
  REGISTERED: 'Registered',
  VERIFIED: 'Verified',
  NDA: 'NDA',
  DUE_DILIGENCE: 'Due diligence',
  TRANSACTION: 'Transaction',
};

export const OPP_STATUS_TONE: Record<
  OpportunityStatus,
  'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger'
> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  MATCHED: 'primary',
  IN_DEAL: 'accent',
  CLOSED: 'neutral',
  ARCHIVED: 'warning',
};

export const ACCESS_STATUS_TONE: Record<
  AccessRequestStatus,
  'neutral' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  REVOKED: 'neutral',
};

export function StatusPill({ status }: { status: UserStatus }) {
  return (
    <Badge tone={status === 'ACTIVE' ? 'success' : 'danger'}>
      {status === 'ACTIVE' ? 'Active' : 'Suspended'}
    </Badge>
  );
}

/** Turns SCREAMING_SNAKE audit actions into something readable. */
export function humanAction(action: string): string {
  const s = action.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Actions that change someone else's standing are worth marking out. */
export function actionTone(action: string): 'neutral' | 'warning' | 'danger' | 'accent' {
  if (action.startsWith('USER_')) return action.includes('REINSTATED') ? 'accent' : 'danger';
  if (action.startsWith('OPPORTUNITY_')) return 'warning';
  if (action.includes('AWARDED') || action.includes('APPROVED')) return 'accent';
  return 'neutral';
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** "3 days ago" reads faster than a timestamp when scanning a table. */
export function relative(value: string | null): string {
  if (!value) return 'never';
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
}

export function money(value: number | null, currency: string): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** A labelled figure, used across the overview cards. */
export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'accent' | 'danger';
}) {
  return (
    <div className="card p-4">
      <p className="text-[10px] uppercase tracking-[0.09em] text-muted">{label}</p>
      <p
        className={`figure mt-1.5 text-[1.75rem] leading-none ${
          tone === 'danger' ? 'text-danger' : tone === 'accent' ? 'text-accent' : ''
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
