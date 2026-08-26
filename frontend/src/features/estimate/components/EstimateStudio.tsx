'use client';

import { useState, useTransition } from 'react';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { computeEstimate, saveEstimate } from '../actions';
import type { EstimateReference, EstimateResult } from '../types';

function money(n: number | null, ccy = 'USD') {
  if (n === null) return '—';
  return new Intl.NumberFormat('en', { style: 'currency', currency: ccy, notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function EstimateStudio({ reference, opportunityId }: { reference: EstimateReference; opportunityId?: string }) {
  const [areaSqm, setArea] = useState('10000');
  const [specLevel, setSpec] = useState('standard');
  const [units, setUnits] = useState('');
  const [unitBasis, setUnitBasis] = useState('unit');
  const [contingencyPct, setCont] = useState('8');
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function inputs() {
    return {
      areaSqm: Number(areaSqm),
      specLevel,
      contingencyPct: contingencyPct ? Number(contingencyPct) : undefined,
      units: units ? Number(units) : undefined,
      unitBasis: units ? unitBasis : undefined,
    };
  }

  function run() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        setResult(await computeEstimate(inputs()));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function save() {
    startTransition(async () => {
      try {
        await saveEstimate({ ...inputs(), opportunityId, label: 'Estimate run' });
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
      <div className="card h-fit p-5">
        <h2 className="text-sm font-semibold">Inputs</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">GFA (m²)</label>
            <input className="input" value={areaSqm} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Specification level</label>
            <select className="input" value={specLevel} onChange={(e) => setSpec(e.target.value)}>
              {reference.specLevels.map((s) => (
                <option key={s.code} value={s.code}>{s.label} · {s.baseRatePerSqm}/m²</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Contingency %</label>
            <input className="input" value={contingencyPct} onChange={(e) => setCont(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Units (optional)</label>
              <input className="input" value={units} onChange={(e) => setUnits(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Unit basis</label>
              <select className="input" value={unitBasis} onChange={(e) => setUnitBasis(e.target.value)}>
                {reference.unitBases.map((u) => (
                  <option key={u.code} value={u.code}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button onClick={run} disabled={pending} className="btn btn-primary mt-4 w-full">
          {pending ? 'Estimating…' : 'Run estimate'}
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
            Enter the scheme and run the estimate.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total development cost" value={money(o.totalDevelopmentCost, ccy)} hint={`${o.specLevel} · ${money(o.rateUsed, ccy)}/m²`} />
              <StatCard label="Cost per m²" value={money(o.costPerSqm, ccy)} />
              <StatCard label={o.unitBasis ? `Cost per ${o.unitBasis}` : 'Construction'} value={money(o.costPerUnit ?? o.construction, ccy)} />
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold">Elemental construction cost</h3>
              <div className="mt-3 space-y-2">
                {o.elements.map((e) => {
                  const w = o.construction > 0 ? (e.amount / o.construction) * 100 : 0;
                  return (
                    <div key={e.code}>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">{e.label}</span>
                        <span className="font-medium">{money(e.amount, ccy)}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-foreground/10">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-border pt-3 text-sm sm:grid-cols-3">
                <Row label="External works" v={money(o.externalWorks, ccy)} />
                <Row label="Professional fees" v={money(o.professionalFees, ccy)} />
                <Row label="Authority fees" v={money(o.authorityFees, ccy)} />
                <Row label="Contingency" v={money(o.contingency, ccy)} />
                <Row label="Escalation" v={money(o.escalation, ccy)} />
                <Row label="Insurance" v={money(o.insurance, ccy)} />
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

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
