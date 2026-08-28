import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTender } from '@/features/tenders/api';
import { listBidsForTender } from '@/features/bids/api';
import { Badge } from '@/components/ui/Badge';
import { BID_STATUS_LABEL, BID_STATUS_TONE } from '@/features/bids/format';
import { formatDate } from '@/features/tenders/format';

export const metadata = { title: 'Received bids' };

export default async function TenderBidsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tender, received] = await Promise.all([getTender(id), listBidsForTender(id)]);
  if (!tender) notFound();

  return (
    <div>
      <Link href={`/dashboard/tenders/${id}`} className="text-sm text-muted hover:text-foreground">
        ← Manage tender
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Received bids</h1>
      <p className="mt-1 text-sm text-muted">{tender.title}</p>

      {!received ? (
        <p className="card mt-6 p-6 text-sm text-muted">Unable to load bids.</p>
      ) : (
        <>
          {/* The sealed guarantee, stated to the authority */}
          <div className="card mt-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {received.count} bid{received.count === 1 ? '' : 's'} received
              </h2>
              <Badge tone={received.sealed ? 'warning' : 'success'}>
                {received.sealed ? '🔒 Sealed' : 'Unsealed'}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted">
              {received.sealed
                ? `Bid contents stay hidden until the submission deadline (${formatDate(received.submissionDeadline)}). You can see who has bid and whether each is compliant.`
                : 'The deadline has passed — bid contents are open for evaluation.'}
            </p>
          </div>

          {received.bids.length === 0 ? (
            <p className="card mt-4 p-8 text-center text-sm text-muted">No bids submitted yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {received.bids.map((b) => (
                <div key={b.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs text-muted">{b.reference}</span>
                      <p className="mt-1 font-medium">
                        {b.consortium?.name ?? b.bidder.fullName}
                      </p>
                      <p className="text-sm text-muted">
                        Submitted {b.submittedAt ? formatDate(b.submittedAt) : '—'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge tone={BID_STATUS_TONE[b.status]}>{BID_STATUS_LABEL[b.status]}</Badge>
                      <div className="flex gap-1.5">
                        <Badge tone={b.bidSecurityProvided ? 'success' : 'danger'}>
                          {b.bidSecurityProvided ? 'Bond ✓' : 'No bond'}
                        </Badge>
                        <Badge tone={b.checklistComplete ? 'success' : 'danger'}>
                          {b.checklistComplete ? 'Checklist ✓' : 'Checklist ✗'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {!received.sealed && (
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted">Bid price</p>
                        <p className="font-medium">
                          {b.bidPrice != null ? `${b.currency ?? ''} ${b.bidPrice.toLocaleString()}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted">Delivery</p>
                        <p className="font-medium">{b.deliveryMonths ? `${b.deliveryMonths} mo` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted">Experience</p>
                        <p className="font-medium">{b.experienceYears ? `${b.experienceYears} yrs` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted">Revenue share</p>
                        <p className="font-medium">{b.revenueSharePct != null ? `${b.revenueSharePct}%` : '—'}</p>
                      </div>
                    </div>
                  )}

                  {b.disqualifiedReason && (
                    <p className="mt-2 text-sm text-red-500">Disqualified: {b.disqualifiedReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!received.sealed && received.bids.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              Scoring and award are added in the next step.
            </p>
          )}
        </>
      )}
    </div>
  );
}
