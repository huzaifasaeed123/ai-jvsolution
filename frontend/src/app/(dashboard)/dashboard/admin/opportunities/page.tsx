import Link from 'next/link';
import { listAdminOpportunities } from '@/features/admin/api';
import { Badge } from '@/components/ui/Badge';
import { AdminFilters } from '@/features/admin/components/AdminFilters';
import { ModerationActions } from '@/features/admin/components/ModerationActions';
import { Pager } from '@/features/admin/components/Pager';
import { OPP_STATUS_TONE, money, relative } from '@/features/admin/format';

export const metadata = { title: 'Listings · Back office' };

type SP = Record<string, string | string[] | undefined>;
function flat(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = flat(await searchParams);
  const result = await listAdminOpportunities(sp);

  return (
    <div>
      <AdminFilters
        searchPlaceholder="Search by title or reference…"
        fields={[
          {
            key: 'status',
            label: 'Any status',
            options: (
              ['DRAFT', 'PUBLISHED', 'MATCHED', 'IN_DEAL', 'CLOSED', 'ARCHIVED'] as const
            ).map((s) => ({ value: s, label: s })),
          },
          {
            key: 'verification',
            label: 'Any tier',
            options: (['T0', 'T1', 'T2', 'T3', 'T4', 'T5'] as const).map((t) => ({
              value: t,
              label: t,
            })),
          },
          {
            key: 'includeDeleted',
            label: 'Hide deleted',
            options: [{ value: 'true', label: 'Include deleted' }],
          },
        ]}
      />

      {result.items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-14 text-center">
          <p className="display text-lg">No listings match those filters</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {result.items.map((o) => (
            <div key={o.id} className={`card p-4 ${o.deletedAt ? 'border-danger/30' : ''}`}>
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
                    {o.owner.fullName} · {o.city ? `${o.city} · ` : ''}
                    {o.countryCode}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={OPP_STATUS_TONE[o.status]}>{o.status}</Badge>
                  <Badge tone="neutral">{o.verification}</Badge>
                  {o.deletedAt && <Badge tone="danger">Deleted</Badge>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                <span>
                  GDV{' '}
                  <span className="figure text-foreground">
                    {money(o.projectValue, o.currency)}
                  </span>
                </span>
                <span>Created {relative(o.createdAt)}</span>
                <span>Updated {relative(o.updatedAt)}</span>
              </div>

              <div className="mt-3 border-t border-border pt-3">
                <ModerationActions opportunity={o} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        total={result.total}
        basePath="/dashboard/admin/opportunities"
        params={sp}
      />
    </div>
  );
}
