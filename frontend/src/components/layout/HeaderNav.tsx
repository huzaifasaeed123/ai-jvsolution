'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Primary navigation for the public site.
 *
 * Client-side only so the current section can be marked — a visitor several
 * pages into the market should still be able to see where they are.
 */
export function HeaderNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
              active ? 'text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            {item.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-accent"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
