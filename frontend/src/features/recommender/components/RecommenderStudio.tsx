'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { recommendStructures } from '../actions';
import type { OwnerType, Level, RecommendationResult, StructureScore } from '../types';

const GRADE_TONE: Record<string, 'success' | 'primary' | 'warning' | 'neutral'> = {
  A: 'success',
  B: 'primary',
  C: 'warning',
  D: 'neutral',
};

const TOGGLES: { key: keyof State; label: string }[] = [
  { key: 'landOwnershipRetained', label: 'Owner keeps title' },
  { key: 'financingRequired', label: 'Needs private finance' },
  { key: 'userPay', label: 'Can charge users' },
  { key: 'governmentPay', label: 'Government pays' },
  { key: 'transferRequired', label: 'Asset must transfer back' },
];

interface State {
  ownerType: OwnerType;
  landOwnershipRetained: boolean;
  financingRequired: boolean;
  userPay: boolean;
  governmentPay: boolean;
  transferRequired: boolean;
  revenueCertainty: '' | Level;
  riskAppetite: '' | Level;
  concessionTermYears: string;
}

const INITIAL: State = {
  ownerType: 'PRIVATE',
  landOwnershipRetained: true,
  financingRequired: false,
  userPay: false,
  governmentPay: false,
  transferRequired: false,
  revenueCertainty: 'high',
  riskAppetite: 'medium',
  concessionTermYears: '',
};

export function RecommenderStudio() {
  const [s, setS] = useState<State>(INITIAL);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        setResult(
          await recommendStructures({
            ownerType: s.ownerType,
            landOwnershipRetained: s.landOwnershipRetained,
            financingRequired: s.financingRequired,
            userPay: s.userPay,
            governmentPay: s.governmentPay,
            transferRequired: s.transferRequired,
            revenueCertainty: s.revenueCertainty || undefined,
            riskAppetite: s.riskAppetite || undefined,
            concessionTermYears: s.concessionTermYears ? Number(s.concessionTermYears) : undefined,
          }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="card h-fit p-5">
        <h2 className="text-sm font-semibold">Opportunity profile</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Owner type</label>
            <select className="input" value={s.ownerType} onChange={(e) => setS({ ...s, ownerType: e.target.value as OwnerType })}>
              <option value="PRIVATE">Private</option>
              <option value="SEMI_GOVERNMENT">Semi-government</option>
              <option value="GOVERNMENT">Government</option>
            </select>
          </div>
          <div className="space-y-1.5">
            {TOGGLES.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={s[t.key] as boolean}
                  onChange={(e) => setS({ ...s, [t.key]: e.target.checked })}
                />
                {t.label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Revenue certainty</label>
              <select className="input" value={s.revenueCertainty} onChange={(e) => setS({ ...s, revenueCertainty: e.target.value as Level })}>
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Risk appetite</label>
              <select className="input" value={s.riskAppetite} onChange={(e) => setS({ ...s, riskAppetite: e.target.value as Level })}>
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Concession term (years)</label>
            <input className="input" value={s.concessionTermYears} onChange={(e) => setS({ ...s, concessionTermYears: e.target.value })} />
          </div>
        </div>
        <button onClick={run} disabled={pending} className="btn btn-primary mt-4 w-full">
          {pending ? 'Analysing…' : 'Recommend structures'}
        </button>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div>
        {!result ? (
          <div className="card grid h-full place-items-center p-10 text-center text-muted">
            Set the opportunity profile and get a ranked, explained structure recommendation.
          </div>
        ) : (
          <div className="space-y-5">
            {result.recommended && (
              <div className="card border-2 border-primary/40 p-5">
                <div className="flex items-center gap-2">
                  <Badge tone="accent">Recommended</Badge>
                  <h3 className="text-lg font-semibold">{result.recommended.label}</h3>
                  <span className="ml-auto text-2xl font-bold">{result.recommended.score}</span>
                </div>
                <ul className="mt-2 list-inside list-disc text-sm text-foreground/70">
                  {result.recommended.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card p-5">
              <h3 className="text-sm font-semibold">Ranked structures</h3>
              <div className="mt-3 space-y-2">
                {result.ranked.map((st) => (
                  <Row key={st.code} st={st} />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Analysis</h3>
                <Badge tone="neutral">{result.explanation.method} · {result.explanation.confidence}</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{result.explanation.text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ st }: { st: StructureScore }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 text-sm">{st.label}</span>
      <div className="h-2 flex-1 rounded-full bg-foreground/10">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${st.score}%` }} />
      </div>
      <Badge tone={GRADE_TONE[st.grade]}>{st.score}</Badge>
    </div>
  );
}
