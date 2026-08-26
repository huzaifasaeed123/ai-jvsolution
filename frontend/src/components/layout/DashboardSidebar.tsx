'use client';

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
  IconSpark,
} from '@/components/ui/icons';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles?: string[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <IconGrid /> },
  {
    href: '/dashboard/opportunities',
    label: 'My opportunities',
    icon: <IconBuilding />,
    roles: ['OWNER', 'GOVERNMENT', 'ADMIN'],
  },
  {
    href: '/dashboard/mandates',
    label: 'My mandates',
    icon: <IconTarget />,
    roles: ['DEVELOPER', 'INVESTOR', 'ADMIN'],
  },
  { href: '/dashboard/requests', label: 'Access requests', icon: <IconKey /> },
  { href: '/dashboard/feasibility', label: 'AI Feasibility', icon: <IconSpark /> },
  { href: '/dashboard/valuation', label: 'AI Valuation', icon: <IconSpark /> },
  { href: '/dashboard/estimate', label: 'AI Estimate', icon: <IconSpark /> },
  { href: '/dashboard/recommender', label: 'AI Structure', icon: <IconSpark /> },
  { href: '/opportunities', label: 'Browse market', icon: <IconSearch /> },
];

export function DashboardSidebar({
  user,
}: {
  user: { fullName: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.roles || i.roles.includes(user.role));

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          JV
        </span>
        <span className="font-semibold tracking-tight">{config.brandName}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className={active ? 'text-primary' : 'text-muted'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <div className="mt-3">
          <LogoutButton full />
        </div>
      </div>
    </aside>
  );
}
