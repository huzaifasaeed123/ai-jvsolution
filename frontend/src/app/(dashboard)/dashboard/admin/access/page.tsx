import Link from 'next/link';
import { listAccessRequests } from '@/features/admin/api';
import { Badge } from '@/components/ui/Badge';
import { AdminFilters } from '@/features/admin/components/AdminFilters';
import { Pager } from '@/features/admin/components/Pager';
import { ACCESS_STATUS_TONE, formatDateTime, relative } from '@/features/admin/format';

export const metadata = { title: 'Access requests · Back office' };

type SP = Record<string, string | string[] | undefined>;
function flat(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

/** A request left unanswered for over a week is the operator's problem. */
const STALE_DAYS = 7;

export default async function AdminAccessPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = flat(await searchParams);
  const result = await listAccessRequests(sp);
  const stale = result.items.filter(
    (r) => r.status === 'PENDING' && (r.pendingDays ?? 0) >= STALE_DAYS,
  ).length;

  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Every request for confidential access, platform-wide. Access is only actually granted once
        the owner has approved <em>and</em> the requester has signed the NDA — approval alone
        reveals nothing.
      </p>

      {stale > 0 && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <strong>{stale}</strong> {stale === 1 ? 'request has' : 'requests have'} been waiting{' '}
          {STALE_DAYS} days or more without an answer from the owner.
        </p>
      )}

      <AdminFilters
        searchPlaceholder="Search is not available here"
        fields={[
          {
            key: 'status',
            label: 'Any status',
            options: (['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'] as const).map((s) => ({
              value: s,
              label: s,
            })),
          },
        ]}
      />

      {result.items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-14 text-center">
          <p className="display text-lg">No access requests</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {result.items.map((r) => {
            const isStale = r.status === 'PENDING' && (r.pendingDays ?? 0) >= STALE_DAYS;
            return (
              <div key={r.id} className={`card p-4 ${isStale ? 'border-danger/30' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {r.requester.fullName}{' '}
                      <span className="font-normal text-muted">requested access to</span>
                    </p>
                    <Link
                      href={`/opportunities/${r.opportunity.id}`}
                      className="mt-0.5 block truncate text-sm hover:text-primary"
                    >
                      <span className="font-mono text-[11px] text-muted">
                        {r.opportunity.reference}
                      </span>{' '}
                      {r.opportunity.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={ACCESS_STATUS_TONE[r.status]}>{r.status}</Badge>
                    {r.accessGranted ? (
                      <Badge tone="success">Access granted</Badge>
                    ) : r.status === 'APPROVED' ? (
                      <Badge tone="warning">NDA unsigned</Badge>
                    ) : null}
                  </div>
                </div>

                {r.message && (
                  <p className="mt-2 border-l-2 border-border pl-3 text-sm text-muted">
                    {r.message}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                  <span>Requested {relative(r.createdAt)}</span>
                  {r.pendingDays !== null && (
                    <span className={isStale ? 'font-medium text-danger' : ''}>
                      Waiting {r.pendingDays} {r.pendingDays === 1 ? 'day' : 'days'}
                    </span>
                  )}
                  {r.decidedAt && <span>Decided {formatDateTime(r.decidedAt)}</span>}
                  {r.ndaSignedAt && <span>NDA signed {formatDateTime(r.ndaSignedAt)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        total={result.total}
        basePath="/dashboard/admin/access"
        params={sp}
      />
    </div>
  );
}
