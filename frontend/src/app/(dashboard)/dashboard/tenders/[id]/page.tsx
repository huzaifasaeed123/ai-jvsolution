import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getTender,
  getProcurementReference,
  listClarifications,
  listAddenda,
} from '@/features/tenders/api';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { formatMoney } from '@/features/opportunities/format';
import { TenderForm } from '@/features/tenders/components/TenderForm';
import {
  StageControls,
  AnswerClarifications,
  IssueAddendum,
} from '@/features/tenders/components/AuthorityControls';
import { AddendaList } from '@/features/tenders/components/TenderInfo';
import {
  STAGE_LABEL,
  STAGE_TONE,
  PROCUREMENT_LABEL,
  deadlineLabel,
  deadlineTone,
  formatDate,
} from '@/features/tenders/format';

export const metadata = { title: 'Manage tender' };

const OPEN_STAGES = ['PUBLISHED', 'CLARIFICATION'];
const EDITABLE_STAGES = ['DRAFT', 'PUBLISHED', 'CLARIFICATION'];

export default async function ManageTenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tender = await getTender(id);
  if (!tender) notFound();

  const [reference, clarifications, addenda] = await Promise.all([
    getProcurementReference(),
    listClarifications(id),
    listAddenda(id),
  ]);

  const unanswered = clarifications.filter((c) => !c.answer).length;
  const canEdit = EDITABLE_STAGES.includes(tender.stage);
  const canIssueAddendum = OPEN_STAGES.includes(tender.stage);

  const tabs = [
    {
      key: 'manage',
      label: 'Manage',
      content: (
        <div className="space-y-4">
          <StageControls tender={tender} />
          {tender.stage === 'SUBMISSION_CLOSED' || tender.stage === 'UNDER_EVALUATION' ? (
            <div className="card p-5">
              <h3 className="text-sm font-semibold">Bids &amp; evaluation</h3>
              <p className="mt-1 text-sm text-muted">
                Review received bids and score them against the published criteria.
              </p>
              <Link href={`/dashboard/tenders/${tender.id}/bids`} className="btn btn-primary mt-3">
                Open evaluation
              </Link>
            </div>
          ) : (
            <div className="card p-5">
              <h3 className="text-sm font-semibold">Bids</h3>
              <p className="mt-1 text-sm text-muted">
                Bid contents stay sealed until the submission deadline passes.
              </p>
              <Link href={`/dashboard/tenders/${tender.id}/bids`} className="btn btn-outline mt-3">
                View received bids
              </Link>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'qa',
      label: 'Clarifications',
      badge: unanswered || null,
      content: <AnswerClarifications tenderId={tender.id} items={clarifications} />,
    },
    {
      key: 'addenda',
      label: 'Addenda',
      badge: addenda.length || null,
      content: (
        <div className="space-y-4">
          <IssueAddendum tenderId={tender.id} canIssue={canIssueAddendum} />
          <AddendaList addenda={addenda} />
        </div>
      ),
    },
    {
      key: 'edit',
      label: 'Edit',
      content: canEdit ? (
        <TenderForm tender={tender} reference={reference} />
      ) : (
        <p className="card p-5 text-sm text-muted">
          Tender terms are locked once bidding closes — this keeps the process defensible.
        </p>
      ),
    },
  ];

  return (
    <div>
      <Link href="/dashboard/tenders" className="text-sm text-muted hover:text-foreground">
        ← My tenders
      </Link>

      {/* Header */}
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
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{tender.title}</h1>
            <p className="mt-1 text-sm text-muted">{tender.opportunity.title}</p>
          </div>
          <div className="shrink-0 text-right">
            {tender.submissionDeadline && (
              <Badge tone={deadlineTone(tender.daysRemaining, tender.deadlinePassed)}>
                {tender.deadlinePassed
                  ? 'Submissions closed'
                  : deadlineLabel(tender.submissionDeadline, tender.daysRemaining)}
              </Badge>
            )}
            {tender.stage !== 'DRAFT' && (
              <div className="mt-2">
                <Link href={`/tenders/${tender.id}`} className="text-sm text-primary hover:underline">
                  View public notice →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Estimated value</p>
            <p className="mt-0.5 text-sm font-medium">{formatMoney(tender.estimatedValue, tender.currency)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Bid security</p>
            <p className="mt-0.5 text-sm font-medium">{formatMoney(tender.bidSecurity, tender.currency)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Deadline</p>
            <p className="mt-0.5 text-sm font-medium">{formatDate(tender.submissionDeadline)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Criteria</p>
            <p className="mt-0.5 text-sm font-medium">{tender.evaluationCriteria.length} published</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}
