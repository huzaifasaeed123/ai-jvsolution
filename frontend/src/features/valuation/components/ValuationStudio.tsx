'use client';

import { useState, useTransition } from 'react';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { computeValuation, saveValuation } from '../actions';
import type { ValuationMethod, ValuationResult } from '../types';

type Field = { key: string; label: string; array?: boolean };

const METHODS: { code: ValuationMethod; label: string; fields: Field[]; defaults: Record<string, string> }[] = [
  {
    code: 'residual',
    label: 'Residual land value',
    fields: [
      { key: 'gfaSqm', label: 'GFA (m²)' },
      { key: 'salePricePerSqm', label: 'Sale price /m²' },
      { key: 'constructionCostPerSqm', label: 'Construction /m²' },
      { key: 'requiredProfitOnCostPct', label: 'Required profit on cost %' },
    ],
    defaults: { gfaSqm: '10000', salePricePerSqm: '5000', constructionCostPerSqm: '1500', requiredProfitOnCostPct: '20' },
  },
  {
    code: 'comparable',
    label: 'Comparable sales',
    fields: [
      { key: 'comparables', label: 'Comparable prices /m² (comma-separated)', array: true },
      { key: 'areaSqm', label: 'Subject area (m²)' },
      { key: 'adjustmentPct', label: 'Net adjustment %' },
    ],
    defaults: { comparables: '1000, 1200, 1400', areaSqm: '500', adjustmentPct: '0' },
  },
  {
    code: 'income',
    label: 'Income capitalisation',
    fields: [
      { key: 'annualRentPerSqm', label: 'Annual rent /m²' },
      { key: 'leasableAreaSqm', label: 'Leasable area (m²)' },
      { key: 'occupancyPct', label: 'Occupancy %' },
      { key: 'opexPct', label: 'Opex % of gross rent' },
      { key: 'capRatePct', label: 'Cap rate %' },
    ],
    defaults: { annualRentPerSqm: '300', leasableAreaSqm: '1000', occupancyPct: '90', opexPct: '25', capRatePct: '7.5' },
  },
  {
    code: 'dcf',
    label: 'Discounted cash flow',
    fields: [
      { key: 'cashflows', label: 'Annual cash flows (comma-separated)', array: true },
      { key: 'discountRatePct', label: 'Discount rate %' },
      { key: 'terminalValue', label: 'Terminal value' },
    ],
    defaults: { cashflows: '2000000, 2200000, 2400000', discountRatePct: '12', terminalValue: '25000000' },
  },
];

function money(n: number | null) {
  if (n === null) return '—';
  return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function ValuationStudio({ opportunityId }: { opportunityId?: string }) {
  const [method, setMethod] = useState<ValuationMethod>('residual');
  const active = METHODS.find((m) => m.code === method)!;
  const [vals, setVals] = useState<Record<string, string>>(active.defaults);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function selectMethod(code: ValuationMethod) {
    setMethod(code);
    setVals(METHODS.find((m) => m.code === code)!.defaults);
    setResult(null);
    setSaved(false);
  }

  function buildInputs(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of active.fields) {
      const raw = vals[f.key] ?? '';
      if (f.array) {
        out[f.key] = raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
      } else if (raw !== '') {
        out[f.key] = Number(raw);
      }
    }
    return out;
  }

  function run() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        setResult(await computeValuation(method, buildInputs()));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function save() {
    startTransition(async () => {
      try {
        await saveValuation(method, buildInputs(), { opportunityId, label: `${active.label} run` });
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  const o = result?.outputs;

  return (
    <div>
      {/* Method tabs */}
      <div className="flex flex-wrap gap-2">
        {METHODS.map((m) => (
          <button
            key={m.code}
            onClick={() => selectMethod(m.code)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${method === m.code ? 'border-foreground bg-foreground text-background' : 'border-border-strong hover:bg-foreground/5'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card h-fit p-5">
          <h2 className="text-sm font-semibold">{active.label}</h2>
          <div className="mt-3 space-y-3">
            {active.fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-muted">{f.label}</label>
                <input
                  className="input"
                  value={vals[f.key] ?? ''}
                  onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <button onClick={run} disabled={pending} className="btn btn-primary mt-4 w-full">
            {pending ? 'Valuing…' : 'Run valuation'}
          </button>
          {result && (
            <button onClick={save} disabled={pending} className="btn btn-outline mt-2 w-full">
              {saved ? 'Saved ✓' : 'Save run'}
            </button>
          )}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <div>
          {!o ? (
            <div className="card grid h-full place-items-center p-10 text-center text-muted">
              Choose a method, enter inputs, and run the valuation.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Indicated value" value={money(o.value)} />
                <StatCard label="Range" value={`${money(o.low)} – ${money(o.high)}`} />
                <StatCard label="Per m²" value={o.perSqm !== null ? money(o.perSqm) : '—'} />
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold">Breakdown</h3>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  {Object.entries(o.breakdown).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-muted">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium">{v.toLocaleString()}</span>
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
    </div>
  );
}
