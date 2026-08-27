import Link from 'next/link';
import { listCountries } from '@/features/countries/api';

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
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Country intelligence</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        How land partnerships actually work in each market — the structures in common use, what an
        owner typically retains, and the legal mechanics that shape a deal.
      </p>

      {[...byRegion.entries()].map(([region, list]) => (
        <div key={region} className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{region}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <Link
                key={c.code}
                href={`/countries/${c.code.toLowerCase()}`}
                className="card block p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{c.flag}</span>
                  <span className="font-mono text-xs text-muted">{c.currency}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted">{c.tagline}</p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted">
                    Typical owner share
                  </p>
                  <p className="text-sm font-medium">
                    {c.ownerShareRange.low}–{c.ownerShareRange.high}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <p className="mt-12 text-xs text-muted">
        Indicative planning ranges for orientation only — not legal, tax or investment advice.
        Verify with qualified local advisors before committing to a structure.
      </p>
    </section>
  );
}
