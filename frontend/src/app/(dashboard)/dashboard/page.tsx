import { getCurrentUser } from '@/lib/session';

const ROLE_HEADLINE: Record<string, string> = {
  OWNER: 'List an opportunity and find the right partner.',
  DEVELOPER: 'Define your mandate and receive matched opportunities.',
  INVESTOR: 'Discover and evaluate investment opportunities.',
  GOVERNMENT: 'Publish and manage public / PPP opportunities.',
  ADMIN: 'Administer the platform.',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already guards; satisfies types

  return (
    <div>
      <p className="text-sm text-foreground/50">Signed in as {user.role}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome, {user.fullName}</h1>
      <p className="mt-2 max-w-xl text-foreground/70">
        {ROLE_HEADLINE[user.role] ?? 'Welcome to your dashboard.'}
      </p>

      <div className="mt-8 rounded-lg border border-foreground/10 p-5">
        <p className="text-sm font-medium">Phase 1 in progress</p>
        <p className="mt-1 text-sm text-foreground/60">
          Your role-specific tools (opportunities, mandates, matching, deal room) are being built in
          the next steps. Authentication and your session are live.
        </p>
      </div>
    </div>
  );
}
