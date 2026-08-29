import Link from 'next/link';
import { listCountries } from '@/features/countries/api';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Country intelligence',
  description:
    'Market, legal and structuring intelligence for joint ventures across our launch markets.',
};

export default async function CountriesPage() {
  const countries = await listCountries();

  // Group by region for scannability.
  const byRegion = new Map<string, typeof countries>();
  for (const c of countries) {
    const arr = byRegion.get(c.region) ?? [];
    arr.push(c);
    byRegion.set(c.region, arr);
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Market intelligence"
        title="Country intelligence"
        lede="How land partnerships actually work in each market — the structures in common use, what an owner typically retains, and the legal mechanics that shape a deal."
      />

      {[...byRegion.entries()].map(([region, list]) => (
        <div key={region} className="mt-12">
          <div className="flex items-center gap-4">
            <h2 className="eyebrow shrink-0 text-muted">{region}</h2>
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {list.length} {list.length === 1 ? 'market' : 'markets'}
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <Link
                key={c.code}
                href={`/countries/${c.code.toLowerCase()}`}
                className="card group flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[2rem] leading-none">{c.flag}</span>
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    {c.currency}
                  </span>
                </div>
                <h3 className="display mt-3 text-lg transition-colors group-hover:text-primary">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{c.tagline}</p>

                <div className="mt-4 flex-1" />

                <div className="flex items-end justify-between border-t border-border pt-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-muted">
                    Typical owner share
                  </p>
                  <p className="figure text-base leading-none">
                    {c.ownerShareRange.low}–{c.ownerShareRange.high}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <p className="mt-14 border-t border-border pt-5 text-xs leading-relaxed text-muted">
        Indicative planning ranges for orientation only — not legal, tax or investment advice.
        Verify with qualified local advisors before committing to a structure.
      </p>
    </section>
  );
}
