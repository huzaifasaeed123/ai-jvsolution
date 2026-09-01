import Link from 'next/link';
import { listAudit, listAuditActions } from '@/features/admin/api';
import { Badge } from '@/components/ui/Badge';
import { AdminFilters } from '@/features/admin/components/AdminFilters';
import { Pager } from '@/features/admin/components/Pager';
import { humanAction, actionTone, formatDateTime } from '@/features/admin/format';

export const metadata = { title: 'Activity · Back office' };

type SP = Record<string, string | string[] | undefined>;
function flat(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

/** Metadata is free-form JSON; render the shallow pairs and skip the rest. */
function Meta({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  const pairs = Object.entries(data).filter(
    ([, v]) => v !== null && typeof v !== 'object',
  );
  if (pairs.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-l-2 border-border pl-3 text-xs">
      {pairs.map(([k, v]) => (
        <span key={k}>
          <span className="text-muted">{k}: </span>
          <span className="text-foreground/80">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = flat(await searchParams);
  const [result, actions] = await Promise.all([listAudit(sp), listAuditActions()]);

  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Consequential actions only — access grants, NDA signatures, document downloads, bids,
        awards and administrator decisions. Page views are not recorded.
      </p>

      <AdminFilters
        searchPlaceholder="Search is not available here"
        fields={[
          {
            key: 'action',
            label: 'Any action',
            options: actions.map((a) => ({
              value: a.action,
              label: `${humanAction(a.action)} (${a.count})`,
            })),
          },
        ]}
      />

      {result.items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-14 text-center">
          <p className="display text-lg">No activity matches those filters</p>
        </div>
      ) : (
        <ol className="mt-5 space-y-2.5">
          {result.items.map((e) => (
            <li key={e.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge tone={actionTone(e.action)}>{humanAction(e.action)}</Badge>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">
                      {e.actor?.fullName ?? e.actor?.email ?? 'System'}
                    </span>
                    {e.targetUser && (
                      <>
                        <span className="text-muted"> → </span>
                        <span className="font-medium">
                          {e.targetUser.fullName ?? e.targetUser.email ?? e.targetUser.id}
                        </span>
                      </>
                    )}
                  </p>
                  {e.opportunity && (
                    <Link
                      href={`/opportunities/${e.opportunity.id}`}
                      className="mt-1 block truncate text-sm text-muted hover:text-primary"
                    >
                      <span className="font-mono text-[11px]">{e.opportunity.reference}</span>{' '}
                      {e.opportunity.title}
                    </Link>
                  )}
                  <Meta data={e.metadata} />
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted">
                  {formatDateTime(e.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        total={result.total}
        basePath="/dashboard/admin/audit"
        params={sp}
      />
    </div>
  );
}
