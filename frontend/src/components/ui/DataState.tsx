'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useTranslator } from '@/i18n/client';

/**
 * The two states a list can be in when it has nothing to show, and why they
 * must look different.
 *
 * "Nothing here yet" is a fact about the data: the visitor should stop looking.
 * "We could not load this" is a fact about the system: the visitor should try
 * again. Rendering the second as the first is the worse failure of the two,
 * because it is believed — an owner sees "no listings" and concludes theirs
 * were deleted, and nobody thinks to retry something that looked successful.
 */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-border-strong px-6 py-14 text-center">
      <p className="display text-lg">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/**
 * Shown when a read failed. Deliberately looks like a problem — bordered in the
 * danger tone — so it cannot be mistaken for an empty result at a glance.
 */
export function LoadFailed({ what }: { what: string }) {
  const router = useRouter();
  const t = useTranslator();
  const [pending, start] = useTransition();

  return (
    <div
      role="alert"
      className="rounded-[var(--radius-card)] border border-danger/30 bg-danger/[0.06] px-6 py-12 text-center"
    >
      <p className="display text-lg text-danger">{t('error.loadFailed', { what })}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t('error.loadFailedBody')}</p>
      <button
        onClick={() => start(() => router.refresh())}
        disabled={pending}
        className="btn btn-outline mt-5 px-4 py-2 text-sm"
      >
        {pending ? t('common.retrying') : t('common.tryAgain')}
      </button>
    </div>
  );
}
