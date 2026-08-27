import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { formatMoney } from '@/features/opportunities/format';
import type { ChartPoint, InvestorDashboardData } from '../types';

function scoreTone(v: number): 'success' | 'primary' | 'warning' | 'danger' {
  if (v >= 75) return 'success';
  if (v >= 50) return 'primary';
  if (v >= 25) return 'warning';
  return 'danger';
}
const scoreColor = (v: number) =>
  v >= 75 ? 'var(--success)' : v >= 50 ? 'var(--primary)' : v >= 25 ? 'var(--accent)' : 'var(--danger)';

function Gauge({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5 text-center">
      <div
        className="mx-auto grid h-24 w-24 place-items-center rounded-full"
        style={{ background: `conic-gradient(${scoreColor(value)} ${value * 3.6}deg, var(--surface-2) 0deg)` }}
      >
        <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-surface">
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function Bars({ points, currency, asMoney, asPct }: { points: ChartPoint[]; currency?: string; asMoney?: boolean; asPct?: boolean }) {
  const max = Math.max(...points.map((p) => Math.abs(p.value)), 1);
  return (
    <div className="space-y-2">
      {points.map((p) => (
        <div key={p.name}>
          <div className="flex justify-between text-sm">
            <span className="text-muted">{p.name}</span>
            <span className="font-medium">
              {asMoney ? formatMoney(p.value, currency) : asPct ? `${p.value}%` : p.value.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-foreground/10">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(Math.abs(p.value) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const RISK_TONE: Record<string, 'danger' | 'warning' | 'primary' | 'neutral'> = {
  CRITICAL: 'danger', HIGH: 'danger', MEDIUM: 'warning', LOW: 'primary', INFORMATIONAL: 'neutral',
};

export function InvestorDashboard({ data }: { data: InvestorDashboardData }) {
  const { kpis, scores, charts, offers, dueDiligence, opportunity } = data;
  const ccy = kpis?.currency ?? opportunity.currency;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Score gauges */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Gauge label="Investment attractiveness" value={scores.investmentAttractiveness} />
        <Gauge label="Bankability" value={scores.bankability} />
        <Gauge label="Overall readiness" value={scores.overall} />
      </div>

      {/* KPI cards */}
      {kpis ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Project value (GDV)" value={formatMoney(kpis.projectValue, ccy)} />
          <StatCard label="Required equity" value={formatMoney(kpis.requiredEquity, ccy)} hint={`LTC ${pct(kpis.ltc)}`} />
          <StatCard label="Required debt" value={formatMoney(kpis.requiredDebt, ccy)} hint={`LTV ${pct(kpis.ltv)}`} />
          <StatCard label="Net profit" value={formatMoney(kpis.netProfit, ccy)} />
          <StatCard label="Project IRR" value={pct(kpis.projectIrr)} />
          <StatCard label="NPV" value={formatMoney(kpis.npv, ccy)} />
          <StatCard label="ROE" value={pct(kpis.roe)} />
          <StatCard label="Development" value={kpis.developmentMonths ? `${kpis.developmentMonths} mo` : '—'} hint={`payback ${kpis.paybackMonths} mo`} />
        </div>
      ) : (
        <div className="card p-6 text-center text-sm text-muted">
          No feasibility model yet — run the AI Feasibility Studio and save it against this opportunity to populate the financial KPIs.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Readiness */}
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold">Readiness</h3>
          <Bars points={charts.readiness} asPct />
        </div>

        {/* Sources & Uses */}
        {charts.sourcesAndUses.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold">Sources of funds</h3>
            <Bars points={charts.sourcesAndUses} currency={ccy} asMoney />
          </div>
        )}

        {/* Cost composition */}
        {charts.costComposition.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold">Cost composition</h3>
            <Bars points={charts.costComposition} currency={ccy} asMoney />
          </div>
        )}

        {/* Returns */}
        {charts.returnComparison.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold">Returns</h3>
            <Bars points={charts.returnComparison} asPct />
          </div>
        )}
      </div>

      {/* Offers + Due diligence */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Offers</h3>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-3xl font-semibold">{offers.count}</span>
            <div className="text-muted">
              <p>active offer{offers.count === 1 ? '' : 's'}</p>
              {offers.bestOwnerSharePct != null && <p>best owner share {offers.bestOwnerSharePct}%</p>}
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Due diligence</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span>{dueDiligence.closed}/{dueDiligence.total} closed</span>
            {Object.entries(dueDiligence.byRisk).map(([r, n]) => (
              <Badge key={r} tone={RISK_TONE[r] ?? 'neutral'}>{r} {n}</Badge>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted">
        Scores are deterministic indicators from platform data (feasibility, offers, verification, data room, due diligence) —
        {' '}<Badge tone={scoreTone(scores.overall)}>readiness {scores.overall}</Badge>. Not investment advice.
      </p>
    </div>
  );
}
