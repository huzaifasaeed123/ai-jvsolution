import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getTender,
  listAddenda,
  listClarifications,
  getChallenge,
} from '@/features/tenders/api';
import { getCurrentUser } from '@/lib/session';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { formatMoney } from '@/features/opportunities/format';
import {
  TenderRequirements,
  RiskMatrix,
  EvaluationCriteriaTable,
  AddendaList,
} from '@/features/tenders/components/TenderInfo';
import {
  ClarificationList,
  ChallengePanel,
} from '@/features/tenders/components/ClarificationList';
import {
  STAGE_LABEL,
  STAGE_TONE,
  PROCUREMENT_LABEL,
  deadlineLabel,
  deadlineTone,
  formatDate,
} from '@/features/tenders/format';

export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tender = await getTender(id);
  if (!tender) notFound();

  const [addenda, clarifications, challenge, user] = await Promise.all([
    listAddenda(id),
    listClarifications(id),
    getChallenge(id),
    getCurrentUser(),
  ]);

  const canBid =
    !!user &&
    !tender.isAuthority &&
    tender.isOpenForBids &&
    !tender.deadlinePassed &&
    ['DEVELOPER', 'INVESTOR', 'ADMIN'].includes(user.role);

  const tabs = [
    {
      key: 'requirements',
      label: 'Requirements',
      content: <TenderRequirements tender={tender} />,
    },
    {
      key: 'risk',
      label: 'Risk allocation',
      badge: tender.riskAllocation.length || null,
      content: <RiskMatrix items={tender.riskAllocation} />,
    },
    {
      key: 'evaluation',
      label: 'Evaluation',
      content: <EvaluationCriteriaTable criteria={tender.evaluationCriteria} />,
    },
    {
      key: 'addenda',
      label: 'Addenda',
      badge: addenda.length || null,
      content: <AddendaList addenda={addenda} />,
    },
    {
      key: 'qa',
      label: 'Q&A',
      badge: clarifications.length || null,
      content: <ClarificationList items={clarifications} />,
    },
  ];

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/tenders" className="text-sm text-muted hover:text-foreground">
        ← All tender notices
      </Link>

      {/* Hero */}
      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted">{tender.reference}</span>
              <Badge tone={STAGE_TONE[tender.stage]}>{STAGE_LABEL[tender.stage]}</Badge>
              <Badge tone="neutral">
                {PROCUREMENT_LABEL[tender.procurementType] ?? tender.procurementType}
              </Badge>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{tender.title}</h1>
            <p className="mt-1 text-muted">
              {tender.authority.name} ·{' '}
              <Link
                href={`/opportunities/${tender.opportunity.id}`}
                className="text-primary hover:underline"
              >
                {tender.opportunity.title}
              </Link>{' '}
              · {tender.opportunity.countryCode}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <Badge tone={deadlineTone(tender.daysRemaining, tender.deadlinePassed)}>
              {tender.deadlinePassed
                ? 'Submissions closed'
                : deadlineLabel(tender.submissionDeadline, tender.daysRemaining)}
            </Badge>
            {canBid && (
              <div className="mt-3">
                <Link href={`/dashboard/bids/new?tenderId=${tender.id}`} className="btn btn-primary">
                  Submit a bid
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Key figures */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Estimated value</p>
            <p className="mt-0.5 text-sm font-medium">
              {formatMoney(tender.estimatedValue, tender.currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Bid security</p>
            <p className="mt-0.5 text-sm font-medium">
              {formatMoney(tender.bidSecurity, tender.currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Term</p>
            <p className="mt-0.5 text-sm font-medium">
              {tender.concessionYears ? `${tender.concessionYears} years` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Submission deadline</p>
            <p className="mt-0.5 text-sm font-medium">{formatDate(tender.submissionDeadline)}</p>
          </div>
        </div>

        {tender.clarificationDeadline && (
          <p className="mt-3 text-xs text-muted">
            Clarification questions close {formatDate(tender.clarificationDeadline)}
          </p>
        )}
      </div>

      {challenge && (
        <div className="mt-4">
          <ChallengePanel challenge={challenge} />
        </div>
      )}

      <div className="mt-6">
        <Tabs tabs={tabs} />
      </div>
    </article>
  );
}
