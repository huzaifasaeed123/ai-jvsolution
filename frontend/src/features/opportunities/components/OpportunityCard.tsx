import Link from 'next/link';
import type { Opportunity } from '../types';
import { formatMoney, formatNumber, OWNER_CATEGORY_LABEL, VERIFICATION_LABEL } from '../format';

export function OpportunityCard({
  opportunity: o,
  sectorLabels,
}: {
  opportunity: Opportunity;
  sectorLabels: Record<string, string>;
}) {
  return (
    <Link
      href={`/opportunities/${o.id}`}
      className="card block p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-foreground/50">{o.reference}</span>
        <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[11px] font-medium">
          {OWNER_CATEGORY_LABEL[o.ownerCategory]}
        </span>
      </div>

      <h3 className="mt-2 text-base font-semibold leading-snug">{o.title}</h3>
      <p className="mt-1 text-sm text-foreground/60">
        {sectorLabels[o.sector] ?? o.sector}
        {o.city ? ` · ${o.city}` : ''} · {o.countryCode}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-foreground/40">GDV</p>
          <p className="font-medium">{formatMoney(o.projectValue, o.currency)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-foreground/40">Investment</p>
          <p className="font-medium">{formatMoney(o.investmentRequired, o.currency)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-foreground/40">Target IRR</p>
          <p className="font-medium">{o.targetIrr ? `${o.targetIrr}%` : '—'}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-foreground/50">
        <span>{VERIFICATION_LABEL[o.verification]}</span>
        <span>{formatNumber(o.landAreaSqm, ' m²')}</span>
      </div>
    </Link>
  );
}
