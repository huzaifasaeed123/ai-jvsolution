import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/features/opportunities/format';
import type { Tender } from '../types';
import {
  STAGE_LABEL,
  STAGE_TONE,
  PROCUREMENT_LABEL,
  deadlineLabel,
  deadlineTone,
} from '../format';

export function TenderCard({ tender: t }: { tender: Tender }) {
  const closed = t.deadlinePassed;

  return (
    <Link
      href={`/tenders/${t.id}`}
      className="card group relative flex flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
    >
      {/* Stage rail — colour-codes where the procurement has reached */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] ${closed ? 'bg-border-strong' : 'bg-accent'}`}
      />

      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[11px] text-muted">{t.reference}</span>
        <Badge tone={STAGE_TONE[t.stage]}>{STAGE_LABEL[t.stage]}</Badge>
      </div>

      <h3 className="display mt-2 text-[1.0625rem] leading-snug transition-colors group-hover:text-primary">
        {t.title}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {PROCUREMENT_LABEL[t.procurementType] ?? t.procurementType} · {t.opportunity.countryCode}
        {t.concessionYears ? ` · ${t.concessionYears}-year term` : ''}
      </p>

      <div className="flex-1" />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted">Estimated value</p>
          <p className="figure mt-0.5 text-base">{formatMoney(t.estimatedValue, t.currency)}</p>
        </div>
        <Badge tone={deadlineTone(t.daysRemaining, t.deadlinePassed)}>
          {closed ? 'Closed' : deadlineLabel(t.submissionDeadline, t.daysRemaining)}
        </Badge>
      </div>
    </Link>
  );
}
