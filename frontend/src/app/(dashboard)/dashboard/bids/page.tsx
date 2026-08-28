import Link from 'next/link';
import { listMyBids } from '@/features/bids/api';
import { listPublicTenders } from '@/features/tenders/api';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/features/opportunities/format';
import { BID_STATUS_LABEL, BID_STATUS_TONE } from '@/features/bids/format';

export const metadata = { title: 'My bids' };

export default async function MyBidsPage() {
  const [bids, tenders] = await Promise.all([listMyBids(), listPublicTenders()]);
  const tenderById = new Map(tenders.map((t) => [t.id, t]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My bids</h1>
          <p className="mt-1 text-sm text-muted">
            Tender submissions and their status. Drafts are only visible to you.
          </p>
        </div>
        <Link href="/tenders" className="btn btn-primary">
          Browse tenders
        </Link>
      </div>

      {bids.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm font-medium">You haven&rsquo;t bid on any tenders yet</p>
          <p className="mt-1 text-sm text-muted">
            Open tender notices publish their requirements and evaluation criteria up front.
          </p>
          <Link href="/tenders" className="btn btn-outline mt-4">
            View tender notices
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bids.map((b) => {
            const tender = tenderById.get(b.tenderId);
            return (
              <Link key={b.id} href={`/dashboard/bids/${b.id}`} className="card block p-4 transition-all hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted">{b.reference}</span>
                      {b.consortium && <Badge tone="primary">{b.consortium.name}</Badge>}
                    </div>
                    <p className="mt-1 font-medium">{tender?.title ?? 'Tender'}</p>
                    <p className="text-sm text-muted">
                      {b.bidPrice != null ? formatMoney(b.bidPrice, b.currency ?? 'USD') : 'No price entered'}
                      {b.deliveryMonths ? ` · ${b.deliveryMonths} months` : ''}
                    </p>
                  </div>
                  <Badge tone={BID_STATUS_TONE[b.status]}>{BID_STATUS_LABEL[b.status]}</Badge>
                </div>
                {b.disqualifiedReason && (
                  <p className="mt-2 text-sm text-red-500">Disqualified: {b.disqualifiedReason}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
