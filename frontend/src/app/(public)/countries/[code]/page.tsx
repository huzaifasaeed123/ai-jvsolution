import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCountry, listCountries } from '@/features/countries/api';
import { getOpportunityReference } from '@/features/opportunities/api';
import { toLabelMap } from '@/features/opportunities/format';
import { Badge } from '@/components/ui/Badge';

export async function generateStaticParams() {
  const countries = await listCountries();
  return countries.map((c) => ({ code: c.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const c = await getCountry(code);
  if (!c) return { title: 'Country' };
  return { title: `${c.name} — country intelligence`, description: c.tagline };
}

function Range({ label, low, high, prefix = '', suffix = '' }: { label: string; low: number; high: number; prefix?: string; suffix?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-lg font-semibold">
        {prefix}{low.toLocaleString()} – {prefix}{high.toLocaleString()}
        <span className="ml-1 text-xs font-normal text-muted">{suffix}</span>
      </p>
    </div>
  );
}

export default async function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [c, reference] = await Promise.all([getCountry(code), getOpportunityReference()]);
  if (!c) notFound();
  const structureLabels = toLabelMap(reference.structures);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/countries" className="text-sm text-muted hover:text-foreground">
        ← All countries
      </Link>

      {/* Hero */}
      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-5xl">{c.flag}</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{c.name}</h1>
            <p className="text-sm text-muted">
              {c.region} · {c.currency} · data as of {c.dataAsOf}
            </p>
          </div>
        </div>
        <p className="mt-4 text-foreground/80">{c.overview}</p>

        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-border pt-5 sm:grid-cols-3">
          <Range label="Build cost" low={c.buildCostPerSqm.low} high={c.buildCostPerSqm.high} prefix="$" suffix="/m²" />
          <Range label="Sale price (mid-market)" low={c.salePricePerSqm.low} high={c.salePricePerSqm.high} prefix="$" suffix="/m²" />
          <Range label="Typical owner share" low={c.ownerShareRange.low} high={c.ownerShareRange.high} suffix="%" />
        </div>
      </div>

      {/* Structures */}
      <div className="card mt-6 p-6">
        <h2 className="text-sm font-semibold">Structures in common use</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {c.commonStructures.map((s) => (
            <span key={s} className="rounded-full border border-border-strong px-3 py-1 text-sm">
              {structureLabels[s] ?? s}
            </span>
          ))}
        </div>
      </div>

      {/* Legal mechanics */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-sm font-semibold">Title system</h2>
          <p className="mt-2 text-sm text-foreground/80">{c.titleSystem}</p>
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-semibold">Foreign ownership</h2>
          <p className="mt-2 text-sm text-foreground/80">{c.foreignOwnership}</p>
        </div>
      </div>

      {/* Authorities */}
      <div className="card mt-6 p-6">
        <h2 className="text-sm font-semibold">Key authorities</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {c.authorities.map((a) => (
            <Badge key={a} tone="neutral">{a}</Badge>
          ))}
        </div>
      </div>

      {/* Considerations */}
      <div className="card mt-6 p-6">
        <h2 className="text-sm font-semibold">Structuring considerations</h2>
        <ul className="mt-3 space-y-2">
          {c.considerations.map((x, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/80">
              <span className="text-accent">•</span>
              {x}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="card mt-6 flex flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="font-semibold">Exploring a venture in {c.name}?</h3>
          <p className="mt-1 text-sm text-muted">
            List an opportunity or define a mandate and get matched with an explainable score.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/opportunities?countryCode=${c.code}`} className="btn btn-outline">
            View opportunities
          </Link>
          <Link href="/register" className="btn btn-primary">Get started</Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted">
        Indicative planning ranges for orientation only — not legal, tax or investment advice.
        Verify with qualified local advisors before committing to a structure.
      </p>
    </article>
  );
}
