'use client';

import { useState, type ReactNode } from 'react';

export interface TabDef {
  key: string;
  label: string;
  badge?: number | string | null;
  content: ReactNode;
}

/**
 * Simple client-side tabs. Content for every tab is rendered by the server and
 * passed in, so switching is instant with no refetch.
 */
export function Tabs({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const available = tabs.filter(Boolean);
  const [active, setActive] = useState(initial ?? available[0]?.key);
  const current = available.find((t) => t.key === active) ?? available[0];

  return (
    <div>
      <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-border">
        {available.map((t) => {
          const on = t.key === current?.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors ${
                on ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              {t.label}
              {t.badge != null && t.badge !== 0 && (
                <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold">
                  {t.badge}
                </span>
              )}
              {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-t bg-primary" />}
            </button>
          );
        })}
      </div>
      <div className="pt-5">{current?.content}</div>
    </div>
  );
}
