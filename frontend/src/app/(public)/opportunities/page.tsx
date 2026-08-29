import Link from 'next/link';
import { listOpportunities, getOpportunityReference } from '@/features/opportunities/api';
import { OpportunityCard } from '@/features/opportunities/components/OpportunityCard';
import { OpportunityFilters } from '@/features/opportunities/components/OpportunityFilters';
import { toLabelMap } from '@/features/opportunities/format';
import { PageHeader } from '@/components/ui/PageHeader';

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
    <section className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="The market"
        title="Opportunities"
        lede={
          <>
            {result.total} published{' '}
            {result.total === 1 ? 'opportunity' : 'opportunities'} across the platform. Exact
            location and owner identity stay sealed until the owner approves access and an NDA is
            signed.
          </>
        }
      />

      <div className="mt-6">
        <OpportunityFilters
          sectors={reference.sectors}
          ownerCategories={reference.ownerCategories}
          riskLevels={reference.riskLevels}
        />
      </div>

      {result.items.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-16 text-center">
          <p className="display text-lg">Nothing matches those filters</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Try widening the sector, owner type or risk level — or clear the filters to see the
            whole market.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} sectorLabels={sectorLabels} />
          ))}
        </div>
      )}

      {result.pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4 border-t border-border pt-6 text-sm">
          {page > 1 && (
            <Link
              href={`/opportunities?${new URLSearchParams({ ...sp, page: String(page - 1) } as Record<string, string>)}`}
              className="btn btn-outline px-4 py-2"
            >
              ← Previous
            </Link>
          )}
          <span className="font-mono text-xs text-muted">
            Page {page} of {result.pages}
          </span>
          {page < result.pages && (
            <Link
              href={`/opportunities?${new URLSearchParams({ ...sp, page: String(page + 1) } as Record<string, string>)}`}
              className="btn btn-outline px-4 py-2"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
