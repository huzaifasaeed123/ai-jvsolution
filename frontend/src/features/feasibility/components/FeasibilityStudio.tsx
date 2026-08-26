'use client';

import { useState, useTransition } from 'react';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { computeFeasibility, saveFeasibility } from '../actions';
import type { ComputeResult, FeasibilityInputs } from '../types';

const FIELDS: { key: keyof FeasibilityInputs; label: string; suffix?: string }[] = [
  { key: 'gfaSqm', label: 'GFA (m²)' },
  { key: 'efficiencyPct', label: 'Efficiency (NSA/GFA) %' },
  { key: 'salePricePerSqm', label: 'Sale price /m² (NSA)' },
  { key: 'constructionCostPerSqm', label: 'Construction /m² (GFA)' },
  { key: 'landCost', label: 'Land cost' },
  { key: 'developmentMonths', label: 'Development months' },
  { key: 'debtRatioPct', label: 'Debt ratio (LTC) %' },
  { key: 'financeRatePct', label: 'Finance rate % p.a.' },
];

const DEFAULTS: Record<string, string> = {
  gfaSqm: '10000',
  efficiencyPct: '80',
  salePricePerSqm: '5000',
  constructionCostPerSqm: '1500',
  landCost: '8000000',
  developmentMonths: '24',
  debtRatioPct: '60',
  financeRatePct: '8',
};

function money(n: number, ccy: string) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: ccy, notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const SCORE_TONE = (s: number) => (s >= 75 ? 'success' : s >= 50 ? 'primary' : s >= 25 ? 'warning' : 'danger');

export function FeasibilityStudio({ opportunityId }: { opportunityId?: string }) {
  const [vals, setVals] = useState<Record<string, string>>(DEFAULTS);
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function toInputs(): FeasibilityInputs {
    const n = (k: string) => (vals[k] ? Number(vals[k]) : undefined);
    return {
      gfaSqm: n('gfaSqm') ?? 0,
      efficiencyPct: n('efficiencyPct'),
      salePricePerSqm: n('salePricePerSqm') ?? 0,
      constructionCostPerSqm: n('constructionCostPerSqm') ?? 0,
      landCost: n('landCost') ?? 0,
      developmentMonths: n('developmentMonths'),
      debtRatioPct: n('debtRatioPct'),
      financeRatePct: n('financeRatePct'),
    };
  }

  function run() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        setResult(await computeFeasibility(toInputs()));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await saveFeasibility({ ...toInputs(), opportunityId, label: 'Studio run' });
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  const o = result?.outputs;
  const ccy = o?.currency ?? 'USD';

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Inputs */}
      <div className="card h-fit p-5">
        <h2 className="text-sm font-semibold">Inputs</h2>
        <div className="mt-3 space-y-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium text-muted">{f.label}</label>
              <input
                className="input"
                inputMode="decimal"
                value={vals[f.key] ?? ''}
                onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button onClick={run} disabled={pending} className="btn btn-primary mt-4 w-full">
          {pending ? 'Calculating…' : 'Run feasibility'}
        </button>
        {result && (
          <button onClick={save} disabled={pending} className="btn btn-outline mt-2 w-full">
            {saved ? 'Saved ✓' : 'Save run'}
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* Results */}
      <div>
        {!o ? (
          <div className="card grid h-full place-items-center p-10 text-center text-muted">
            Enter inputs and run the model to see results.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card flex flex-wrap items-center gap-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Viability</p>
                <p className="text-4xl font-bold">{o.viabilityScore}</p>
              </div>
              <Badge tone={SCORE_TONE(o.viabilityScore)}>
                {o.viabilityScore >= 75 ? 'Strong' : o.viabilityScore >= 50 ? 'Viable' : o.viabilityScore >= 25 ? 'Marginal' : 'Not viable'}
              </Badge>
              <span className="ml-auto text-xs text-muted">formula {result!.formulaVersion}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="GDV" value={money(o.gdv, ccy)} />
              <StatCard label="Total project cost" value={money(o.totalProjectCost, ccy)} />
              <StatCard label="Net profit" value={money(o.netProfit, ccy)} hint={`${pct(o.profitOnCost)} on cost`} />
              <StatCard label="Project IRR" value={pct(o.projectIrr)} hint="unlevered" />
              <StatCard label="NPV" value={money(o.npv, ccy)} />
              <StatCard label="Equity / Debt" value={`${money(o.equity, ccy)} / ${money(o.debt, ccy)}`} hint={`LTC ${pct(o.ltc)}`} />
              <StatCard label="ROE" value={pct(o.roe)} />
              <StatCard label="Break-even /m²" value={money(o.breakEvenSalePricePerSqm, ccy)} />
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold">Scenarios</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {o.scenarios.map((s) => (
                  <div key={s.name} className="rounded-lg bg-foreground/[0.03] p-3">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="mt-1 text-2xl font-semibold">{pct(s.profitOnCost)}</p>
                    <p className="text-xs text-muted">on cost · IRR {pct(s.projectIrr)}</p>
                  </div>
                ))}
              </div>
            </div>

            {result?.explanation && (
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Analysis</h3>
                  <Badge tone="neutral">{result.explanation.method} · {result.explanation.confidence}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{result.explanation.text}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
