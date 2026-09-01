'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/opportunities', label: 'Listings' },
  { href: '/dashboard/admin/verification', label: 'Verification' },
  { href: '/dashboard/admin/tenders', label: 'Tenders' },
  { href: '/dashboard/admin/access', label: 'Access requests' },
  { href: '/dashboard/admin/audit', label: 'Activity' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 -mb-px flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((t) => {
        // Overview is an exact match; the rest own their subtree.
        const active =
          t.href === '/dashboard/admin'
            ? pathname === t.href
            : pathname === t.href || pathname.startsWith(t.href + '/');
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
