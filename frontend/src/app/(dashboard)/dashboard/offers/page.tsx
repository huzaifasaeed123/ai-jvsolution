import Link from 'next/link';
import { listMyOffers } from '@/features/offers/api';
import { getOpportunityReference } from '@/features/opportunities/api';
import { toLabelMap, formatMoney } from '@/features/opportunities/format';
import { Badge } from '@/components/ui/Badge';
import type { OfferStatus } from '@/features/offers/types';

export const metadata = { title: 'My offers' };

const TONE: Record<OfferStatus, 'neutral' | 'primary' | 'success' | 'danger' | 'warning'> = {
  SUBMITTED: 'neutral',
  UNDER_REVIEW: 'primary',
  SHORTLISTED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export default async function MyOffersPage() {
  const [offers, reference] = await Promise.all([listMyOffers(), getOpportunityReference()]);
  const structureLabels = toLabelMap(reference.structures);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My offers</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Offers you’ve submitted and their status.</p>

      {offers.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">
          You haven’t submitted any offers yet.{' '}
          <Link href="/opportunities" className="font-medium text-primary hover:underline">Browse opportunities →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/opportunities/${o.opportunityId}`} className="font-medium hover:underline">
                  {o.structure ? structureLabels[o.structure] ?? o.structure : 'Offer'}
                </Link>
                <p className="text-sm text-muted">
                  {o.ownerSharePct != null ? `${o.ownerSharePct}% owner share · ` : ''}
                  {formatMoney(o.investmentAmount, o.currency)}
                  {o.targetIrr != null ? ` · ${o.targetIrr}% IRR` : ''}
                </p>
              </div>
              <Badge tone={TONE[o.status]}>{o.status.replace('_', ' ')}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
