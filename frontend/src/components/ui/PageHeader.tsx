import type { ReactNode } from 'react';

/**
 * Standard head of a public listing page: eyebrow, display heading, one line of
 * orientation, and optional actions on the right. Defined once so every listing
 * opens with the same rhythm rather than each page inventing its own spacing.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-border pb-6">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display mt-2 text-[2rem] leading-tight sm:text-[2.5rem]">{title}</h1>
        {lede && <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted">{lede}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
