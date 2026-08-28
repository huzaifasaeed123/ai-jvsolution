'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { config } from '@/lib/config';
import {
  IconGrid,
  IconBuilding,
  IconTarget,
  IconKey,
  IconSearch,
  IconChart,
  IconCoins,
  IconRuler,
  IconBranch,
  IconInbox,
  IconUsers,
} from '@/components/ui/icons';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles?: string[];
}

interface NavGroup {
  title: string | null;
  items: NavItem[];
}

/** Grouped navigation — scannable sections instead of one long flat list. */
const GROUPS: NavGroup[] = [
  {
    title: null,
    items: [
      { href: '/dashboard', label: 'Overview', icon: <IconGrid /> },
      { href: '/opportunities', label: 'Browse market', icon: <IconSearch /> },
    ],
  },
  {
    title: 'Deals',
    items: [
      { href: '/dashboard/opportunities', label: 'My opportunities', icon: <IconBuilding />, roles: ['OWNER', 'GOVERNMENT', 'ADMIN'] },
      { href: '/dashboard/mandates', label: 'My mandates', icon: <IconTarget />, roles: ['DEVELOPER', 'INVESTOR', 'ADMIN'] },
      { href: '/dashboard/offers', label: 'My offers', icon: <IconInbox />, roles: ['DEVELOPER', 'INVESTOR', 'ADMIN'] },
      { href: '/dashboard/consortiums', label: 'Consortiums', icon: <IconUsers />, roles: ['DEVELOPER', 'INVESTOR', 'ADMIN'] },
      { href: '/dashboard/requests', label: 'Access requests', icon: <IconKey /> },
    ],
  },
  {
    title: 'AI tools',
    items: [
      { href: '/dashboard/feasibility', label: 'Feasibility', icon: <IconChart /> },
      { href: '/dashboard/valuation', label: 'Valuation', icon: <IconCoins /> },
      { href: '/dashboard/estimate', label: 'Estimate', icon: <IconRuler /> },
      { href: '/dashboard/recommender', label: 'Structure', icon: <IconBranch /> },
    ],
  },
];

export function DashboardSidebar({
  user,
}: {
  user: { fullName: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.roles || i.roles.includes(user.role)),
  })).filter((g) => g.items.length > 0);

  const nav = (
    <nav className="flex-1 space-y-5 overflow-y-auto p-3">
      {groups.map((group, gi) => (
        <div key={group.title ?? `g${gi}`}>
          {group.title && (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {active && (
                    <span className="absolute start-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-e bg-primary" />
                  )}
                  <span className={active ? 'text-primary' : 'text-muted'}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/dashboard" className="flex h-16 items-center gap-2 border-b border-border px-5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        JV
      </span>
      <span className="font-semibold tracking-tight">{config.brandName}</span>
    </Link>
  );

  const footer = (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
          {user.fullName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted">{user.role.toLowerCase()}</p>
        </div>
      </div>
      <div className="mt-3">
        <LogoutButton full />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] md:hidden"
      >
        <IconGrid width={20} height={20} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface shadow-[var(--shadow-md)]">
            {brand}
            {nav}
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
