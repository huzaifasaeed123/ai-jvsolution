'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { RefItem } from '../types';

/** URL-driven filters (spec §31). Changing a filter updates the query string,
 * which re-renders the server list. */
export function OpportunityFilters({
  sectors,
  ownerCategories,
  riskLevels,
}: {
  sectors: RefItem[];
  ownerCategories: RefItem[];
  riskLevels: RefItem[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`/opportunities?${next.toString()}`);
  }

  const active = ['search', 'sector', 'ownerCategory', 'riskLevel'].filter((k) =>
    params.get(k),
  ).length;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-3 sm:p-4">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
        {/* Search sits first and widest — it is the filter people reach for */}
        <div className="relative">
          <svg
            aria-hidden
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            defaultValue={params.get('search') ?? ''}
            placeholder="Search opportunities…"
            aria-label="Search opportunities"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value);
            }}
            className="input ps-9"
          />
        </div>

        <select
          aria-label="Sector"
          value={params.get('sector') ?? ''}
          onChange={(e) => setParam('sector', e.target.value)}
          className="input"
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Owner type"
          value={params.get('ownerCategory') ?? ''}
          onChange={(e) => setParam('ownerCategory', e.target.value)}
          className="input"
        >
          <option value="">All owner types</option>
          {ownerCategories.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Risk level"
          value={params.get('riskLevel') ?? ''}
          onChange={(e) => setParam('riskLevel', e.target.value)}
          className="input"
        >
          <option value="">Any risk level</option>
          {riskLevels.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>

        {active > 0 && (
          <button
            onClick={() => router.push('/opportunities')}
            className="btn btn-outline whitespace-nowrap"
          >
            Clear
            <span className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px]">
              {active}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
