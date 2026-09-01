'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUser } from '../types';
import type { Role, AccessLevel } from '@/features/auth/types';
import {
  setUserRole,
  setUserAccessLevel,
  suspendUser,
  reinstateUser,
  signOutUser,
  deleteUser,
} from '../actions';
import { ROLE_LABEL, ACCESS_LABEL } from '../format';

const ROLES: Role[] = ['OWNER', 'DEVELOPER', 'INVESTOR', 'GOVERNMENT', 'ADMIN'];
const LEVELS: AccessLevel[] = [
  'PUBLIC',
  'REGISTERED',
  'VERIFIED',
  'NDA',
  'DUE_DILIGENCE',
  'TRANSACTION',
];

/**
 * Row-level controls for one account.
 *
 * Destructive actions ask for a reason inline rather than behind a modal — the
 * reason is mandatory server-side and ends up in the audit trail, so it is part
 * of the action rather than a confirmation step bolted on afterwards.
 */
export function UserActions({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<null | 'suspend' | 'delete'>(null);
  const [reason, setReason] = useState('');

  function run(fn: () => Promise<unknown>) {
    setError(null);
    start(async () => {
      try {
        await fn();
        setPrompt(null);
        setReason('');
        router.refresh();
      } catch (e) {
        // The API's guardrail messages are the useful part — show them verbatim.
        setError(e instanceof Error ? e.message : 'Action failed');
      }
    });
  }

  if (isSelf) {
    return (
      <span className="text-xs text-muted">
        Your own account — ask another administrator
      </span>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <p role="alert" className="mb-2 rounded-md bg-danger/10 px-2.5 py-1.5 text-xs text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`role-${user.id}`}>
          Role
        </label>
        <select
          id={`role-${user.id}`}
          value={user.role}
          disabled={pending}
          onChange={(e) => run(() => setUserRole(user.id, e.target.value as Role))}
          className="rounded-md border border-border-strong bg-transparent px-2 py-1 text-xs outline-none focus:border-primary"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor={`level-${user.id}`}>
          Access level
        </label>
        <select
          id={`level-${user.id}`}
          value={user.accessLevel}
          disabled={pending}
          onChange={(e) => run(() => setUserAccessLevel(user.id, e.target.value as AccessLevel))}
          className="rounded-md border border-border-strong bg-transparent px-2 py-1 text-xs outline-none focus:border-primary"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {ACCESS_LABEL[l]}
            </option>
          ))}
        </select>

        <button
          onClick={() => run(() => signOutUser(user.id))}
          disabled={pending}
          className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          title="Revoke every session for this user"
        >
          Sign out
        </button>

        {user.status === 'ACTIVE' ? (
          <button
            onClick={() => setPrompt(prompt === 'suspend' ? null : 'suspend')}
            disabled={pending}
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            Suspend
          </button>
        ) : (
          <button
            onClick={() => run(() => reinstateUser(user.id))}
            disabled={pending}
            className="rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
          >
            Reinstate
          </button>
        )}

        <button
          onClick={() => setPrompt(prompt === 'delete' ? null : 'delete')}
          disabled={pending}
          className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          Delete
        </button>
      </div>

      {prompt && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              prompt === 'suspend'
                ? 'Why is this account being suspended?'
                : 'Why is this account being deleted?'
            }
            className="min-w-56 flex-1 rounded-md border border-border-strong bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-primary"
          />
          <button
            onClick={() =>
              run(() =>
                prompt === 'suspend'
                  ? suspendUser(user.id, reason)
                  : deleteUser(user.id, reason),
              )
            }
            disabled={pending || reason.trim().length < 5}
            className="btn btn-outline px-3 py-1.5 text-xs"
          >
            {pending ? 'Working…' : `Confirm ${prompt}`}
          </button>
          <button
            onClick={() => {
              setPrompt(null);
              setReason('');
            }}
            className="px-2 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
