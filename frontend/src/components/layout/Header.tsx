import Link from 'next/link';
import { config } from '@/lib/config';

const NAV = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/countries', label: 'Country intelligence' },
  { href: '/structures', label: 'Structures' },
];

export function Header() {
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
          <Link href="/login" className="text-foreground/80 hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-foreground px-3.5 py-2 font-medium text-background hover:opacity-90"
          >
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
