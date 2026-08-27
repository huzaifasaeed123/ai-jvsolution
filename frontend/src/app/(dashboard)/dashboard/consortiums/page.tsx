import Link from 'next/link';
import { listMyConsortiums } from '@/features/consortiums/api';
import { CreateConsortiumForm } from '@/features/consortiums/components/CreateConsortiumForm';
import { Badge } from '@/components/ui/Badge';

export const metadata = { title: 'Consortiums' };

export default async function ConsortiumsPage() {
  const consortiums = await listMyConsortiums();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Consortiums</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Form a consortium to pursue an opportunity with partners.</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {consortiums.length === 0 ? (
            <div className="card p-10 text-center text-sm text-muted">You’re not in any consortium yet.</div>
          ) : (
            consortiums.map((c) => (
              <Link key={c.id} href={`/dashboard/consortiums/${c.id}`} className="card block p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{c.name}</span>
                  <Badge tone={c.status === 'DISBANDED' ? 'danger' : c.status === 'ACTIVE' ? 'success' : 'primary'}>{c.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {c.isLead ? 'You lead' : `Led by ${c.lead.fullName}`} ·{' '}
                  {c.members.filter((m) => m.status === 'ACCEPTED').length} confirmed · {c.totalEquity}% equity
                </p>
              </Link>
            ))
          )}
        </div>
        <CreateConsortiumForm />
      </div>
    </div>
  );
}
