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
  return (
    <Link
      href={`/tenders/${t.id}`}
      className="card block p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-muted">{t.reference}</span>
        <Badge tone={STAGE_TONE[t.stage]}>{STAGE_LABEL[t.stage]}</Badge>
      </div>

      <h3 className="mt-2 text-base font-semibold leading-snug">{t.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {PROCUREMENT_LABEL[t.procurementType] ?? t.procurementType} · {t.opportunity.countryCode}
        {t.concessionYears ? ` · ${t.concessionYears}-year term` : ''}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Estimated value</p>
          <p className="text-sm font-medium">{formatMoney(t.estimatedValue, t.currency)}</p>
        </div>
        <Badge tone={deadlineTone(t.daysRemaining, t.deadlinePassed)}>
          {t.deadlinePassed ? 'Closed' : deadlineLabel(t.submissionDeadline, t.daysRemaining)}
        </Badge>
      </div>
    </Link>
  );
}
