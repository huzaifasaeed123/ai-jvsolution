import Link from 'next/link';
import { CoverImage } from '@/components/ui/Media';
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
      className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative overflow-hidden">
        <CoverImage
          src={o.coverImageUrl}
          alt={o.title}
          seed={o.reference}
          ratio="3 / 2"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Category sits on the image so the card body stays for the numbers */}
        <span className="absolute left-3 top-3 rounded-md bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/95 backdrop-blur-sm">
          {OWNER_CATEGORY_LABEL[o.ownerCategory]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="font-mono text-[11px] text-muted">{o.reference}</span>

        <h3 className="display mt-1.5 text-[1.0625rem] leading-snug transition-colors group-hover:text-primary">
          {o.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {sectorLabels[o.sector] ?? o.sector}
          {o.city ? ` · ${o.city}` : ''} · {o.countryCode}
        </p>

        {/* Push the figures to the bottom so cards of different title lengths align */}
        <div className="mt-4 flex-1" />

        <div className="grid grid-cols-3 gap-3 border-t border-border pt-3.5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted">GDV</p>
            <p className="figure mt-0.5 text-sm">{formatMoney(o.projectValue, o.currency)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted">Investment</p>
            <p className="figure mt-0.5 text-sm">
              {formatMoney(o.investmentRequired, o.currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted">Target IRR</p>
            <p className="figure mt-0.5 text-sm">{o.targetIrr ? `${o.targetIrr}%` : '—'}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted">
          <span className="truncate">{VERIFICATION_LABEL[o.verification]}</span>
          <span className="shrink-0 font-mono">{formatNumber(o.landAreaSqm, ' m²')}</span>
        </div>
      </div>
    </Link>
  );
}
