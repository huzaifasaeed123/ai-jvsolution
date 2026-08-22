'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { AccessRequest } from '../types';
import { signNda } from '../actions';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  APPROVED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  REVOKED: 'bg-foreground/10 text-foreground/60',
};

export function MyRequestRow({ request: r }: { request: AccessRequest }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSign() {
    setError(null);
    startTransition(async () => {
      try {
        await signNda(r.id, r.opportunityId);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-foreground/10 p-4">
      <div className="min-w-0">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[r.status]}`}>
          {r.status}
          {r.status === 'APPROVED' && (r.accessGranted ? ' · unlocked' : ' · sign NDA')}
        </span>
        <Link
          href={`/opportunities/${r.opportunityId}`}
          className="mt-1 block font-medium hover:underline"
        >
          {r.opportunity.title}
        </Link>
        <p className="text-sm text-foreground/55">{r.opportunity.reference}</p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {r.status === 'APPROVED' && !r.accessGranted && (
          <button
            onClick={onSign}
            disabled={pending}
            className="rounded-md bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Signing…' : 'Sign NDA & unlock'}
          </button>
        )}
        {r.accessGranted && (
          <Link
            href={`/opportunities/${r.opportunityId}`}
            className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5"
          >
            View details
          </Link>
        )}
      </div>
    </div>
  );
}
