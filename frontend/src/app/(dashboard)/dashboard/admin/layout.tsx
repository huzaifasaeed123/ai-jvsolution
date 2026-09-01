import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AdminNav } from '@/features/admin/components/AdminNav';

/**
 * Back-office shell.
 *
 * The gate is here, on the server, rather than in the pages. Hiding the nav
 * link is presentation; this is the thing that actually stops a non-admin who
 * types the URL. A non-admin gets a 404 rather than a 403 so the console's
 * existence is not advertised to someone who cannot use it.
 */
export default async function AdminLayout({ children }: LayoutProps<'/dashboard/admin'>) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="eyebrow">Platform administration</p>
          <h1 className="display mt-1.5 text-2xl">Back office</h1>
        </div>
        <span className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
          Signed in as {user.fullName}
        </span>
      </div>

      <AdminNav />

      <div className="mt-6">{children}</div>
    </div>
  );
}
