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

/** A low–high planning range. Figures use the serif face so they align. */
function Range({
  label,
  low,
  high,
  prefix = '',
  suffix = '',
}: {
  label: string;
  low: number;
  high: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className="figure mt-1 text-[1.375rem] leading-none">
        {prefix}
        {low.toLocaleString()}
        <span className="mx-1 font-normal text-muted">–</span>
        {prefix}
        {high.toLocaleString()}
        <span className="ml-1 text-xs font-normal text-muted">{suffix}</span>
      </p>
    </div>
  );
}

/**
 * A titled block of prose. Ruled rather than boxed, so a page of them reads as
 * one document rather than a stack of unrelated cards.
 */
function Block({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-border pt-5 ${className}`}>
      <h2 className="eyebrow text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [c, reference] = await Promise.all([getCountry(code), getOpportunityReference()]);
  if (!c) notFound();
  const structureLabels = toLabelMap(reference.structures);

  return (
    <article>
      {/* ---------------- Hero ---------------- */}
      <div className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary/[0.04]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 20% 0%, #000 35%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 70% at 20% 0%, #000 35%, transparent 100%)',
          }}
        />

        <div className="container-page relative py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <Link
              href="/countries"
              className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Country intelligence
            </Link>
            <span aria-hidden className="text-muted/40">
              /
            </span>
            <span className="font-mono text-xs text-muted">{c.code}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-[3.5rem] leading-none">{c.flag}</span>
            <div className="min-w-0">
              <h1 className="display text-[2.25rem] leading-tight sm:text-[2.75rem]">{c.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span>{c.region}</span>
                <span aria-hidden className="text-muted/40">
                  ·
                </span>
                <span className="font-mono text-xs">{c.currency}</span>
                <span aria-hidden className="text-muted/40">
                  ·
                </span>
                <span>data as of {c.dataAsOf}</span>
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl leading-relaxed text-foreground/80">{c.overview}</p>

          {/* The numbers a reader came for */}
          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border sm:grid-cols-3">
            <div className="bg-surface p-5">
              <Range
                label="Build cost"
                low={c.buildCostPerSqm.low}
                high={c.buildCostPerSqm.high}
                prefix="$"
                suffix="/m²"
              />
            </div>
            <div className="bg-surface p-5">
              <Range
                label="Sale price (mid-market)"
                low={c.salePricePerSqm.low}
                high={c.salePricePerSqm.high}
                prefix="$"
                suffix="/m²"
              />
            </div>
            <div className="bg-surface p-5">
              <Range
                label="Typical owner share"
                low={c.ownerShareRange.low}
                high={c.ownerShareRange.high}
                suffix="%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="container-page grid gap-x-12 gap-y-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          <Block title="Structures in common use" className="border-t-0 pt-0">
            <ul className="flex flex-wrap gap-2">
              {c.commonStructures.map((s) => (
                <li key={s} className="rounded-lg border border-border-strong px-3 py-1.5 text-sm">
                  {structureLabels[s] ?? s}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Title system">
            <p className="max-w-2xl leading-relaxed text-foreground/80">{c.titleSystem}</p>
          </Block>

          <Block title="Foreign ownership">
            <p className="max-w-2xl leading-relaxed text-foreground/80">{c.foreignOwnership}</p>
          </Block>

          <Block title="Structuring considerations">
            <ol className="max-w-2xl space-y-4">
              {c.considerations.map((x, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border border-border font-mono text-[11px] font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-foreground/80">{x}</span>
                </li>
              ))}
            </ol>
          </Block>
        </div>

        {/* Sidebar travels with the reader on wide screens */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="eyebrow text-muted">Key authorities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {c.authorities.map((a) => (
                <li key={a}>
                  <Badge tone="neutral">{a}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="bg-primary p-5 text-primary-foreground">
              <h2 className="display text-lg leading-snug">Exploring a venture in {c.name}?</h2>
              <p className="mt-2 text-sm leading-relaxed opacity-80">
                List an opportunity or define a mandate and get matched with an explainable score.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <Link href={`/opportunities?countryCode=${c.code}`} className="btn btn-outline w-full">
                View opportunities here
              </Link>
              <Link href="/register" className="btn btn-primary w-full">
                Get started
              </Link>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Indicative planning ranges for orientation only — not legal, tax or investment advice.
            Verify with qualified local advisors before committing to a structure.
          </p>
        </aside>
      </div>
    </article>
  );
}
