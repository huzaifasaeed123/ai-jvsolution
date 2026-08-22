'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { Mandate } from '../types';
import { formatMoney } from '@/features/opportunities/format';
import { deleteMandate } from '../actions';

export function MandateRow({ mandate: m }: { mandate: Mandate }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteMandate(m.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  const ticket =
    m.minInvestment || m.maxInvestment
      ? `${formatMoney(m.minInvestment, m.currency)} – ${formatMoney(m.maxInvestment, m.currency)}`
      : 'Any ticket size';

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${m.active ? 'bg-emerald-500' : 'bg-foreground/30'}`}
            title={m.active ? 'Active' : 'Inactive'}
          />
          <span className="font-medium">{m.title}</span>
        </div>
        <p className="mt-1 text-sm text-foreground/55">
          {m.sectors.length ? m.sectors.length + ' sectors' : 'Any sector'} ·{' '}
          {m.countryCodes.length ? m.countryCodes.join(', ') : 'Any country'} · {ticket}
        </p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/dashboard/mandates/${m.id}`}
          className="rounded-md bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90"
        >
          View matches
        </Link>
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
