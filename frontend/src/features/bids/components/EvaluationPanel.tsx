'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import type { Bid, EvaluationOutput } from '../types';
import type { Tender } from '@/features/tenders/types';
import { evaluateTender, awardTender, financialClose, disqualifyBid } from '../actions';

/** Criteria the engine can derive from bid data; anything else needs a manual score. */
const OBJECTIVE_KEYS = new Set([
  'financial',
  'price',
  'annualPayment',
  'revenueShare',
  'delivery',
  'experience',
  'financialCapacity',
  'localContent',
]);

const EXCLUDED = ['WITHDRAWN', 'DISQUALIFIED', 'DRAFT'];

export function EvaluationPanel({
  tender,
  bids,
}: {
  tender: Tender;
  bids: Bid[];
}) {
  const router = useRouter();
  const [result, setResult] = useState<EvaluationOutput | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const field = bids.filter((b) => !EXCLUDED.includes(b.status));
  const subjective = tender.evaluationCriteria.filter((c) => !OBJECTIVE_KEYS.has(c.key));
  const awarded = bids.find((b) => b.status === 'PREFERRED');

  function setScore(bidId: string, key: string, value: number) {
    setScores((s) => ({ ...s, [bidId]: { ...(s[bidId] ?? {}), [key]: value } }));
  }

  function run(fn: () => Promise<unknown>, after?: (r: unknown) => void) {
    setError(null);
    startTransition(async () => {
      try {
        const r = await fn();
        after?.(r);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  if (field.length === 0) {
    return (
      <p className="card p-8 text-center text-sm text-muted">
        No bids are eligible for evaluation.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

      {/* Manual scoring for subjective criteria */}
      {subjective.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Score the subjective criteria</h3>
          <p className="mt-1 text-xs text-muted">
            Objective criteria (price, delivery, experience…) are derived from the bids
            automatically. Enter 0–100 for the rest. Unscored criteria contribute nothing and are
            flagged in the result.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">Bidder</th>
                  {subjective.map((c) => (
                    <th key={c.key} className="px-2 py-2">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {field.map((b) => (
                  <tr key={b.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4">
                      <span className="font-medium">{b.consortium?.name ?? b.bidder.fullName}</span>
                      <span className="ml-2 font-mono text-xs text-muted">{b.reference}</span>
                    </td>
                    {subjective.map((c) => (
                      <td key={c.key} className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0–100"
                          value={scores[b.id]?.[c.key] ?? ''}
                          onChange={(e) => setScore(b.id, c.key, Number(e.target.value))}
                          className="w-20 rounded-md border border-border-strong bg-transparent px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={() => run(() => evaluateTender(tender.id, scores), (r) => setResult(r as EvaluationOutput))}
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? 'Scoring…' : 'Run evaluation'}
      </button>

      {/* Ranked results */}
      {result && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Evaluation result</h3>
            <span className="text-xs text-muted">{result.version}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Scored against the {result.criteria.length} criteria published with this tender.
          </p>

          <div className="mt-4 space-y-3">
            {result.evaluated.map((e) => {
              const recommended = e.bidId === result.recommendedBidId;
              return (
                <div
                  key={e.bidId}
                  className={`rounded-lg border p-4 ${recommended ? 'border-primary/40 bg-primary/[0.05]' : 'border-border'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">#{e.rank}</span>
                      <span className="font-medium">{e.bidderName}</span>
                      <span className="font-mono text-xs text-muted">{e.reference}</span>
                      {recommended && <Badge tone="accent">Highest scoring</Badge>}
                    </div>
                    <span className="text-2xl font-bold">{e.score}</span>
                  </div>

                  {/* Per-criterion contribution */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {e.criteria.map((c) => (
                      <div key={c.key} className="flex items-center gap-2 text-xs">
                        <span className="w-28 shrink-0 text-muted">{c.label}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-foreground/10">
                          <div
                            className="h-1.5 rounded-full bg-primary"
                            style={{ width: `${Math.round(c.normalized * 100)}%` }}
                          />
                        </div>
                        <span className="w-14 shrink-0 text-right font-medium">
                          +{c.points}
                          {c.source === 'manual' ? ' ·m' : c.source === 'unscored' ? ' ·—' : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  {e.notes.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-xs text-muted">
                      {e.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  )}

                  {!awarded && (
                    <button
                      onClick={() => run(() => awardTender(tender.id, e.bidId, rationale || undefined))}
                      disabled={pending}
                      className="btn btn-outline mt-3 px-3 py-1.5 text-xs"
                    >
                      Award to {e.bidderName}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {!awarded && (
            <div className="mt-4 border-t border-border pt-3">
              <label className="mb-1 block text-xs font-medium text-muted">
                Award rationale (recorded in the audit trail)
              </label>
              <input
                className="w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="e.g. Best price-experience balance"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Award outcome */}
      {awarded && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Preferred bidder</h3>
            <Badge tone="success">{awarded.consortium?.name ?? awarded.bidder.fullName}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">
            All other live bids were marked unsuccessful automatically.
          </p>
          {tender.stage === 'PREFERRED_BIDDER' && (
            <button
              onClick={() => run(() => financialClose(tender.id))}
              disabled={pending}
              className="btn btn-primary mt-3"
            >
              Move to financial close
            </button>
          )}
          {tender.stage === 'FINANCIAL_CLOSE' && (
            <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Financial close reached — the procurement is complete.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Disqualify a bid for failing a mandatory requirement. */
export function DisqualifyBid({ bid, tenderId }: { bid: Bid; tenderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (['DISQUALIFIED', 'WITHDRAWN', 'PREFERRED', 'UNSUCCESSFUL'].includes(bid.status)) return null;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-muted hover:text-red-500">
        Disqualify
      </button>
    );
  }

  return (
    <div className="mt-2 w-full">
      {error && <p className="mb-1 text-xs text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-48 flex-1 rounded-md border border-border-strong bg-transparent px-3 py-1.5 text-xs outline-none focus:border-primary"
          placeholder="Reason (e.g. no bid bond provided)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          onClick={() =>
            startTransition(async () => {
              try {
                await disqualifyBid(bid.id, tenderId, reason);
                setOpen(false);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed');
              }
            })
          }
          disabled={pending || reason.trim().length < 3}
          className="btn btn-outline px-3 py-1.5 text-xs"
        >
          Confirm
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}
