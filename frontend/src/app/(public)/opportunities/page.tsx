import Link from 'next/link';
import { listOpportunities, getOpportunityReference } from '@/features/opportunities/api';
import { OpportunityCard } from '@/features/opportunities/components/OpportunityCard';
import { OpportunityFilters } from '@/features/opportunities/components/OpportunityFilters';
import { toLabelMap } from '@/features/opportunities/format';

export const metadata = { title: 'Opportunities' };

type SP = Record<string, string | string[] | undefined>;

function flat(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = flat(await searchParams);
  const [reference, result] = await Promise.all([
    getOpportunityReference(),
    listOpportunities(sp),
  ]);
  const sectorLabels = toLabelMap(reference.sectors);
  const page = result.page;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Opportunities</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {result.total} published {result.total === 1 ? 'opportunity' : 'opportunities'} · exact
            location and owner identity are revealed only after approval.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <OpportunityFilters
          sectors={reference.sectors}
          ownerCategories={reference.ownerCategories}
          riskLevels={reference.riskLevels}
        />
      </div>

      {result.items.length === 0 ? (
        <p className="mt-16 text-center text-sm text-foreground/50">
          No opportunities match these filters yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} sectorLabels={sectorLabels} />
          ))}
        </div>
      )}

      {result.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/opportunities?${new URLSearchParams({ ...sp, page: String(page - 1) } as Record<string, string>)}`}
              className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5"
            >
              ← Prev
            </Link>
          )}
          <span className="text-foreground/50">
            Page {page} of {result.pages}
          </span>
          {page < result.pages && (
            <Link
              href={`/opportunities?${new URLSearchParams({ ...sp, page: String(page + 1) } as Record<string, string>)}`}
              className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
