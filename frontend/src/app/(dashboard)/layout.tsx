import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { config } from '@/lib/config';

/**
 * Protected shell. Server-side auth gate: unauthenticated users are redirected
 * to /login before any dashboard content renders.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
          {config.brandName}
        </p>
        <nav className="mt-4 space-y-1 text-sm">
          <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-foreground/5">
            Dashboard
          </Link>
          {(user.role === 'OWNER' || user.role === 'GOVERNMENT' || user.role === 'ADMIN') && (
            <Link
              href="/dashboard/opportunities"
              className="block rounded-md px-3 py-2 hover:bg-foreground/5"
            >
              My opportunities
            </Link>
          )}
          <Link href="/opportunities" className="block rounded-md px-3 py-2 hover:bg-foreground/5">
            Browse opportunities
          </Link>
        </nav>
        <div className="mt-8 border-t border-foreground/10 pt-4">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-foreground/50">{user.email}</p>
          <p className="mt-1 inline-block rounded bg-foreground/10 px-1.5 py-0.5 text-[11px] font-medium">
            {user.role}
          </p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
