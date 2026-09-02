import Link from 'next/link';
import { listPublicTendersResult } from '@/features/tenders/api';
import { TenderCard } from '@/features/tenders/components/TenderCard';
import { COUNTRIES } from '@/features/auth/constants';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, LoadFailed } from '@/components/ui/DataState';

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

  const read = await listPublicTendersResult({ countryCode: country });
  const tenders = read.data;
  const open = tenders.filter((t) => OPEN_STAGES.includes(t.stage) && !t.deadlinePassed);
  const closed = tenders.filter((t) => !OPEN_STAGES.includes(t.stage) || t.deadlinePassed);

  const countriesWithTenders = [...new Set(tenders.map((t) => t.opportunity.countryCode))];

  return (
    <section className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Public procurement"
        title="Tender notices"
        lede="Open procurement from government and semi-government authorities. Every notice publishes its requirements, risk allocation and evaluation criteria up front — before a single bid is opened."
      />

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

      {!read.ok ? (
        <div className="mt-8">
          <LoadFailed what="tender notices" />
        </div>
      ) : tenders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No tender notices published yet"
            body="Government and semi-government authorities publish procurement here."
          />
        </div>
      ) : (
        <>
          <div className="mt-10">
            <div className="flex items-center gap-4">
              <h2 className="eyebrow shrink-0" style={{ color: 'var(--success)' }}>
                Open for bids
              </h2>
              <span aria-hidden className="h-px flex-1 bg-border" />
              <span className="shrink-0 font-mono text-[11px] text-muted">{open.length}</span>
            </div>
            {open.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No tenders are currently accepting bids.</p>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {open.map((t) => (
                  <TenderCard key={t.id} tender={t} />
                ))}
              </div>
            )}
          </div>

          {closed.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center gap-4">
                <h2 className="eyebrow shrink-0 text-muted">Closed &amp; in progress</h2>
                <span aria-hidden className="h-px flex-1 bg-border" />
                <span className="shrink-0 font-mono text-[11px] text-muted">{closed.length}</span>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
