import Link from 'next/link';
import { getInvestorDashboard } from '@/features/indicators/api';
import { InvestorDashboard } from '@/features/indicators/components/InvestorDashboard';

export const metadata = { title: 'Investor dashboard' };

export default async function InvestorDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getInvestorDashboard(id);

  return (
    <section className="container-page py-10 sm:py-12">
      <Link href={`/opportunities/${id}`} className="text-sm text-muted hover:text-foreground">
        ← Back to opportunity
      </Link>

      {!data ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-medium">🔒 Investor dashboard locked</p>
          <p className="mt-1 text-sm text-muted">
            The dashboard unlocks after the owner grants you access to this opportunity.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <span className="font-mono text-xs text-muted">{data.opportunity.reference}</span>
            <h1 className="text-2xl font-semibold tracking-tight">{data.opportunity.title}</h1>
            <p className="text-sm text-muted">
              {data.opportunity.sector} · {data.opportunity.countryCode} · {data.opportunity.status}
            </p>
          </div>
          <div className="mt-6">
            <InvestorDashboard data={data} />
          </div>
        </>
      )}
    </section>
  );
}
