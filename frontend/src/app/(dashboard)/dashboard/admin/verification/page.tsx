import Link from 'next/link';
import { getVerificationQueue } from '@/features/admin/api';
import { Badge } from '@/components/ui/Badge';
import { relative, money } from '@/features/admin/format';

export const metadata = { title: 'Verification · Back office' };

/** Why a listing is in the queue drives how urgent it should look. */
const REASON_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  'Never reviewed': 'danger',
  'Self-declared only': 'warning',
  'Unresolved items outstanding': 'neutral',
};

export default async function VerificationQueuePage() {
  const queue = await getVerificationQueue();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Awaiting verification review</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Listings on the market that were never reviewed, are still self-declared, or carry
            unresolved items. Least verified first.
          </p>
        </div>
        <span className="figure text-2xl">{queue.total}</span>
      </div>

      {queue.items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-14 text-center">
          <p className="display text-lg">Nothing waiting</p>
          <p className="mt-1.5 text-sm text-muted">Every live listing has been reviewed.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {queue.items.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-muted">{o.reference}</p>
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="display mt-0.5 block truncate text-[1.0625rem] hover:text-primary"
                  >
                    {o.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted">
                    {o.owner.fullName} · {o.countryCode} · {money(o.projectValue, o.currency)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral">{o.verification}</Badge>
                  <Badge tone={REASON_TONE[o.reason] ?? 'neutral'}>{o.reason}</Badge>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted">
                <span className="flex flex-wrap gap-x-5 gap-y-1">
                  <span>{o.verifiedCount} fields verified</span>
                  <span>{o.unresolvedCount} unresolved</span>
                  <span>
                    {o.neverReviewed
                      ? 'Never reviewed'
                      : `Reviewed ${relative(o.reviewedAt)}${
                          o.reviewerName ? ` by ${o.reviewerName}` : ''
                        }`}
                  </span>
                </span>
                <Link href={`/opportunities/${o.id}`} className="btn btn-outline px-3 py-1.5 text-xs">
                  Open passport →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
