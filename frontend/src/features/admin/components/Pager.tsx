import Link from 'next/link';

/** Shared pagination for back-office tables. Renders nothing on a single page. */
export function Pager({
  page,
  pages,
  total,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    q.set('page', String(p));
    return `${basePath}?${q.toString()}`;
  };

  return (
    <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4 text-sm">
      <span className="font-mono text-xs text-muted">
        {total} total · page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="btn btn-outline px-3 py-1.5 text-xs">
            ← Previous
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="btn btn-outline px-3 py-1.5 text-xs">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
