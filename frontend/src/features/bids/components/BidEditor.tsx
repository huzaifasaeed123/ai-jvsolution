'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import type { Bid, BidInput } from '../types';
import type { Tender } from '@/features/tenders/types';
import { BID_STATUS_LABEL, BID_STATUS_TONE, EDITABLE_STATUSES } from '../format';
import { startBid, updateBid, submitBid, withdrawBid } from '../actions';

interface Consortium {
  id: string;
  name: string;
  isLead: boolean;
}

type Form = {
  consortiumId: string;
  technicalProposal: string;
  methodology: string;
  keyPersonnel: string;
  deliveryMonths: string;
  experienceYears: string;
  localContentPct: string;
  bidPrice: string;
  annualPayment: string;
  revenueSharePct: string;
  financialCapacity: string;
  declarations: string;
  bidSecurityProvided: boolean;
  checklistComplete: boolean;
};

function toForm(bid: Bid | null): Form {
  const n = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));
  return {
    consortiumId: bid?.consortium?.id ?? '',
    technicalProposal: bid?.technicalProposal ?? '',
    methodology: bid?.methodology ?? '',
    keyPersonnel: bid?.keyPersonnel ?? '',
    deliveryMonths: n(bid?.deliveryMonths),
    experienceYears: n(bid?.experienceYears),
    localContentPct: n(bid?.localContentPct),
    bidPrice: n(bid?.bidPrice),
    annualPayment: n(bid?.annualPayment),
    revenueSharePct: n(bid?.revenueSharePct),
    financialCapacity: n(bid?.financialCapacity),
    declarations: bid?.declarations ?? '',
    bidSecurityProvided: bid?.bidSecurityProvided ?? false,
    checklistComplete: bid?.checklistComplete ?? false,
  };
}

const num = (v: string) => (v.trim() === '' ? undefined : Number(v));

export function BidEditor({
  tender,
  bid,
  consortiums,
}: {
  tender: Tender;
  bid: Bid | null;
  consortiums: Consortium[];
}) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => toForm(bid));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const status = bid?.status ?? 'DRAFT';
  const locked = !EDITABLE_STATUSES.includes(status) || tender.deadlinePassed;

  // Everything the authority requires before a submission counts.
  const checklist = [
    { label: 'Bid security / bond provided', done: f.bidSecurityProvided },
    { label: 'Submission checklist confirmed', done: f.checklistComplete },
    { label: 'Financial offer entered', done: !!num(f.bidPrice) || !!num(f.annualPayment) },
    { label: 'Technical proposal entered', done: f.technicalProposal.trim().length > 0 },
  ];
  const blockers = checklist.filter((c) => !c.done);
  const canSubmit = status === 'DRAFT' && !tender.deadlinePassed && f.bidSecurityProvided && f.checklistComplete;

  function payload(): BidInput {
    return {
      consortiumId: f.consortiumId || undefined,
      technicalProposal: f.technicalProposal || undefined,
      methodology: f.methodology || undefined,
      keyPersonnel: f.keyPersonnel || undefined,
      deliveryMonths: num(f.deliveryMonths),
      experienceYears: num(f.experienceYears),
      localContentPct: num(f.localContentPct),
      currency: tender.currency,
      bidPrice: num(f.bidPrice),
      annualPayment: num(f.annualPayment),
      revenueSharePct: num(f.revenueSharePct),
      financialCapacity: num(f.financialCapacity),
      declarations: f.declarations || undefined,
      bidSecurityProvided: f.bidSecurityProvided,
      checklistComplete: f.checklistComplete,
    };
  }

  function run(fn: () => Promise<unknown>, after?: (r: unknown) => void) {
    setError(null);
    setSaved(false);
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

  function save() {
    run(
      () => (bid ? updateBid(bid.id, payload()) : startBid(tender.id, payload())),
      (r) => {
        setSaved(true);
        if (!bid) router.push(`/dashboard/bids/${(r as Bid).id}`);
      },
    );
  }

  const input =
    'w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary';
  const label = 'mb-1 block text-xs font-medium text-muted';

  return (
    <div className="space-y-6">
      {/* Status + deadline */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <Badge tone={BID_STATUS_TONE[status]}>{BID_STATUS_LABEL[status]}</Badge>
          {bid && <span className="font-mono text-xs text-muted">{bid.reference}</span>}
        </div>
        <span className="text-sm text-muted">
          {tender.deadlinePassed
            ? 'Submission deadline has passed'
            : `${tender.daysRemaining ?? '—'} days until the deadline`}
        </span>
      </div>

      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}

      {locked && (
        <p className="card p-4 text-sm text-muted">
          This bid can no longer be edited{tender.deadlinePassed ? ' — the deadline has passed' : ''}.
        </p>
      )}

      <fieldset disabled={locked || pending} className="space-y-6">
        {/* Technical envelope */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Technical envelope</h3>
          <p className="mt-1 text-xs text-muted">
            Your solution and capability. Sealed from the authority until the deadline.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className={label}>Technical proposal</label>
              <textarea
                className={input}
                rows={4}
                value={f.technicalProposal}
                onChange={(e) => setF({ ...f, technicalProposal: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Methodology</label>
              <textarea
                className={input}
                rows={3}
                value={f.methodology}
                onChange={(e) => setF({ ...f, methodology: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Key personnel</label>
              <input
                className={input}
                value={f.keyPersonnel}
                onChange={(e) => setF({ ...f, keyPersonnel: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Delivery (months)</label>
                <input className={input} value={f.deliveryMonths} onChange={(e) => setF({ ...f, deliveryMonths: e.target.value })} />
              </div>
              <div>
                <label className={label}>Experience (years)</label>
                <input className={input} value={f.experienceYears} onChange={(e) => setF({ ...f, experienceYears: e.target.value })} />
              </div>
              <div>
                <label className={label}>Local content %</label>
                <input className={input} value={f.localContentPct} onChange={(e) => setF({ ...f, localContentPct: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Financial envelope */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Financial envelope</h3>
          <p className="mt-1 text-xs text-muted">All amounts in {tender.currency}.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Bid price</label>
              <input className={input} value={f.bidPrice} onChange={(e) => setF({ ...f, bidPrice: e.target.value })} />
            </div>
            <div>
              <label className={label}>Annual payment</label>
              <input className={input} value={f.annualPayment} onChange={(e) => setF({ ...f, annualPayment: e.target.value })} />
            </div>
            <div>
              <label className={label}>Revenue share to authority %</label>
              <input className={input} value={f.revenueSharePct} onChange={(e) => setF({ ...f, revenueSharePct: e.target.value })} />
            </div>
            <div>
              <label className={label}>Financial capacity</label>
              <input className={input} value={f.financialCapacity} onChange={(e) => setF({ ...f, financialCapacity: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Compliance</h3>
          {consortiums.length > 0 && (
            <div className="mt-3">
              <label className={label}>Bid as a consortium (optional)</label>
              <select className={input} value={f.consortiumId} onChange={(e) => setF({ ...f, consortiumId: e.target.value })}>
                <option value="">Bidding alone</option>
                {consortiums.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">Only a consortium lead may bid on its behalf.</p>
            </div>
          )}
          <div className="mt-3">
            <label className={label}>Declarations</label>
            <textarea className={input} rows={2} value={f.declarations} onChange={(e) => setF({ ...f, declarations: e.target.value })} />
          </div>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.bidSecurityProvided} onChange={(e) => setF({ ...f, bidSecurityProvided: e.target.checked })} />
              Bid security / bond provided
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.checklistComplete} onChange={(e) => setF({ ...f, checklistComplete: e.target.checked })} />
              I confirm the submission checklist is complete
            </label>
          </div>
        </div>
      </fieldset>

      {/* Submission checklist + actions */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold">Submission checklist</h3>
        <ul className="mt-3 space-y-1.5 text-sm">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              <span className={c.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}>
                {c.done ? '✓' : '○'}
              </span>
              <span className={c.done ? '' : 'text-muted'}>{c.label}</span>
            </li>
          ))}
        </ul>

        {status === 'DRAFT' && blockers.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            {blockers.length} item{blockers.length === 1 ? '' : 's'} outstanding before you can submit.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {!locked && (
            <button onClick={save} disabled={pending} className="btn btn-outline">
              {pending ? 'Saving…' : bid ? 'Save draft' : 'Start bid'}
            </button>
          )}
          {bid && status === 'DRAFT' && (
            <button
              onClick={() => run(() => submitBid(bid.id))}
              disabled={pending || !canSubmit}
              title={canSubmit ? undefined : 'Complete bid security and the checklist first'}
              className="btn btn-primary"
            >
              Seal &amp; submit bid
            </button>
          )}
          {bid && EDITABLE_STATUSES.includes(status) && !tender.deadlinePassed && (
            <button onClick={() => run(() => withdrawBid(bid.id))} disabled={pending} className="btn btn-outline">
              Withdraw
            </button>
          )}
        </div>

        {status === 'SUBMITTED' && (
          <p className="mt-3 text-xs text-muted">
            Your bid is sealed. The authority can see that you have bid and that it is compliant, but
            not its contents, until the deadline passes.
          </p>
        )}
      </div>
    </div>
  );
}
