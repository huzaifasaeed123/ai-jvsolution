import { Badge } from '@/components/ui/Badge';
import type { Clarification, SwissChallenge } from '../types';
import { formatDate } from '../format';

/**
 * Published Q&A. Every answered question is visible to all bidders — the
 * platform publishes answers automatically so no bidder gets private guidance.
 */
export function ClarificationList({ items }: { items: Clarification[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted">
        No questions have been published yet. Answers are shared with all bidders.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Answers are published to every bidder — no private guidance is given.
      </p>
      {items.map((c) => (
        <div key={c.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-medium">Q: {c.question}</p>
            <div className="flex shrink-0 items-center gap-2">
              {c.askedByMe && <Badge tone="primary">Your question</Badge>}
              <Badge tone={c.answer ? 'success' : 'warning'}>
                {c.answer ? 'Answered' : 'Awaiting answer'}
              </Badge>
            </div>
          </div>
          {c.answer ? (
            <div className="mt-3 border-t border-border pt-3">
              <p className="whitespace-pre-line text-sm text-foreground/80">A: {c.answer}</p>
              <p className="mt-1 text-xs text-muted">Answered {formatDate(c.answeredAt)}</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Visible only to you and the authority until answered.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

const CHALLENGE_TONE: Record<string, 'primary' | 'success' | 'warning' | 'neutral' | 'danger'> = {
  OPEN: 'primary',
  CLOSED: 'warning',
  ORIGINAL_WINS: 'success',
  CHALLENGER_WINS: 'accent' as never,
  CANCELLED: 'neutral',
};

/** Swiss Challenge status — an unsolicited proposal opened to counter-bids. */
export function ChallengePanel({ challenge }: { challenge: SwissChallenge }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Swiss Challenge</h3>
        <Badge tone={CHALLENGE_TONE[challenge.status] ?? 'neutral'}>
          {challenge.status.replace(/_/g, ' ')}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted">
        This began as an unsolicited proposal. Third parties may submit competing proposals during
        the challenge window.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3 sm:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Window</p>
          <p className="text-sm font-medium">{challenge.challengeWindowDays} days</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Closes</p>
          <p className="text-sm font-medium">{formatDate(challenge.challengeDeadline)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Remaining</p>
          <p className="text-sm font-medium">
            {challenge.windowOpen ? `${challenge.daysRemaining} days` : 'Closed'}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Right to match</p>
          <p className="text-sm font-medium">{challenge.originatorMayMatch ? 'Yes' : 'No'}</p>
        </div>
      </div>
      {challenge.outcomeNotes && (
        <p className="mt-3 border-t border-border pt-3 text-sm text-foreground/80">
          {challenge.outcomeNotes}
        </p>
      )}
    </div>
  );
}
