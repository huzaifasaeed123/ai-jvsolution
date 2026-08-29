import Link from 'next/link';
import { config } from '@/lib/config';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Platform',
    links: [
      { href: '/opportunities', label: 'Opportunities' },
      { href: '/tenders', label: 'Tender notices' },
      { href: '/structures', label: 'Structure library' },
    ],
  },
  {
    title: 'Intelligence',
    links: [
      { href: '/countries', label: 'Country intelligence' },
      { href: '/how-it-works', label: 'How it works' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { href: '/register?role=OWNER', label: 'List an opportunity' },
      { href: '/register?role=DEVELOPER', label: 'Define a mandate' },
      { href: '/login', label: 'Sign in' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                JV
              </span>
              <p className="display text-base">{config.brandName}</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Platform for private, semi-government and government joint ventures, PPP,
              concessions and infrastructure opportunities.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-muted">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {config.brandName}. All rights reserved.
          </p>
          <p>Market intelligence and modelling — not legal, tax or investment advice.</p>
        </div>
      </div>
    </footer>
  );
}
