import Link from 'next/link';
import { config } from '@/lib/config';
import { getCurrentUser } from '@/lib/session';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { getTranslator } from '@/i18n/server';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { MessageKey } from '@/i18n/messages';

const NAV: { href: string; key: MessageKey }[] = [
  { href: '/how-it-works', key: 'nav.howItWorks' },
  { href: '/opportunities', key: 'nav.opportunities' },
  { href: '/countries', key: 'nav.countries' },
  { href: '/structures', key: 'nav.structures' },
];

export async function Header() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslator()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            JV
          </span>
          <span>{config.brandName}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <LocaleSwitcher current={t.locale} label={t('common.language')} />
          {user ? (
            <>
              <Link href="/dashboard" className="font-medium text-foreground/80 hover:text-foreground">
                {t('nav.dashboard')}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-foreground/80 hover:text-foreground">
                {t('nav.signIn')}
              </Link>
              <Link href="/register" className="btn btn-primary">
                {t('nav.join')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
