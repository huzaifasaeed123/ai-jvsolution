'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Route-level error boundary.
 *
 * Reads degrade to fallbacks rather than throwing, so reaching this page means
 * something genuinely unexpected happened — a bug in a component, or an
 * exception from a path that has no fallback. The visitor gets a way back
 * instead of a blank screen, and `reset` retries the segment without a full
 * reload, which is often enough for a transient failure.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side errors reach the browser as an opaque digest; the full stack
    // is in the server log. Logging here keeps the two correlatable.
    console.error('Route error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">
        This page could not be loaded
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The error has been logged. Trying again often resolves it — if not, the
        rest of the site is still available.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary px-5 py-2.5">
          Try again
        </button>
        <Link href="/" className="btn btn-outline px-5 py-2.5">
          Back to home
        </Link>
      </div>
    </div>
  );
}
