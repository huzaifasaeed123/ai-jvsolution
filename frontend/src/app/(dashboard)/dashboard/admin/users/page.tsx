import { listUsersResult } from '@/features/admin/api';
import { getCurrentUser } from '@/lib/session';
import { Avatar } from '@/components/ui/Media';
import { Badge } from '@/components/ui/Badge';
import { AdminFilters } from '@/features/admin/components/AdminFilters';
import { UserActions } from '@/features/admin/components/UserActions';
import { Pager } from '@/features/admin/components/Pager';
import { EmptyState, LoadFailed } from '@/components/ui/DataState';
import { ROLE_LABEL, ACCESS_LABEL, StatusPill, relative } from '@/features/admin/format';

export const metadata = { title: 'Users · Back office' };

type SP = Record<string, string | string[] | undefined>;

function flat(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = flat(await searchParams);
  const [read, me] = await Promise.all([listUsersResult(sp), getCurrentUser()]);
  const result = read.data;

  return (
    <div>
      <AdminFilters
        searchPlaceholder="Search by name or email…"
        fields={[
          {
            key: 'role',
            label: 'All roles',
            options: (['OWNER', 'DEVELOPER', 'INVESTOR', 'GOVERNMENT', 'ADMIN'] as const).map(
              (r) => ({ value: r, label: ROLE_LABEL[r] }),
            ),
          },
          {
            key: 'status',
            label: 'Any status',
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SUSPENDED', label: 'Suspended' },
            ],
          },
          {
            key: 'accessLevel',
            label: 'Any access level',
            options: (
              ['PUBLIC', 'REGISTERED', 'VERIFIED', 'NDA', 'DUE_DILIGENCE', 'TRANSACTION'] as const
            ).map((l) => ({ value: l, label: ACCESS_LABEL[l] })),
          },
        ]}
      />

      {!read.ok ? (
        <div className="mt-6">
          <LoadFailed what="the user directory" />
        </div>
      ) : result.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No accounts match those filters"
            body="Clear the filters to see the whole directory."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {result.items.map((u) => {
            const isSelf = me?.id === u.id;
            return (
              <div
                key={u.id}
                className={`card p-4 ${u.status === 'SUSPENDED' ? 'border-danger/30' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={u.avatarUrl} name={u.fullName} size={38} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        <span className="truncate">{u.fullName}</span>
                        {isSelf && <Badge tone="accent">You</Badge>}
                      </p>
                      <p className="truncate text-sm text-muted">{u.email}</p>
                      {u.company?.name && (
                        <p className="truncate text-xs text-muted">{u.company.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="primary">{ROLE_LABEL[u.role] ?? u.role}</Badge>
                    <Badge tone="neutral">{ACCESS_LABEL[u.accessLevel] ?? u.accessLevel}</Badge>
                    <StatusPill status={u.status} />
                    {u.country && (
                      <span className="font-mono text-[11px] text-muted">{u.country}</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                  <span>Joined {relative(u.createdAt)}</span>
                  <span>Last signed in {relative(u.lastLoginAt)}</span>
                </div>

                {u.status === 'SUSPENDED' && u.suspendedReason && (
                  <p className="mt-2 rounded-md bg-danger/[0.07] px-3 py-2 text-xs text-danger">
                    Suspended {relative(u.suspendedAt)} — {u.suspendedReason}
                  </p>
                )}

                <div className="mt-3 border-t border-border pt-3">
                  <UserActions user={u} isSelf={isSelf} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        total={result.total}
        basePath="/dashboard/admin/users"
        params={sp}
      />
    </div>
  );
}
