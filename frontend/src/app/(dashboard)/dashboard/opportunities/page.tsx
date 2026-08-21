import Link from 'next/link';
import { listMyOpportunities } from '@/features/opportunities/api';
import { OwnerOpportunityRow } from '@/features/opportunities/components/OwnerOpportunityRow';

export const metadata = { title: 'My opportunities' };

export default async function MyOpportunitiesPage() {
  const items = await listMyOpportunities();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My opportunities</h1>
          <p className="mt-1 text-sm text-foreground/60">Create, publish and manage your listings.</p>
        </div>
        <Link
          href="/dashboard/opportunities/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          + New opportunity
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-foreground/20 p-10 text-center">
          <p className="text-sm text-foreground/60">You haven’t created any opportunities yet.</p>
          <Link
            href="/dashboard/opportunities/new"
            className="mt-3 inline-block text-sm font-medium text-foreground hover:underline"
          >
            Create your first one →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((o) => (
            <OwnerOpportunityRow key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}
