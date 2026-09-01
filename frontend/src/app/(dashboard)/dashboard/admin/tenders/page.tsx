import Link from 'next/link';
import { listAdminTenders } from '@/features/admin/api';
import { Badge } from '@/components/ui/Badge';
import { AdminFilters } from '@/features/admin/components/AdminFilters';
import { Pager } from '@/features/admin/components/Pager';
import { money, formatDate, relative } from '@/features/admin/format';
import { STAGE_LABEL, STAGE_TONE, PROCUREMENT_LABEL } from '@/features/tenders/format';

export const metadata = { title: 'Tenders · Back office' };

type SP = Record<string, string | string[] | undefined>;
function flat(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

export default async function AdminTendersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = flat(await searchParams);
  const result = await listAdminTenders(sp);
  const stalled = result.items.filter((t) => t.stalled).length;

  return (
    <div>
      {stalled > 0 && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <strong>{stalled}</strong>{' '}
          {stalled === 1 ? 'procurement is' : 'procurements are'} still open past their own
          submission deadline. The authority needs to close submissions or move to evaluation.
        </p>
      )}

      <AdminFilters
        searchPlaceholder="Search by title or reference…"
        fields={[
          {
            key: 'stage',
            label: 'Any stage',
            options: (
              [
                'DRAFT',
                'PUBLISHED',
                'CLARIFICATION',
                'SUBMISSION_CLOSED',
                'UNDER_EVALUATION',
                'PREFERRED_BIDDER',
                'FINANCIAL_CLOSE',
                'CANCELLED',
              ] as const
            ).map((s) => ({ value: s, label: STAGE_LABEL[s] ?? s })),
          },
        ]}
      />

      {result.items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-14 text-center">
          <p className="display text-lg">No tenders match those filters</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {result.items.map((t) => (
            <div key={t.id} className={`card p-4 ${t.stalled ? 'border-amber-500/40' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-muted">{t.reference}</p>
                  <Link
                    href={`/tenders/${t.id}`}
                    className="display mt-0.5 block truncate text-[1.0625rem] hover:text-primary"
                  >
                    {t.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted">
                    {t.authority.fullName} · {PROCUREMENT_LABEL[t.procurementType] ?? t.procurementType} ·{' '}
                    {t.opportunity.countryCode}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={STAGE_TONE[t.stage]}>{STAGE_LABEL[t.stage] ?? t.stage}</Badge>
                  {t.stalled && <Badge tone="warning">Past deadline</Badge>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                <span>
                  Value{' '}
                  <span className="figure text-foreground">
                    {money(t.estimatedValue, t.currency)}
                  </span>
                </span>
                <span>
                  Bids <span className="figure text-foreground">{t.bidCount}</span>
                </span>
                <span>Deadline {formatDate(t.submissionDeadline)}</span>
                <span>Created {relative(t.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        total={result.total}
        basePath="/dashboard/admin/tenders"
        params={sp}
      />
    </div>
  );
}
