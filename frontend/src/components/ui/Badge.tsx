import type { ReactNode } from 'react';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

const TONE: Record<Tone, string> = {
  neutral: 'bg-foreground/8 text-foreground/70',
  primary: 'bg-primary/12 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  danger: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE[tone]}`}>
      {children}
    </span>
  );
}
