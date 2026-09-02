/**
 * Loading placeholders. Shaped roughly like the content they stand in for, so
 * the page does not jump when the real thing arrives.
 */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-foreground/[0.07] ${className}`} />;
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-[3/2] animate-pulse bg-foreground/[0.07]" />
          <div className="space-y-2.5 p-5">
            <SkeletonLine className="h-2.5 w-20" />
            <SkeletonLine className="h-4 w-4/5" />
            <SkeletonLine className="h-3 w-3/5" />
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-3.5">
              <SkeletonLine className="h-6" />
              <SkeletonLine className="h-6" />
              <SkeletonLine className="h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="h-9 w-1/2 max-w-sm" />
      <SkeletonLine className="h-4 w-3/4 max-w-xl" />
      <div className="pt-6">
        <SkeletonCards count={6} />
      </div>
    </div>
  );
}
