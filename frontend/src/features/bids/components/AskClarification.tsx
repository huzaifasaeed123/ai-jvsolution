'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { askClarification } from '../actions';

/** Bidders ask; the authority's answer is published to everyone. */
export function AskClarification({ tenderId }: { tenderId: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await askClarification(tenderId, question);
        setQuestion('');
        setSent(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send');
      }
    });
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">Ask a clarification question</h3>
      <p className="mt-1 text-xs text-muted">
        The authority&rsquo;s answer is published to every bidder. Your identity is not revealed.
      </p>
      <textarea
        className="mt-3 w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
        rows={3}
        placeholder="e.g. Is rolling stock within the scope of supply?"
        value={question}
        onChange={(e) => {
          setQuestion(e.target.value);
          setSent(false);
        }}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {sent && !error && (
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
          Question sent. It stays private until the authority answers.
        </p>
      )}
      <button
        onClick={submit}
        disabled={pending || question.trim().length < 5}
        className="btn btn-outline mt-3"
      >
        {pending ? 'Sending…' : 'Send question'}
      </button>
    </div>
  );
}
