import Link from 'next/link';
import { config } from '@/lib/config';
import { listCountries } from '@/features/countries/api';
import { getTranslator } from '@/i18n/server';
import type { MessageKey } from '@/i18n/messages';

const COLUMNS: {
  titleKey: MessageKey;
  links: { href: string; labelKey: MessageKey }[];
}[] = [
  {
    titleKey: 'footer.platform',
    links: [
      { href: '/opportunities', labelKey: 'nav.opportunities' },
      { href: '/tenders', labelKey: 'footer.tenderNotices' },
      { href: '/structures', labelKey: 'footer.structureLibrary' },
      { href: '/how-it-works', labelKey: 'nav.howItWorks' },
    ],
  },
  {
    titleKey: 'footer.intelligence',
    links: [
      { href: '/countries', labelKey: 'nav.countries' },
      { href: '/structures', labelKey: 'footer.structuresExplained' },
      { href: '/how-it-works', labelKey: 'footer.verificationTiers' },
    ],
  },
  {
    titleKey: 'footer.getStarted',
    links: [
      { href: '/register?role=OWNER', labelKey: 'footer.listOpportunity' },
      { href: '/register?role=DEVELOPER', labelKey: 'footer.defineMandate' },
      { href: '/register?role=GOVERNMENT', labelKey: 'footer.publishTender' },
      { href: '/login', labelKey: 'nav.signIn' },
    ],
  },
];

/**
 * Dark ground, deliberately. On a near-white page a white footer has no weight
 * and reads as more content rather than the end of the page. The colours come
 * from dedicated --footer-* tokens rather than --primary, which inverts to a
 * light blue in dark mode and would turn this band pale exactly where the page
 * needs an anchor.
 */
export async function Footer() {
  const [countries, t] = await Promise.all([listCountries(), getTranslator()]);

  return (
    <footer
      className="mt-auto"
      style={{ background: 'var(--footer-bg)', color: 'var(--footer-fg)' }}
    >
      {/* Bronze rule marks the boundary against the page above it. */}
      <div
        aria-hidden
        className="h-[3px]"
        style={{
          background:
            'linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 35%, transparent) 45%, transparent)',
        }}
      />

      <div className="container-page">
        {/* ---------- Brand + navigation ---------- */}
        <div className="grid gap-10 py-14 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] lg:gap-14">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg text-[13px] font-bold tracking-tight"
                style={{ background: 'var(--accent)', color: '#11273d' }}
              >
                JV
              </span>
              <span>
                <span className="display block text-[0.975rem] leading-tight">
                  {config.brandName}
                </span>
                <span
                  className="block text-[10px] uppercase tracking-[0.11em]"
                  style={{ color: 'var(--footer-muted)' }}
                >
                  {t('nav.tagline')}
                </span>
              </span>
            </Link>

            <p
              className="mt-5 text-sm leading-relaxed"
              style={{ color: 'var(--footer-muted)' }}
            >
              {t('footer.blurb')}
            </p>

            <p
              className="mt-5 flex items-center gap-2 text-xs"
              style={{ color: 'var(--footer-muted)' }}
            >
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {t('footer.liveFigures')}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.titleKey} aria-label={t(col.titleKey)}>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: 'var(--accent)' }}
              >
                {t(col.titleKey)}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.labelKey}>
                    <Link
                      href={l.href}
                      className="text-sm underline-offset-4 transition-colors hover:underline"
                      style={{ color: 'var(--footer-muted)' }}
                    >
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---------- Markets ---------- */}
        {countries.length > 0 && (
          <div className="py-8" style={{ borderTop: '1px solid var(--footer-border)' }}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <p
                className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: 'var(--accent)' }}
              >
                {t('footer.activeMarkets')}
              </p>
              <span
                aria-hidden
                className="hidden h-px flex-1 sm:block"
                style={{ background: 'var(--footer-border)' }}
              />
              <span
                className="shrink-0 font-mono text-[11px]"
                style={{ color: 'var(--footer-muted)' }}
              >
                {countries.length} {t('footer.covered')}
              </span>
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
              {countries.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/countries/${c.code.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 text-sm underline-offset-4 transition-colors hover:underline"
                    style={{ color: 'var(--footer-muted)' }}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- Legal ---------- */}
        <div
          className="flex flex-col gap-3 py-6 text-xs lg:flex-row lg:items-center lg:justify-between"
          style={{ borderTop: '1px solid var(--footer-border)', color: 'var(--footer-muted)' }}
        >
          <p>
            &copy; {new Date().getFullYear()} {config.brandName}. {t('footer.rights')}
          </p>
          <p className="lg:text-right">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
