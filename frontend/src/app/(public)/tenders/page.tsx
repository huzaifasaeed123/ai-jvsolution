import Link from 'next/link';
import { listPublicTenders } from '@/features/tenders/api';
import { TenderCard } from '@/features/tenders/components/TenderCard';
import { COUNTRIES } from '@/features/auth/constants';

export const metadata = {
  title: 'Tender notices',
  description:
    'Open government and semi-government tender notices — requirements, risk allocation, evaluation criteria and deadlines.',
};

type SP = Record<string, string | string[] | undefined>;

const OPEN_STAGES = ['PUBLISHED', 'CLARIFICATION'];

export default async function TendersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const country = typeof sp.countryCode === 'string' ? sp.countryCode : undefined;

  const tenders = await listPublicTenders({ countryCode: country });
  const open = tenders.filter((t) => OPEN_STAGES.includes(t.stage) && !t.deadlinePassed);
  const closed = tenders.filter((t) => !OPEN_STAGES.includes(t.stage) || t.deadlinePassed);

  const countriesWithTenders = [...new Set(tenders.map((t) => t.opportunity.countryCode))];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Tender notices</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Open procurement from government and semi-government authorities. Every notice publishes its
        requirements, risk allocation and evaluation criteria up front.
      </p>

      {/* Country filter */}
      {countriesWithTenders.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/tenders"
            className={`rounded-full border px-3 py-1.5 text-sm ${!country ? 'border-foreground bg-foreground text-background' : 'border-border-strong hover:border-foreground/40'}`}
          >
            All countries
          </Link>
          {countriesWithTenders.map((code) => (
            <Link
              key={code}
              href={`/tenders?countryCode=${code}`}
              className={`rounded-full border px-3 py-1.5 text-sm ${country === code ? 'border-foreground bg-foreground text-background' : 'border-border-strong hover:border-foreground/40'}`}
            >
              {COUNTRIES.find((c) => c.code === code)?.name ?? code}
            </Link>
          ))}
        </div>
      )}

      {tenders.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <p className="font-medium">No tender notices published yet</p>
          <p className="mt-1 text-sm text-muted">
            Government and semi-government authorities publish procurement here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Open for bids ({open.length})
            </h2>
            {open.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No tenders are currently accepting bids.</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {open.map((t) => (
                  <TenderCard key={t.id} tender={t} />
                ))}
              </div>
            )}
          </div>

          {closed.length > 0 && (
            <div className="mt-12">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Closed &amp; in progress ({closed.length})
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {closed.map((t) => (
                  <TenderCard key={t.id} tender={t} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
