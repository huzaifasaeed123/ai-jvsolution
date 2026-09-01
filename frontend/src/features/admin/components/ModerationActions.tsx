'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminOpportunity } from '../types';
import { unpublishOpportunity, archiveOpportunity, restoreOpportunity } from '../actions';

/**
 * Takedown controls for one listing.
 *
 * Which controls appear depends on where the listing currently is: there is no
 * point offering "unpublish" on a draft, and the server would reject it anyway.
 */
export function ModerationActions({ opportunity: o }: { opportunity: AdminOpportunity }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<null | 'unpublish' | 'archive'>(null);
  const [reason, setReason] = useState('');

  const onMarket = o.status === 'PUBLISHED' || o.status === 'MATCHED';
  const takenDown = o.status === 'ARCHIVED' || !!o.deletedAt;

  function run(fn: () => Promise<unknown>) {
    setError(null);
    start(async () => {
      try {
        await fn();
        setPrompt(null);
        setReason('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action failed');
      }
    });
  }

  return (
    <div className="w-full">
      {error && (
        <p role="alert" className="mb-2 rounded-md bg-danger/10 px-2.5 py-1.5 text-xs text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {onMarket && (
          <button
            onClick={() => setPrompt(prompt === 'unpublish' ? null : 'unpublish')}
            disabled={pending}
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            title="Return the listing to the owner as a draft"
          >
            Unpublish
          </button>
        )}

        {o.status !== 'ARCHIVED' && (
          <button
            onClick={() => setPrompt(prompt === 'archive' ? null : 'archive')}
            disabled={pending}
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            Archive
          </button>
        )}

        {takenDown && (
          <button
            onClick={() => run(() => restoreOpportunity(o.id))}
            disabled={pending}
            className="rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
            title="Returns the listing to draft — republishing stays the owner's decision"
          >
            Restore
          </button>
        )}
      </div>

      {prompt && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Why is this listing being ${prompt}d? The owner may be told.`}
            className="min-w-56 flex-1 rounded-md border border-border-strong bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-primary"
          />
          <button
            onClick={() =>
              run(() =>
                prompt === 'unpublish'
                  ? unpublishOpportunity(o.id, reason)
                  : archiveOpportunity(o.id, reason),
              )
            }
            disabled={pending || reason.trim().length < 5}
            className="btn btn-outline px-3 py-1.5 text-xs"
          >
            {pending ? 'Working…' : `Confirm ${prompt}`}
          </button>
          <button
            onClick={() => {
              setPrompt(null);
              setReason('');
            }}
            className="px-2 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
