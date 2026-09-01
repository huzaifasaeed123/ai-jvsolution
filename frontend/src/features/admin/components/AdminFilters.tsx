'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface FilterField {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

/**
 * URL-driven filter bar shared by the back-office tables. Keeping state in the
 * query string means a filtered view is linkable — an operator can paste
 * "suspended users in Egypt" straight into a ticket.
 */
export function AdminFilters({
  fields,
  searchPlaceholder = 'Search…',
}: {
  fields: FilterField[];
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // a new filter always starts at page 1
    router.push(`${pathname}?${next.toString()}`);
  }

  const activeCount = [...fields.map((f) => f.key), 'search'].filter((k) =>
    params.get(k),
  ).length;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-3">
      <div className="flex flex-wrap gap-2">
        <input
          defaultValue={params.get('search') ?? ''}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value);
          }}
          className="input min-w-48 flex-1"
        />

        {fields.map((f) => (
          <select
            key={f.key}
            aria-label={f.label}
            value={params.get(f.key) ?? ''}
            onChange={(e) => setParam(f.key, e.target.value)}
            className="input w-auto"
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {activeCount > 0 && (
          <button onClick={() => router.push(pathname)} className="btn btn-outline">
            Clear
            <span className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px]">
              {activeCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
