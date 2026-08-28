import Link from 'next/link';
import { getProcurementReference } from '@/features/tenders/api';
import { listMyOpportunities } from '@/features/opportunities/api';
import { TenderForm } from '@/features/tenders/components/TenderForm';

export const metadata = { title: 'New tender' };

export default async function NewTenderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const chosen = typeof sp.opportunityId === 'string' ? sp.opportunityId : undefined;

  const [reference, opportunities] = await Promise.all([
    getProcurementReference(),
    listMyOpportunities(),
  ]);

  const eligible = opportunities.filter(
    (o) => o.ownerCategory === 'GOVERNMENT' || o.ownerCategory === 'SEMI_GOVERNMENT',
  );

  return (
    <div>
      <Link href="/dashboard/tenders" className="text-sm text-muted hover:text-foreground">
        ← My tenders
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">New tender</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted">
        Publish requirements, risk allocation and evaluation criteria up front. The tender is created
        as a draft — you publish it when it&rsquo;s ready.
      </p>

      {eligible.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium">No eligible opportunity</p>
          <p className="mt-1 text-sm text-muted">
            Tenders apply to government and semi-government opportunities only.
          </p>
        </div>
      ) : !chosen ? (
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Choose the opportunity to tender</h3>
          <div className="mt-3 space-y-2">
            {eligible.map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/tenders/new?opportunityId=${o.id}`}
                className="flex items-center justify-between rounded-md border border-border-strong px-4 py-3 text-sm transition-colors hover:bg-foreground/5"
              >
                <span>
                  <span className="font-mono text-xs text-muted">{o.reference}</span>{' '}
                  <span className="font-medium">{o.title}</span>
                </span>
                <span className="text-xs text-muted">{o.ownerCategory.replace('_', '-')}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <TenderForm opportunityId={chosen} reference={reference} />
      )}
    </div>
  );
}
