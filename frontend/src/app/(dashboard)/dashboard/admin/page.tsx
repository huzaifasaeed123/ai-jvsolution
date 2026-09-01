import Link from 'next/link';
import { getOverview, getGrowth, getVerificationQueue, listAccessRequests } from '@/features/admin/api';
import { Stat, ROLE_LABEL, OPP_STATUS_TONE } from '@/features/admin/format';
import { Badge } from '@/components/ui/Badge';
import { STAGE_LABEL, STAGE_TONE } from '@/features/tenders/format';

export const metadata = { title: 'Back office' };

/** Horizontal bars, sized against the largest value in the set. */
function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-sm">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: max > 0 ? `${Math.max(3, (count / max) * 100)}%` : '0%' }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
        {count}
      </span>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [overview, growth, queue, pending] = await Promise.all([
    getOverview(),
    getGrowth(),
    getVerificationQueue(),
    listAccessRequests({ status: 'PENDING', limit: '100' }),
  ]);

  if (!overview) {
    return <p className="card p-8 text-center text-sm text-muted">Unable to load platform figures.</p>;
  }

  const suspended = overview.users.byStatus.find((s) => s.status === 'SUSPENDED')?._count ?? 0;
  const published = overview.opportunities.find((o) => o.status === 'PUBLISHED')?._count ?? 0;
  const totalListings = overview.opportunities.reduce((s, o) => s + o._count, 0);
  const roleMax = Math.max(1, ...overview.users.byRole.map((r) => r._count));
  const oppMax = Math.max(1, ...overview.opportunities.map((o) => o._count));

  // Longest-waiting request first — that is the one an operator should chase.
  const stalePending = [...pending.items].sort(
    (a, b) => (b.pendingDays ?? 0) - (a.pendingDays ?? 0),
  )[0];

  const growthSeries = growth
    ? ([
        { key: 'users', label: 'Users', points: growth.users },
        { key: 'opportunities', label: 'Listings', points: growth.opportunities },
        { key: 'tenders', label: 'Tenders', points: growth.tenders },
        { key: 'bids', label: 'Bids', points: growth.bids },
        { key: 'offers', label: 'Offers', points: growth.offers },
      ] as const)
    : [];

  return (
    <div className="space-y-8">
      {/* Headline figures */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Users"
          value={overview.users.total}
          hint={suspended > 0 ? `${suspended} suspended` : 'none suspended'}
        />
        <Stat
          label="Listings"
          value={totalListings}
          hint={`${published} live on the market`}
        />
        <Stat
          label="Awaiting review"
          value={queue.total}
          tone={queue.total > 0 ? 'accent' : undefined}
          hint={<Link href="/dashboard/admin/verification" className="hover:underline">Open queue →</Link>}
        />
        <Stat
          label="Pending access"
          value={pending.total}
          tone={stalePending && (stalePending.pendingDays ?? 0) > 7 ? 'danger' : undefined}
          hint={
            stalePending
              ? `oldest waiting ${stalePending.pendingDays} days`
              : 'nothing waiting'
          }
        />
      </div>

      {/* Composition */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Users by role</h2>
          <div className="mt-4 space-y-2.5">
            {overview.users.byRole.map((r) => (
              <BarRow key={r.role} label={ROLE_LABEL[r.role] ?? r.role} count={r._count} max={roleMax} />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold">Listings by status</h2>
          <div className="mt-4 space-y-2.5">
            {overview.opportunities.map((o) => (
              <BarRow key={o.status} label={o.status} count={o._count} max={oppMax} />
            ))}
          </div>
        </div>
      </div>

      {/* Procurement + engines */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Procurement by stage</h2>
          {overview.tenders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No tenders yet.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {overview.tenders.map((t) => (
                <span key={t.stage} className="flex items-center gap-2">
                  <Badge tone={STAGE_TONE[t.stage]}>{STAGE_LABEL[t.stage] ?? t.stage}</Badge>
                  <span className="font-mono text-xs tabular-nums text-muted">{t._count}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold">Analysis engine runs</h2>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { l: 'Feasibility', v: overview.engines.feasibility },
              { l: 'Valuation', v: overview.engines.valuation },
              { l: 'Estimate', v: overview.engines.estimate },
              { l: 'Total', v: overview.engines.total },
            ].map((e) => (
              <div key={e.l}>
                <p className="figure text-xl leading-none">{e.v}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-muted">{e.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth */}
      {growth && (
        <div className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Growth by month</h2>
            <span className="font-mono text-[11px] text-muted">since {growth.since}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.09em] text-muted">
                  <th className="py-2 pr-4">Series</th>
                  {growth.users.map((p) => (
                    <th key={p.month} className="px-2 py-2 text-right font-mono">
                      {p.month}
                    </th>
                  ))}
                  {growth.users.length === 0 && <th className="px-2 py-2">—</th>}
                </tr>
              </thead>
              <tbody>
                {growthSeries.map((s) => (
                  <tr key={s.key} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4">{s.label}</td>
                    {growth.users.map((u) => {
                      const hit = s.points.find((p) => p.month === u.month);
                      return (
                        <td
                          key={u.month}
                          className="px-2 py-2 text-right font-mono tabular-nums"
                        >
                          {hit ? hit.count : <span className="text-muted">0</span>}
                        </td>
                      );
                    })}
                    {growth.users.length === 0 && (
                      <td className="px-2 py-2 text-muted">no data</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
