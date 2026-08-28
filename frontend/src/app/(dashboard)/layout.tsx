import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { config } from '@/lib/config';

/**
 * Protected shell. Server-side auth gate + a persistent icon sidebar (desktop)
 * and a compact top bar (mobile).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        user={{
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              JV
            </span>
            {config.brandName}
          </Link>
          <LogoutButton />
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
