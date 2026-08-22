'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { AccessRequest } from '../types';
import { approveRequest, rejectRequest, revokeRequest } from '../actions';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  APPROVED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  REVOKED: 'bg-foreground/10 text-foreground/60',
};

export function IncomingRequestRow({ request: r }: { request: AccessRequest }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[r.status]}`}>
            {r.status}
            {r.status === 'APPROVED' && (r.accessGranted ? ' · NDA signed' : ' · awaiting NDA')}
          </span>
        </div>
        <p className="mt-1 text-sm">
          <span className="font-medium">{r.requester.fullName}</span>{' '}
          <span className="text-foreground/55">({r.requester.email})</span> requested{' '}
          <Link href={`/opportunities/${r.opportunityId}`} className="font-medium hover:underline">
            {r.opportunity.title}
          </Link>
        </p>
        {r.message && <p className="mt-1 text-sm text-foreground/60">“{r.message}”</p>}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {r.status === 'PENDING' && (
          <>
            <button
              onClick={() => run(() => approveRequest(r.id))}
              disabled={pending}
              className="rounded-md bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => run(() => rejectRequest(r.id))}
              disabled={pending}
              className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
        {r.status === 'APPROVED' && (
          <button
            onClick={() => run(() => revokeRequest(r.id))}
            disabled={pending}
            className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5 disabled:opacity-50"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}
