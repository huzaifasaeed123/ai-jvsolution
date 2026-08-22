import { listIncoming, listMine } from '@/features/access/api';
import { IncomingRequestRow } from '@/features/access/components/IncomingRequestRow';
import { MyRequestRow } from '@/features/access/components/MyRequestRow';

export const metadata = { title: 'Access requests' };

export default async function RequestsPage() {
  const [incoming, mine] = await Promise.all([listIncoming(), listMine()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access requests</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Approve who can see your opportunities, and track your requests to others.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Incoming — on my opportunities
        </h2>
        {incoming.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/50">No incoming requests.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {incoming.map((r) => (
              <IncomingRequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          My requests — to other owners
        </h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/50">You haven’t requested access to anything yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {mine.map((r) => (
              <MyRequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
