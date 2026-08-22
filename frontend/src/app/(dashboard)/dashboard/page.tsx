import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { listMyOpportunities } from '@/features/opportunities/api';
import { listMyMandates } from '@/features/mandates/api';
import { listIncoming, listMine } from '@/features/access/api';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconBuilding, IconTarget, IconKey, IconSpark } from '@/components/ui/icons';

const ROLE_HEADLINE: Record<string, string> = {
  OWNER: 'List an opportunity and find the right partner.',
  DEVELOPER: 'Define your mandate and receive matched opportunities.',
  INVESTOR: 'Discover and evaluate investment opportunities.',
  GOVERNMENT: 'Publish and manage public / PPP opportunities.',
  ADMIN: 'Administer the platform.',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSupply = ['OWNER', 'GOVERNMENT', 'ADMIN'].includes(user.role);
  const isDemand = ['DEVELOPER', 'INVESTOR', 'ADMIN'].includes(user.role);

  const [opps, mandates, incoming, mine] = await Promise.all([
    isSupply ? listMyOpportunities() : Promise.resolve([]),
    isDemand ? listMyMandates() : Promise.resolve([]),
    listIncoming(),
    listMine(),
  ]);

  const publishedOpps = opps.filter((o) => o.status === 'PUBLISHED').length;
  const pendingIncoming = incoming.filter((r) => r.status === 'PENDING').length;
  const grantedMine = mine.filter((r) => r.accessGranted).length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="card overflow-hidden p-0">
        <div className="bg-primary/[0.06] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{user.role}</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {user.fullName.split(' ')[0]}
          </h1>
          <p className="mt-1 max-w-xl text-muted">{ROLE_HEADLINE[user.role]}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isSupply && (
          <>
            <StatCard label="My opportunities" value={opps.length} hint={`${publishedOpps} published`} icon={<IconBuilding />} />
            <StatCard label="Access requests" value={pendingIncoming} hint="pending your review" icon={<IconKey />} />
          </>
        )}
        {isDemand && (
          <>
            <StatCard label="My mandates" value={mandates.length} hint={`${mandates.filter((m) => m.active).length} active`} icon={<IconTarget />} />
            <StatCard label="Unlocked deals" value={grantedMine} hint="access granted" icon={<IconSpark />} />
          </>
        )}
        <StatCard label="My requests" value={mine.length} hint="access requests sent" icon={<IconKey />} />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Quick actions</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isSupply && (
            <QuickAction
              href="/dashboard/opportunities/new"
              icon={<IconBuilding />}
              title="List an opportunity"
              desc="Add a plot or project in a few guided steps."
            />
          )}
          {isDemand && (
            <QuickAction
              href="/dashboard/mandates/new"
              icon={<IconTarget />}
              title="Create a mandate"
              desc="Tell us what you want to fund and get matched."
            />
          )}
          <QuickAction
            href="/opportunities"
            icon={<IconSpark />}
            title="Browse the market"
            desc="Explore published opportunities and filters."
          />
          <QuickAction
            href="/dashboard/requests"
            icon={<IconKey />}
            title="Manage access"
            desc="Approve who sees your deals; track your requests."
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </Link>
  );
}
