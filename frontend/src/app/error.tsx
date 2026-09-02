'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslator } from '@/i18n/client';

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
  const t = useTranslator();

  useEffect(() => {
    // Server-side errors reach the browser as an opaque digest; the full stack
    // is in the server log. Logging here keeps the two correlatable.
    console.error('Route error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">{t('error.eyebrow')}</p>
      <h1 className="display mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">
        {t('error.title')}
      </h1>
      <p className="mt-4 max-w-md text-muted">{t('error.body')}</p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted">
          {t('error.reference')}: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary px-5 py-2.5">
          {t('common.tryAgain')}
        </button>
        <Link href="/" className="btn btn-outline px-5 py-2.5">
          {t('common.backToHome')}
        </Link>
      </div>
    </div>
  );
}
