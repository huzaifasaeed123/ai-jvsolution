'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/features/opportunities/format';
import type { Offer, OfferStatus } from '../types';
import { submitOffer, updateOffer, withdrawOffer, setOfferStatus } from '../actions';

const STATUS_TONE: Record<OfferStatus, 'neutral' | 'primary' | 'success' | 'danger' | 'warning'> = {
  SUBMITTED: 'neutral',
  UNDER_REVIEW: 'primary',
  SHORTLISTED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export function OffersPanel({
  opportunityId,
  isOwner,
  canOffer,
  offers,
  myOffer,
  structures,
}: {
  opportunityId: string;
  isOwner: boolean;
  canOffer: boolean;
  offers: Offer[];
  myOffer: Offer | null;
  structures: { code: string; label: string }[];
}) {
  if (isOwner) return <OwnerOffers opportunityId={opportunityId} offers={offers} structures={structures} />;
  if (canOffer) return <SubmitterOffer opportunityId={opportunityId} myOffer={myOffer} structures={structures} />;
  return (
    <div className="card p-5 text-sm text-muted">
      Request and be granted access to this opportunity to submit an offer.
    </div>
  );
}

function label(structures: { code: string; label: string }[], code: string | null) {
  return code ? (structures.find((s) => s.code === code)?.label ?? code) : '—';
}

// ---------- Owner: incoming offers ----------
function OwnerOffers({ opportunityId, offers, structures }: { opportunityId: string; offers: Offer[]; structures: { code: string; label: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setStatus(id: string, status: OfferStatus) {
    setError(null);
    startTransition(async () => {
      try {
        await setOfferStatus(id, opportunityId, status);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  if (offers.length === 0) return <div className="card p-5 text-sm text-muted">No offers received yet.</div>;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {offers.map((o) => (
        <div key={o.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-medium">{o.submittedBy.fullName}</span>
              <span className="ml-2 text-xs text-muted">{o.experienceYears ?? '—'} yrs experience</span>
            </div>
            <Badge tone={STATUS_TONE[o.status]}>{o.status.replace('_', ' ')}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Field label="Structure" value={label(structures, o.structure)} />
            <Field label="Owner share" value={o.ownerSharePct != null ? `${o.ownerSharePct}%` : '—'} />
            <Field label="Investment" value={formatMoney(o.investmentAmount, o.currency)} />
            <Field label="Target IRR" value={o.targetIrr != null ? `${o.targetIrr}%` : '—'} />
          </div>
          {o.message && <p className="mt-2 text-sm text-foreground/70">“{o.message}”</p>}
          {o.status !== 'WITHDRAWN' && o.status !== 'REJECTED' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setStatus(o.id, 'SHORTLISTED')} disabled={pending} className="btn btn-outline px-3 py-1.5 text-xs">Shortlist</button>
              <button onClick={() => setStatus(o.id, 'ACCEPTED')} disabled={pending} className="btn btn-primary px-3 py-1.5 text-xs">Accept</button>
              <button onClick={() => setStatus(o.id, 'REJECTED')} disabled={pending} className="btn btn-outline px-3 py-1.5 text-xs">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Submitter: my offer / submit form ----------
function SubmitterOffer({ opportunityId, myOffer, structures }: { opportunityId: string; myOffer: Offer | null; structures: { code: string; label: string }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!myOffer);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({
    structure: myOffer?.structure ?? '',
    investmentAmount: myOffer?.investmentAmount?.toString() ?? '',
    ownerSharePct: myOffer?.ownerSharePct?.toString() ?? '',
    targetIrr: myOffer?.targetIrr?.toString() ?? '',
    developmentMonths: myOffer?.developmentMonths?.toString() ?? '',
    experienceYears: myOffer?.experienceYears?.toString() ?? '',
    message: myOffer?.message ?? '',
  });

  function num(v: string) { return v.trim() === '' ? undefined : Number(v); }

  function save() {
    setError(null);
    const input = {
      structure: f.structure || undefined,
      investmentAmount: num(f.investmentAmount),
      ownerSharePct: num(f.ownerSharePct),
      targetIrr: num(f.targetIrr),
      developmentMonths: num(f.developmentMonths),
      experienceYears: num(f.experienceYears),
      message: f.message || undefined,
    };
    startTransition(async () => {
      try {
        if (myOffer) await updateOffer(myOffer.id, opportunityId, input);
        else await submitOffer(opportunityId, input);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function withdraw() {
    if (!myOffer) return;
    startTransition(async () => {
      try { await withdrawOffer(myOffer.id, opportunityId); router.refresh(); }
      catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    });
  }

  if (myOffer && !editing) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Your offer</h3>
          <Badge tone={STATUS_TONE[myOffer.status]}>{myOffer.status.replace('_', ' ')}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Field label="Structure" value={label(structures, myOffer.structure)} />
          <Field label="Owner share" value={myOffer.ownerSharePct != null ? `${myOffer.ownerSharePct}%` : '—'} />
          <Field label="Investment" value={formatMoney(myOffer.investmentAmount, myOffer.currency)} />
          <Field label="Target IRR" value={myOffer.targetIrr != null ? `${myOffer.targetIrr}%` : '—'} />
        </div>
        {['SUBMITTED', 'UNDER_REVIEW'].includes(myOffer.status) && (
          <div className="mt-3 flex gap-2">
            <button onClick={() => setEditing(true)} className="btn btn-outline px-3 py-1.5 text-xs">Edit</button>
            <button onClick={withdraw} disabled={pending} className="btn btn-outline px-3 py-1.5 text-xs">Withdraw</button>
          </div>
        )}
      </div>
    );
  }

  const input = 'w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary';
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">{myOffer ? 'Edit your offer' : 'Submit an offer'}</h3>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Proposed structure</label>
          <select className={input} value={f.structure} onChange={(e) => setF({ ...f, structure: e.target.value })}>
            <option value="">—</option>
            {structures.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </div>
        <Num label="Owner share %" v={f.ownerSharePct} on={(v) => setF({ ...f, ownerSharePct: v })} cls={input} />
        <Num label="Investment amount" v={f.investmentAmount} on={(v) => setF({ ...f, investmentAmount: v })} cls={input} />
        <Num label="Target IRR %" v={f.targetIrr} on={(v) => setF({ ...f, targetIrr: v })} cls={input} />
        <Num label="Development months" v={f.developmentMonths} on={(v) => setF({ ...f, developmentMonths: v })} cls={input} />
        <Num label="Experience (years)" v={f.experienceYears} on={(v) => setF({ ...f, experienceYears: v })} cls={input} />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs text-muted">Cover note</label>
        <textarea className={input} rows={2} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={save} disabled={pending} className="btn btn-primary">{pending ? 'Saving…' : myOffer ? 'Save offer' : 'Submit offer'}</button>
        {myOffer && <button onClick={() => setEditing(false)} className="btn btn-outline">Cancel</button>}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
function Num({ label, v, on, cls }: { label: string; v: string; on: (v: string) => void; cls: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <input className={cls} inputMode="decimal" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
