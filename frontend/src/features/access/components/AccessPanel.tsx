'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AccessRequest } from '../types';
import { requestAccess, signNda } from '../actions';

/**
 * Shown on an opportunity's detail page when confidential data is still locked.
 * Renders the right CTA for the viewer's state: request → pending → sign NDA.
 */
export function AccessPanel({
  opportunityId,
  request,
  isLoggedIn,
}: {
  opportunityId: string;
  request: AccessRequest | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  const box = 'mt-3 rounded-lg border border-dashed border-foreground/20 bg-foreground/[0.03] p-5';

  if (!isLoggedIn) {
    return (
      <div className={box}>
        <p className="text-sm font-medium">🔒 Anonymous until approved</p>
        <p className="mt-1 text-sm text-foreground/60">
          Exact location, address and owner identity are revealed after the owner approves your
          request and an NDA is signed.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Sign in to request access
        </Link>
      </div>
    );
  }

  // Logged-in states, driven by the request status.
  if (!request || request.status === 'REJECTED' || request.status === 'REVOKED') {
    return (
      <div className={box}>
        <p className="text-sm font-medium">🔒 Request access to confidential details</p>
        {request?.status === 'REJECTED' && (
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            Your previous request was declined. You can request again.
          </p>
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional note to the owner…"
          rows={2}
          className="mt-3 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <button
          onClick={() => run(() => requestAccess(opportunityId, message || undefined))}
          disabled={pending}
          className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Request access'}
        </button>
      </div>
    );
  }

  if (request.status === 'PENDING') {
    return (
      <div className={box}>
        <p className="text-sm font-medium">⏳ Request pending</p>
        <p className="mt-1 text-sm text-foreground/60">
          The owner has been notified. You’ll be able to sign the NDA once they approve.
        </p>
      </div>
    );
  }

  // APPROVED
  if (request.status === 'APPROVED' && !request.accessGranted) {
    return (
      <div className={box}>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✅ Approved</p>
        <p className="mt-1 text-sm text-foreground/60">
          Sign the NDA to unlock exact location and owner details. Your access is logged and
          watermarked.
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <button
          onClick={() => run(() => signNda(request.id, opportunityId))}
          disabled={pending}
          className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Signing…' : 'Sign NDA & unlock'}
        </button>
      </div>
    );
  }

  return (
    <div className={box}>
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">🔓 Access granted</p>
      <p className="mt-1 text-sm text-foreground/60">Refresh to view the confidential details.</p>
    </div>
  );
}
