import Link from 'next/link';
import { listMyTenders } from '@/features/tenders/api';
import { listMyOpportunities } from '@/features/opportunities/api';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/features/opportunities/format';
import {
  STAGE_LABEL,
  STAGE_TONE,
  PROCUREMENT_LABEL,
  deadlineLabel,
  deadlineTone,
} from '@/features/tenders/format';

export const metadata = { title: 'My tenders' };

export default async function MyTendersPage() {
  const [tenders, opportunities] = await Promise.all([listMyTenders(), listMyOpportunities()]);

  // Tenders are a public-sector instrument (enforced server-side).
  const eligible = opportunities.filter(
    (o) => o.ownerCategory === 'GOVERNMENT' || o.ownerCategory === 'SEMI_GOVERNMENT',
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My tenders</h1>
          <p className="mt-1 text-sm text-muted">
            Procurement you publish as an authority. Drafts are private until published.
          </p>
        </div>
        {eligible.length > 0 && (
          <Link href="/dashboard/tenders/new" className="btn btn-primary">
            + New tender
          </Link>
        )}
      </div>

      {eligible.length === 0 && tenders.length === 0 && (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm font-medium">No eligible opportunities</p>
          <p className="mt-1 text-sm text-muted">
            Tenders apply to government and semi-government opportunities. Create one, then publish a
            tender against it.
          </p>
          <Link href="/dashboard/opportunities/new" className="btn btn-outline mt-4">
            Create an opportunity
          </Link>
        </div>
      )}

      {tenders.length === 0 && eligible.length > 0 && (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm font-medium">You haven&rsquo;t published a tender yet</p>
          <p className="mt-1 text-sm text-muted">
            A tender publishes its requirements, risk allocation and evaluation criteria up front.
          </p>
        </div>
      )}

      {tenders.length > 0 && (
        <div className="mt-6 space-y-3">
          {tenders.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/tenders/${t.id}`}
              className="card block p-4 transition-all hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-muted">{t.reference}</span>
                  <p className="mt-1 font-medium">{t.title}</p>
                  <p className="text-sm text-muted">
                    {PROCUREMENT_LABEL[t.procurementType] ?? t.procurementType} ·{' '}
                    {formatMoney(t.estimatedValue, t.currency)} · {t.opportunity.countryCode}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge tone={STAGE_TONE[t.stage]}>{STAGE_LABEL[t.stage]}</Badge>
                  {t.submissionDeadline && (
                    <Badge tone={deadlineTone(t.daysRemaining, t.deadlinePassed)}>
                      {t.deadlinePassed ? 'Closed' : deadlineLabel(t.submissionDeadline, t.daysRemaining)}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
