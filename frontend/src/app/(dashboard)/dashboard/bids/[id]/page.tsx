import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBid } from '@/features/bids/api';
import { getTender } from '@/features/tenders/api';
import { listMyConsortiums } from '@/features/consortiums/api';
import { BidEditor } from '@/features/bids/components/BidEditor';
import { AskClarification } from '@/features/bids/components/AskClarification';
import { Badge } from '@/components/ui/Badge';
import { STAGE_LABEL, STAGE_TONE } from '@/features/tenders/format';

export const metadata = { title: 'Bid' };

export default async function BidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bid = await getBid(id);
  if (!bid) notFound();

  const [tender, consortiums] = await Promise.all([getTender(bid.tenderId), listMyConsortiums()]);
  if (!tender) notFound();

  const leadOf = consortiums
    .filter((c) => c.isLead && c.status !== 'DISBANDED')
    .map((c) => ({ id: c.id, name: c.name, isLead: true }));

  return (
    <div>
      <Link href="/dashboard/bids" className="text-sm text-muted hover:text-foreground">
        ← My bids
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">{tender.reference}</span>
        <Badge tone={STAGE_TONE[tender.stage]}>{STAGE_LABEL[tender.stage]}</Badge>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{tender.title}</h1>
      <Link
        href={`/tenders/${tender.id}`}
        className="mt-1 mb-8 inline-block text-sm text-primary hover:underline"
      >
        View the full tender notice →
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <BidEditor tender={tender} bid={bid} consortiums={leadOf} />
        <div className="space-y-4">
          {!tender.deadlinePassed && <AskClarification tenderId={tender.id} />}
        </div>
      </div>
    </div>
  );
}
