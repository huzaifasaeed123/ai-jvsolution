import type { FitResult } from '../types';

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  B: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
  C: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  D: 'bg-foreground/10 text-foreground/60 border-foreground/20',
};

export function FitScoreBadge({ fit }: { fit: FitResult }) {
  return (
    <div className={`flex flex-col items-center rounded-lg border px-3 py-2 ${GRADE_STYLE[fit.grade]}`}>
      <span className="text-2xl font-bold leading-none">{fit.score}</span>
      <span className="mt-1 text-[11px] font-medium uppercase tracking-wide">
        {fit.grade} · {fit.gradeLabel}
      </span>
    </div>
  );
}
