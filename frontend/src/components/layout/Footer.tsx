import Link from 'next/link';
import { config } from '@/lib/config';
import { listCountries } from '@/features/countries/api';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Platform',
    links: [
      { href: '/opportunities', label: 'Opportunities' },
      { href: '/tenders', label: 'Tender notices' },
      { href: '/structures', label: 'Structure library' },
      { href: '/how-it-works', label: 'How it works' },
    ],
  },
  {
    title: 'Intelligence',
    links: [
      { href: '/countries', label: 'Country intelligence' },
      { href: '/structures', label: 'Deal structures explained' },
      { href: '/how-it-works', label: 'Verification tiers' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { href: '/register?role=OWNER', label: 'List an opportunity' },
      { href: '/register?role=DEVELOPER', label: 'Define a mandate' },
      { href: '/register?role=GOVERNMENT', label: 'Publish a tender' },
      { href: '/login', label: 'Sign in' },
    ],
  },
];

export async function Footer() {
  const countries = await listCountries();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      {/* A single bronze hairline reads as a finished edge rather than a
          page that simply ran out of content. */}
      <div aria-hidden className="h-px bg-gradient-to-r from-accent/50 via-accent/15 to-transparent" />

      <div className="container-page">
        {/* ---------- Brand + navigation ---------- */}
        <div className="grid gap-10 py-14 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-[13px] font-bold tracking-tight text-primary-foreground">
                JV
              </span>
              <span>
                <span className="display block text-[0.975rem] leading-tight">
                  {config.brandName}
                </span>
                <span className="block text-[10px] uppercase tracking-[0.11em] text-muted">
                  JV · PPP · Concessions
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-muted">
              A meeting place for landowners, governments and asset holders on one side, and
              developers, investors and contractors on the other — with explainable matching,
              graded verification and controlled disclosure between them.
            </p>

            <p className="mt-5 flex items-center gap-2 text-xs text-muted">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              Platform figures on this site are counted live, never hard-coded
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow text-muted">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---------- Markets ---------- */}
        {countries.length > 0 && (
          <div className="border-t border-border py-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <p className="eyebrow shrink-0 text-muted">Active markets</p>
              <span aria-hidden className="hidden h-px flex-1 bg-border sm:block" />
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {countries.length} covered
              </span>
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
              {countries.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/countries/${c.code.toLowerCase()}`}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="underline-offset-4 group-hover:underline">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- Legal ---------- */}
        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted lg:flex-row lg:items-center lg:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {config.brandName}. All rights reserved.
          </p>
          <p className="lg:text-right">
            Market intelligence and modelling — not legal, tax or investment advice. Verify with
            qualified local advisors before committing to a structure.
          </p>
        </div>
      </div>
    </footer>
  );
}
