import Link from 'next/link';
import type { MatchItem } from '../types';
import { FitScoreBadge } from './FitScoreBadge';
import { formatMoney } from '@/features/opportunities/format';

export function MatchCard({ match, sectorLabels }: { match: MatchItem; sectorLabels: Record<string, string> }) {
  const o = match.opportunity;
  return (
    <div className="rounded-lg border border-foreground/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="font-mono text-xs text-foreground/50">{o.reference}</span>
          <Link href={`/opportunities/${o.id}`} className="mt-1 block text-base font-semibold hover:underline">
            {o.title}
          </Link>
          <p className="mt-0.5 text-sm text-foreground/60">
            {sectorLabels[o.sector] ?? o.sector}
            {o.city ? ` · ${o.city}` : ''} · {o.countryCode} · {formatMoney(o.investmentRequired, o.currency)} needed
          </p>
        </div>
        <FitScoreBadge fit={match.fit} />
      </div>

      {/* Explainability */}
      <div className="mt-4 border-t border-foreground/10 pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground/40">Why this score</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {match.fit.factors
            .filter((f) => f.applicable)
            .map((f) => (
              <li key={f.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-foreground/70">{f.detail}</span>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    f.score >= 0.75
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : f.score > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-foreground/40'
                  }`}
                >
                  +{f.points}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
