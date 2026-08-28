'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import type { Tender, TenderStage, Clarification } from '../types';
import { STAGE_LABEL, STAGE_TONE, formatDate } from '../format';
import { setTenderStage, answerClarification, issueAddendum } from '../actions';

/** Mirrors the server's forward-only stage machine, so the UI only offers legal moves. */
const NEXT_STAGES: Record<TenderStage, TenderStage[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['CLARIFICATION', 'SUBMISSION_CLOSED', 'CANCELLED'],
  CLARIFICATION: ['SUBMISSION_CLOSED', 'CANCELLED'],
  SUBMISSION_CLOSED: ['UNDER_EVALUATION', 'CANCELLED'],
  UNDER_EVALUATION: ['PREFERRED_BIDDER', 'CANCELLED'],
  PREFERRED_BIDDER: ['FINANCIAL_CLOSE', 'CANCELLED'],
  FINANCIAL_CLOSE: [],
  CANCELLED: [],
};

export function StageControls({ tender }: { tender: Tender }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const next = NEXT_STAGES[tender.stage];

  function move(stage: TenderStage) {
    setError(null);
    startTransition(async () => {
      try {
        await setTenderStage(tender.id, stage);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  const publishBlocked =
    tender.stage === 'DRAFT' &&
    (!tender.submissionDeadline || tender.deadlinePassed);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Procurement stage</h3>
        <Badge tone={STAGE_TONE[tender.stage]}>{STAGE_LABEL[tender.stage]}</Badge>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {next.length === 0 ? (
        <p className="mt-3 text-sm text-muted">This tender has reached a final stage.</p>
      ) : (
        <>
          <p className="mt-2 text-xs text-muted">
            Stages move forward only — the sequence is the audit trail of the procurement.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {next.map((s) => {
              const isCancel = s === 'CANCELLED';
              const blocked = s === 'PUBLISHED' && publishBlocked;
              return (
                <button
                  key={s}
                  onClick={() => move(s)}
                  disabled={pending || blocked}
                  title={blocked ? 'Set a future submission deadline before publishing' : undefined}
                  className={`btn ${isCancel ? 'btn-outline' : 'btn-primary'} px-3 py-1.5 text-xs`}
                >
                  {isCancel ? 'Cancel tender' : `Move to ${STAGE_LABEL[s]}`}
                </button>
              );
            })}
          </div>
          {publishBlocked && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              A future submission deadline is required before publishing.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Answering publishes the Q&A to every bidder — stated plainly in the UI. */
export function AnswerClarifications({
  tenderId,
  items,
}: {
  tenderId: string;
  items: Clarification[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const unanswered = items.filter((c) => !c.answer);
  const answered = items.filter((c) => c.answer);

  function send(id: string) {
    const answer = (drafts[id] ?? '').trim();
    if (answer.length < 1) return;
    setError(null);
    startTransition(async () => {
      try {
        await answerClarification(id, tenderId, answer);
        setDrafts((d) => ({ ...d, [id]: '' }));
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Answering publishes the question and answer to every bidder. Answers cannot be edited
        afterwards.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {items.length === 0 && <p className="text-sm text-muted">No questions have been asked yet.</p>}

      {unanswered.map((c) => (
        <div key={c.id} className="card p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">Q: {c.question}</p>
            <Badge tone="warning">Awaiting answer</Badge>
          </div>
          <textarea
            className="mt-3 w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            rows={3}
            placeholder="Your answer — published to all bidders"
            value={drafts[c.id] ?? ''}
            onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })}
          />
          <button
            onClick={() => send(c.id)}
            disabled={pending || !(drafts[c.id] ?? '').trim()}
            className="btn btn-primary mt-2 px-3 py-1.5 text-xs"
          >
            Publish answer to all bidders
          </button>
        </div>
      ))}

      {answered.map((c) => (
        <div key={c.id} className="card p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">Q: {c.question}</p>
            <Badge tone="success">Published</Badge>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">A: {c.answer}</p>
          <p className="mt-1 text-xs text-muted">Answered {formatDate(c.answeredAt)}</p>
        </div>
      ))}
    </div>
  );
}

/** Numbered, append-only amendments; may extend the submission deadline. */
export function IssueAddendum({ tenderId, canIssue }: { tenderId: string; canIssue: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canIssue) {
    return (
      <p className="card p-4 text-sm text-muted">
        Addenda can only be issued while the tender is open for bids.
      </p>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await issueAddendum(tenderId, {
          title,
          description,
          newSubmissionDeadline: newDeadline ? new Date(newDeadline).toISOString() : undefined,
        });
        setTitle('');
        setDescription('');
        setNewDeadline('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  const input =
    'w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">Issue an addendum</h3>
      <p className="mt-1 text-xs text-muted">
        Addenda are numbered, public and permanent. Setting a new deadline moves the tender deadline.
      </p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-3 space-y-3">
        <input className={input} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          className={input}
          rows={3}
          placeholder="What changed and why"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Revised submission deadline (optional)
          </label>
          <input type="datetime-local" className={input} value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
        </div>
      </div>
      <button
        onClick={submit}
        disabled={pending || title.trim().length < 3 || description.trim().length < 3}
        className="btn btn-primary mt-3"
      >
        {pending ? 'Issuing…' : 'Issue addendum'}
      </button>
    </div>
  );
}
