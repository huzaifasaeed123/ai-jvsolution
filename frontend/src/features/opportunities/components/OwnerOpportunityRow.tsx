'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { Opportunity } from '../types';
import { formatMoney } from '../format';
import { publishOpportunity, deleteOpportunity } from '../actions';

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
};

export function OwnerOpportunityRow({ opportunity: o }: { opportunity: Opportunity }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onPublish() {
    setError(null);
    startTransition(async () => {
      try {
        await publishOpportunity(o.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function onDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteOpportunity(o.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-foreground/50">{o.reference}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[o.status] ?? 'bg-foreground/10'}`}
          >
            {o.status}
          </span>
        </div>
        <Link href={`/opportunities/${o.id}`} className="mt-1 block font-medium hover:underline">
          {o.title}
        </Link>
        <p className="text-sm text-foreground/55">
          {o.countryCode} · {formatMoney(o.projectValue, o.currency)} GDV
        </p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex items-center gap-2 text-sm">
        {o.status === 'DRAFT' && (
          <button
            onClick={onPublish}
            disabled={pending}
            className="rounded-md bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {pending ? '…' : 'Publish'}
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={pending}
          className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
