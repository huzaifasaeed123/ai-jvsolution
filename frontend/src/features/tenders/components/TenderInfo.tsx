import { Badge } from '@/components/ui/Badge';
import type { Tender, Addendum, RiskAllocationItem, EvaluationCriterion } from '../types';
import { PAYMENT_LABEL, RISK_BEARER_LABEL, RISK_BEARER_TONE, formatDate } from '../format';

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">{body}</p>
    </div>
  );
}

/** Requirements, specification, site info, government support. */
export function TenderRequirements({ tender: t }: { tender: Tender }) {
  const hasAny =
    t.employerRequirements || t.outputSpecification || t.siteInformation || t.governmentSupport;
  if (!hasAny) {
    return <p className="text-sm text-muted">No requirements published for this tender yet.</p>;
  }
  return (
    <div className="space-y-4">
      <Section title="Employer requirements" body={t.employerRequirements} />
      <Section title="Output specification" body={t.outputSpecification} />
      <Section title="Site information" body={t.siteInformation} />
      <Section title="Government support" body={t.governmentSupport} />
      {t.paymentMechanism && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Payment mechanism</h3>
          <p className="mt-2 text-sm text-foreground/80">
            {PAYMENT_LABEL[t.paymentMechanism] ?? t.paymentMechanism}
          </p>
        </div>
      )}
    </div>
  );
}

/** The risk-allocation matrix — the heart of a PPP contract. */
export function RiskMatrix({ items }: { items: RiskAllocationItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted">No risk allocation published for this tender.</p>;
  }
  return (
    <div className="card overflow-x-auto p-5">
      <h3 className="text-sm font-semibold">Risk allocation</h3>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="py-2 pr-4">Risk</th>
            <th className="py-2 pr-4">Borne by</th>
            <th className="py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={`${r.risk}-${i}`} className="border-b border-border/60 last:border-0">
              <td className="py-2 pr-4 font-medium capitalize">{r.risk.replace(/-/g, ' ')}</td>
              <td className="py-2 pr-4">
                <Badge tone={RISK_BEARER_TONE[r.bearer] ?? 'neutral'}>
                  {RISK_BEARER_LABEL[r.bearer] ?? r.bearer}
                </Badge>
              </td>
              <td className="py-2 text-muted">{r.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Weighted criteria, published up front so scoring is transparent. */
export function EvaluationCriteriaTable({ criteria }: { criteria: EvaluationCriterion[] }) {
  if (!criteria.length) {
    return <p className="text-sm text-muted">No evaluation criteria published.</p>;
  }
  const total = criteria.reduce((s, c) => s + c.weight, 0) || 1;
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">Evaluation criteria</h3>
      <p className="mt-1 text-xs text-muted">
        Published before bidding — bids are scored against exactly these weights.
      </p>
      <div className="mt-4 space-y-3">
        {criteria.map((c) => {
          const pct = Math.round((c.weight / total) * 100);
          return (
            <div key={c.key}>
              <div className="flex justify-between text-sm">
                <span>{c.label}</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-foreground/10">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Numbered, append-only amendments. */
export function AddendaList({ addenda }: { addenda: Addendum[] }) {
  if (!addenda.length) {
    return <p className="text-sm text-muted">No addenda have been issued.</p>;
  }
  return (
    <div className="space-y-3">
      {addenda.map((a) => (
        <div key={a.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone="accent">Addendum {a.number}</Badge>
              <h3 className="font-semibold">{a.title}</h3>
            </div>
            <span className="text-xs text-muted">{formatDate(a.issuedAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">{a.description}</p>
          {a.newSubmissionDeadline && (
            <p className="mt-2 text-sm font-medium text-accent">
              Submission deadline revised to {formatDate(a.newSubmissionDeadline)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
