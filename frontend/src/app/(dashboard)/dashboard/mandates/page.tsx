import Link from 'next/link';
import { listMyMandates } from '@/features/mandates/api';
import { MandateRow } from '@/features/mandates/components/MandateRow';

export const metadata = { title: 'My mandates' };

export default async function MandatesPage() {
  const items = await listMyMandates();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My mandates</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Define what you want to fund or build — we match you to opportunities.
          </p>
        </div>
        <Link
          href="/dashboard/mandates/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          + New mandate
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-foreground/20 p-10 text-center">
          <p className="text-sm text-foreground/60">No mandates yet.</p>
          <Link
            href="/dashboard/mandates/new"
            className="mt-3 inline-block text-sm font-medium text-foreground hover:underline"
          >
            Create your first mandate →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((m) => (
            <MandateRow key={m.id} mandate={m} />
          ))}
        </div>
      )}
    </div>
  );
}
