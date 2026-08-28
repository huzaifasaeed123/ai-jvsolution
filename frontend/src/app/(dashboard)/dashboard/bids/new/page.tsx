import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTender } from '@/features/tenders/api';
import { listMyConsortiums } from '@/features/consortiums/api';
import { BidEditor } from '@/features/bids/components/BidEditor';
import { AskClarification } from '@/features/bids/components/AskClarification';
import { Badge } from '@/components/ui/Badge';
import { STAGE_LABEL, STAGE_TONE, deadlineLabel, deadlineTone } from '@/features/tenders/format';

export const metadata = { title: 'Submit a bid' };

export default async function NewBidPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tenderId = typeof sp.tenderId === 'string' ? sp.tenderId : undefined;
  if (!tenderId) notFound();

  const [tender, consortiums] = await Promise.all([getTender(tenderId), listMyConsortiums()]);
  if (!tender) notFound();

  // Only a consortium lead may bid on its behalf (enforced server-side too).
  const leadOf = consortiums
    .filter((c) => c.isLead && c.status !== 'DISBANDED')
    .map((c) => ({ id: c.id, name: c.name, isLead: true }));

  return (
    <div>
      <Link href={`/tenders/${tender.id}`} className="text-sm text-muted hover:text-foreground">
        ← Back to tender notice
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">{tender.reference}</span>
        <Badge tone={STAGE_TONE[tender.stage]}>{STAGE_LABEL[tender.stage]}</Badge>
        <Badge tone={deadlineTone(tender.daysRemaining, tender.deadlinePassed)}>
          {tender.deadlinePassed ? 'Closed' : deadlineLabel(tender.submissionDeadline, tender.daysRemaining)}
        </Badge>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{tender.title}</h1>
      <p className="mt-1 mb-8 text-sm text-muted">
        Complete both envelopes and the submission checklist, then seal and submit.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <BidEditor tender={tender} bid={null} consortiums={leadOf} />
        <div className="space-y-4">
          <AskClarification tenderId={tender.id} />
        </div>
      </div>
    </div>
  );
}
