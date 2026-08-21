import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMandate, getMandateMatches } from '@/features/mandates/api';
import { getOpportunityReference } from '@/features/opportunities/api';
import { MatchCard } from '@/features/mandates/components/MatchCard';
import { toLabelMap, formatMoney } from '@/features/opportunities/format';

export const metadata = { title: 'Mandate matches' };

export default async function MandateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let mandate;
  try {
    mandate = await getMandate(id);
  } catch {
    notFound();
  }

  const [matchResult, reference] = await Promise.all([
    getMandateMatches(id),
    getOpportunityReference(),
  ]);
  const sectorLabels = toLabelMap(reference.sectors);

  const ticket =
    mandate.minInvestment || mandate.maxInvestment
      ? `${formatMoney(mandate.minInvestment, mandate.currency)} – ${formatMoney(mandate.maxInvestment, mandate.currency)}`
      : 'Any ticket size';

  return (
    <div>
      <Link href="/dashboard/mandates" className="text-sm text-foreground/50 hover:text-foreground">
        ← My mandates
      </Link>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{mandate.title}</h1>
      <p className="mt-1 text-sm text-foreground/60">
        {mandate.sectors.length ? mandate.sectors.map((s) => sectorLabels[s] ?? s).join(', ') : 'Any sector'} ·{' '}
        {mandate.countryCodes.length ? mandate.countryCodes.join(', ') : 'Any country'} · {ticket}
        {mandate.targetIrr ? ` · target IRR ${mandate.targetIrr}%` : ''}
      </p>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {matchResult.count} {matchResult.count === 1 ? 'match' : 'matches'}
        </h2>
        <span className="text-xs text-foreground/50">Ranked by explainable JV Fit Score</span>
      </div>

      {matchResult.matches.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-foreground/20 p-10 text-center">
          <p className="text-sm text-foreground/60">
            No published opportunities match this mandate yet. Broaden your criteria or check back later.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {matchResult.matches.map((m) => (
            <MatchCard key={m.opportunity.id} match={m} sectorLabels={sectorLabels} />
          ))}
        </div>
      )}
    </div>
  );
}
