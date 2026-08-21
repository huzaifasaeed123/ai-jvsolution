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

  const select =
    'rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40';

  return (
    <div className="flex flex-wrap gap-2">
      <input
        defaultValue={params.get('search') ?? ''}
        placeholder="Search…"
        onKeyDown={(e) => {
          if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value);
        }}
        className={select}
      />
      <select
        value={params.get('sector') ?? ''}
        onChange={(e) => setParam('sector', e.target.value)}
        className={select}
      >
        <option value="">All sectors</option>
        {sectors.map((s) => (
          <option key={s.code} value={s.code}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={params.get('ownerCategory') ?? ''}
        onChange={(e) => setParam('ownerCategory', e.target.value)}
        className={select}
      >
        <option value="">All owners</option>
        {ownerCategories.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={params.get('riskLevel') ?? ''}
        onChange={(e) => setParam('riskLevel', e.target.value)}
        className={select}
      >
        <option value="">Any risk</option>
        {riskLevels.map((r) => (
          <option key={r.code} value={r.code}>
            {r.label}
          </option>
        ))}
      </select>
      {params.toString() && (
        <button
          onClick={() => router.push('/opportunities')}
          className="rounded-md border border-foreground/15 px-3 py-2 text-sm hover:bg-foreground/5"
        >
          Clear
        </button>
      )}
    </div>
  );
}
