'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { compareOffers } from '../actions';
import type { ComparisonOutput } from '../types';

const GRADE_TONE: Record<string, 'success' | 'primary' | 'warning' | 'neutral'> = {
  A: 'success',
  B: 'primary',
  C: 'warning',
  D: 'neutral',
};

export function OfferComparison({
  opportunityId,
  initial,
}: {
  opportunityId: string;
  initial: ComparisonOutput;
}) {
  const [data, setData] = useState<ComparisonOutput>(initial);
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(initial.criteria.map((c) => [c.key, Math.round((initial.weights[c.key] ?? 0) * 100)])),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply() {
    setError(null);
    startTransition(async () => {
      try {
        setData(await compareOffers(opportunityId, weights));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Weighted comparison</h3>
        <span className="text-xs text-muted">Adjust weights, then apply</span>
      </div>

      {/* Weights */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {data.criteria.map((c) => (
          <label key={c.key} className="text-xs">
            <span className="mb-1 block text-muted">{c.label}: {weights[c.key] ?? 0}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[c.key] ?? 0}
              onChange={(e) => setWeights({ ...weights, [c.key]: Number(e.target.value) })}
              className="w-full"
            />
          </label>
        ))}
      </div>
      <button onClick={apply} disabled={pending} className="btn btn-outline mt-3 text-xs">
        {pending ? 'Scoring…' : 'Apply weights'}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* Ranked table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="py-2 pr-3">Offer</th>
              {data.criteria.map((c) => (
                <th key={c.key} className="px-2 py-2 text-center font-medium">{c.label}</th>
              ))}
              <th className="px-2 py-2 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.ranked.map((row) => {
              const recommended = row.offerId === data.recommendedOfferId;
              return (
                <tr key={row.offerId} className={`border-b border-border/60 ${recommended ? 'bg-primary/[0.06]' : ''}`}>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.submittedByName}</span>
                      {recommended && <Badge tone="accent">Recommended</Badge>}
                    </div>
                  </td>
                  {row.criteria.map((cs) => (
                    <td key={cs.key} className="px-2 py-2 text-center">
                      <div className="mx-auto h-1.5 w-14 rounded-full bg-foreground/10">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.round(cs.normalized * 100)}%` }} />
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center">
                    <Badge tone={GRADE_TONE[row.grade]}>{row.score}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.ranked[0]?.reasons.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Top offer ({data.ranked[0].submittedByName}): {data.ranked[0].reasons.join(' · ')}.
        </p>
      )}
    </div>
  );
}
