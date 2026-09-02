import Link from 'next/link';
import { config } from '@/lib/config';
import { getCurrentUser } from '@/lib/session';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { getTranslator } from '@/i18n/server';
import { LocaleSwitcher } from './LocaleSwitcher';
import { HeaderNav } from './HeaderNav';
import { MobileNav } from './MobileNav';
import { Avatar } from '@/components/ui/Media';
import type { MessageKey } from '@/i18n/messages';

const NAV: { href: string; key: MessageKey }[] = [
  { href: '/opportunities', key: 'nav.opportunities' },
  { href: '/tenders', key: 'nav.tenders' },
  { href: '/countries', key: 'nav.countries' },
  { href: '/structures', key: 'nav.structures' },
  { href: '/how-it-works', key: 'nav.howItWorks' },
];

export async function Header() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslator()]);
  const items = NAV.map((n) => ({ href: n.href, label: t(n.key) }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-[68px] items-center gap-4">
        {/* Brand lockup */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-[13px] font-bold tracking-tight text-primary-foreground">
            JV
          </span>
          <span className="hidden sm:block">
            <span className="display block text-[0.975rem] leading-tight">
              {config.brandName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.11em] text-muted">
              {t('nav.tagline')}
            </span>
          </span>
        </Link>

        <div className="flex-1" />

        <HeaderNav items={items} />

        {/* Hairline between navigation and account controls */}
        <span aria-hidden className="hidden h-5 w-px bg-border lg:block" />

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden sm:block">
            <LocaleSwitcher current={t.locale} label={t('common.language')} />
          </div>

          {/* Account controls appear at the same breakpoint as the nav, so the
              two never disagree about whether this is a desktop layout. */}
          <div className="hidden items-center gap-2.5 lg:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  <Avatar src={user.avatarUrl} name={user.fullName} size={26} />
                  <span className="max-w-[9rem] truncate">{t('nav.dashboard')}</span>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
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
            items={items}
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
