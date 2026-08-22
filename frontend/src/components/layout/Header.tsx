import Link from 'next/link';
import { config } from '@/lib/config';
import { getCurrentUser } from '@/lib/session';
import { LogoutButton } from '@/features/auth/LogoutButton';

// Only routes that exist today. Marketing pages (how-it-works, countries,
// structures) are added in Step 6 and will be re-added here then.
const NAV = [{ href: '/opportunities', label: 'Opportunities' }];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background">JV</span>
          <span>{config.brandName}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="text-foreground/80 hover:text-foreground">
                Dashboard
              </Link>
              <span className="hidden text-foreground/40 sm:inline">·</span>
              <span className="hidden text-foreground/60 sm:inline">{user.fullName}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-foreground/80 hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-foreground px-3.5 py-2 font-medium text-background hover:opacity-90"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
