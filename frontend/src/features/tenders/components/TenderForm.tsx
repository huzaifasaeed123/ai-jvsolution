'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  ProcurementReference,
  RiskAllocationItem,
  EvaluationCriterion,
  Tender,
} from '../types';
import { createTender, updateTender, type TenderInput } from '../actions';

const input =
  'w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary';
const label = 'mb-1 block text-xs font-medium text-muted';

/** ISO date-time for a datetime-local input value. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TenderForm({
  opportunityId,
  tender,
  reference,
}: {
  opportunityId?: string;
  tender?: Tender;
  reference: ProcurementReference;
}) {
  const router = useRouter();
  const editing = !!tender;

  const [title, setTitle] = useState(tender?.title ?? '');
  const [procurementType, setProcurementType] = useState(tender?.procurementType ?? 'RFP');
  const [paymentMechanism, setPaymentMechanism] = useState(tender?.paymentMechanism ?? '');
  const [employerRequirements, setEmployerRequirements] = useState(tender?.employerRequirements ?? '');
  const [outputSpecification, setOutputSpecification] = useState(tender?.outputSpecification ?? '');
  const [siteInformation, setSiteInformation] = useState(tender?.siteInformation ?? '');
  const [governmentSupport, setGovernmentSupport] = useState(tender?.governmentSupport ?? '');
  const [estimatedValue, setEstimatedValue] = useState(tender?.estimatedValue?.toString() ?? '');
  const [bidSecurity, setBidSecurity] = useState(tender?.bidSecurity?.toString() ?? '');
  const [concessionYears, setConcessionYears] = useState(tender?.concessionYears?.toString() ?? '');
  const [clarificationDeadline, setClarificationDeadline] = useState(toLocalInput(tender?.clarificationDeadline));
  const [submissionDeadline, setSubmissionDeadline] = useState(toLocalInput(tender?.submissionDeadline));
  const [risks, setRisks] = useState<RiskAllocationItem[]>(tender?.riskAllocation ?? []);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(
    tender?.evaluationCriteria?.length ? tender.evaluationCriteria : reference.defaultEvaluationCriteria,
  );

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
  const totalWeight = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);

  function payload(): TenderInput {
    return {
      title,
      procurementType,
      paymentMechanism: paymentMechanism || undefined,
      employerRequirements: employerRequirements || undefined,
      outputSpecification: outputSpecification || undefined,
      siteInformation: siteInformation || undefined,
      governmentSupport: governmentSupport || undefined,
      riskAllocation: risks.filter((r) => r.risk && r.bearer),
      evaluationCriteria: criteria.filter((c) => c.key && c.label),
      estimatedValue: num(estimatedValue),
      bidSecurity: num(bidSecurity),
      concessionYears: num(concessionYears),
      clarificationDeadline: clarificationDeadline ? new Date(clarificationDeadline).toISOString() : undefined,
      submissionDeadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : undefined,
    };
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) {
          await updateTender(tender.id, payload());
          router.refresh();
        } else {
          const created = await createTender(opportunityId!, payload());
          router.push(`/dashboard/tenders/${created.id}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

      {/* Basics */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold">Tender basics</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className={label}>Title</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Procurement type</label>
              <select className={input} value={procurementType} onChange={(e) => setProcurementType(e.target.value as typeof procurementType)}>
                {reference.procurementTypes.map((p) => (
                  <option key={p.code} value={p.code}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Payment mechanism</label>
              <select className={input} value={paymentMechanism} onChange={(e) => setPaymentMechanism(e.target.value)}>
                <option value="">—</option>
                {reference.paymentMechanisms.map((p) => (
                  <option key={p.code} value={p.code}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={label}>Estimated value</label>
              <input className={input} value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} />
            </div>
            <div>
              <label className={label}>Bid security</label>
              <input className={input} value={bidSecurity} onChange={(e) => setBidSecurity(e.target.value)} />
            </div>
            <div>
              <label className={label}>Concession years</label>
              <input className={input} value={concessionYears} onChange={(e) => setConcessionYears(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Clarification deadline</label>
              <input type="datetime-local" className={input} value={clarificationDeadline} onChange={(e) => setClarificationDeadline(e.target.value)} />
            </div>
            <div>
              <label className={label}>Submission deadline (required to publish)</label>
              <input type="datetime-local" className={input} value={submissionDeadline} onChange={(e) => setSubmissionDeadline(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold">Requirements</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className={label}>Employer requirements</label>
            <textarea className={input} rows={3} value={employerRequirements} onChange={(e) => setEmployerRequirements(e.target.value)} />
          </div>
          <div>
            <label className={label}>Output specification</label>
            <textarea className={input} rows={3} value={outputSpecification} onChange={(e) => setOutputSpecification(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Site information</label>
              <textarea className={input} rows={2} value={siteInformation} onChange={(e) => setSiteInformation(e.target.value)} />
            </div>
            <div>
              <label className={label}>Government support</label>
              <textarea className={input} rows={2} value={governmentSupport} onChange={(e) => setGovernmentSupport(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk allocation */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Risk allocation</h3>
          <button
            type="button"
            onClick={() => setRisks([...risks, { risk: reference.riskCategories[0]?.code ?? '', bearer: 'private' }])}
            className="btn btn-outline px-2.5 py-1 text-xs"
          >
            + Add risk
          </button>
        </div>
        {risks.length === 0 ? (
          <p className="mt-2 text-xs text-muted">No risks allocated yet — bidders price unallocated risk defensively.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {risks.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select
                  className={`${input} max-w-52`}
                  value={r.risk}
                  onChange={(e) => setRisks(risks.map((x, j) => (j === i ? { ...x, risk: e.target.value } : x)))}
                >
                  {reference.riskCategories.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <select
                  className={`${input} max-w-40`}
                  value={r.bearer}
                  onChange={(e) => setRisks(risks.map((x, j) => (j === i ? { ...x, bearer: e.target.value } : x)))}
                >
                  {reference.riskBearers.map((b) => (
                    <option key={b.code} value={b.code}>{b.label}</option>
                  ))}
                </select>
                <input
                  className={`${input} flex-1`}
                  placeholder="Notes (optional)"
                  value={r.notes ?? ''}
                  onChange={(e) => setRisks(risks.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))}
                />
                <button type="button" onClick={() => setRisks(risks.filter((_, j) => j !== i))} className="text-xs text-muted hover:text-red-500">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation criteria */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Evaluation criteria</h3>
          <button
            type="button"
            onClick={() => setCriteria([...criteria, { key: '', label: '', weight: 10 }])}
            className="btn btn-outline px-2.5 py-1 text-xs"
          >
            + Add criterion
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Published with the tender. Bids are scored against exactly these weights — they cannot be
          changed once bidding closes.
        </p>
        <div className="mt-3 space-y-2">
          {criteria.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                className={`${input} max-w-40`}
                placeholder="key (e.g. financial)"
                value={c.key}
                onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))}
              />
              <input
                className={`${input} flex-1`}
                placeholder="Label"
                value={c.label}
                onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <input
                className={`${input} max-w-24`}
                value={c.weight}
                onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) || 0 } : x)))}
              />
              <button type="button" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} className="text-xs text-muted hover:text-red-500">
                ✕
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Total weight: {totalWeight} (normalized at evaluation)</p>
      </div>

      <button onClick={save} disabled={pending || title.trim().length < 4} className="btn btn-primary">
        {pending ? 'Saving…' : editing ? 'Save tender' : 'Create tender (as draft)'}
      </button>
    </div>
  );
}
