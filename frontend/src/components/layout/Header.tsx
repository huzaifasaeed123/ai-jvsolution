import Link from 'next/link';
import { config } from '@/lib/config';
import { getCurrentUser } from '@/lib/session';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { getTranslator } from '@/i18n/server';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';
import type { MessageKey } from '@/i18n/messages';

const NAV: { href: string; key: MessageKey }[] = [
  { href: '/how-it-works', key: 'nav.howItWorks' },
  { href: '/opportunities', key: 'nav.opportunities' },
  { href: '/tenders', key: 'nav.tenders' },
  { href: '/countries', key: 'nav.countries' },
  { href: '/structures', key: 'nav.structures' },
];

export async function Header() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslator()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            JV
          </span>
          <span>{config.brandName}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <div className="hidden sm:block">
            <LocaleSwitcher current={t.locale} label={t('common.language')} />
          </div>

          {/* Desktop account controls */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-medium text-foreground/80 hover:text-foreground"
                >
                  {t('nav.dashboard')}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium text-foreground/80 hover:text-foreground"
                >
                  {t('nav.signIn')}
                </Link>
                <Link href="/register" className="btn btn-primary">
                  {t('nav.join')}
                </Link>
              </>
            )}
          </div>

          <MobileNav
            signedIn={!!user}
            items={NAV.map((n) => ({ href: n.href, label: t(n.key) }))}
            labels={{
              menu: t('nav.menu'),
              dashboard: t('nav.dashboard'),
              signIn: t('nav.signIn'),
              join: t('nav.join'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
