import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOpportunity, getOpportunityReference } from '@/features/opportunities/api';
import { getCurrentUser } from '@/lib/session';
import { getMyRequestFor } from '@/features/access/api';
import { AccessPanel } from '@/features/access/components/AccessPanel';
import { getDataRoom } from '@/features/dataroom/api';
import { DataRoom } from '@/features/dataroom/components/DataRoom';
import { getDueDiligence, getDueDiligenceReference } from '@/features/duediligence/api';
import { DueDiligencePanel } from '@/features/duediligence/components/DueDiligencePanel';
import { getVerification, getVerificationReference } from '@/features/verification/api';
import { VerificationPanel } from '@/features/verification/components/VerificationPanel';
import { listOffersForOpportunity, listMyOffers, getOfferComparison } from '@/features/offers/api';
import { OffersPanel } from '@/features/offers/components/OffersPanel';
import { OfferComparison } from '@/features/offers/components/OfferComparison';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import {
  formatMoney,
  formatNumber,
  toLabelMap,
  OWNER_CATEGORY_LABEL,
  VERIFICATION_LABEL,
} from '@/features/opportunities/format';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value ?? '—'}</p>
    </div>
  );
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [o, reference, user, dataRoom, dueDiligence, ddReference, passport, verifyReference] =
    await Promise.all([
      getOpportunity(id),
      getOpportunityReference(),
      getCurrentUser(),
      getDataRoom(id),
      getDueDiligence(id),
      getDueDiligenceReference(),
      getVerification(id),
      getVerificationReference(),
    ]);
  if (!o) notFound();

  // If confidential is still locked and the viewer isn't the owner, load their
  // access-request state to drive the request/NDA panel.
  const isOwner = !!user && !!o.owner && o.owner.id === user.id;
  const myRequest = o.confidentialLocked && user && !isOwner ? await getMyRequestFor(id) : null;

  // Offers: owner sees incoming; an access-granted developer/investor can submit.
  const canOffer =
    !!user && !isOwner && !o.confidentialLocked &&
    ['DEVELOPER', 'INVESTOR', 'ADMIN'].includes(user.role);
  const offers = isOwner ? await listOffersForOpportunity(id) : [];
  const myOffer = canOffer ? ((await listMyOffers()).find((of) => of.opportunityId === id) ?? null) : null;
  const showOffers = isOwner || canOffer;
  const comparison = isOwner && offers.length >= 2 ? await getOfferComparison(id) : null;

  const sectorLabels = toLabelMap(reference.sectors);
  const structureLabels = toLabelMap(reference.structures);

  const docCount = dataRoom?.documents.length ?? 0;
  const ddOpen = dueDiligence?.summary.open ?? 0;

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {passport && (
            <VerificationPanel opportunityId={o.id} data={passport} reference={verifyReference} />
          )}

          <div className="card p-5">
            <h3 className="text-sm font-semibold">Investment</h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="GDV" value={formatMoney(o.projectValue, o.currency)} />
              <Field label="Investment required" value={formatMoney(o.investmentRequired, o.currency)} />
              <Field label="Target IRR" value={o.targetIrr ? `${o.targetIrr}%` : '—'} />
              <Field label="Financing needed" value={o.financingRequired ? 'Yes' : 'No'} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold">Land &amp; planning</h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Land area" value={formatNumber(o.landAreaSqm, ' m²')} />
              <Field label="GFA" value={formatNumber(o.gfaSqm, ' m²')} />
              <Field label="Plot ratio" value={o.plotRatio ?? '—'} />
              <Field label="Land use" value={o.landUse} />
            </div>
          </div>

          {o.structures.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold">Applicable structures</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.structures.map((s) => (
                  <span key={s} className="rounded-full border border-border-strong px-3 py-1 text-sm">
                    {structureLabels[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location & ownership',
      content: o.confidentialLocked ? (
        <AccessPanel opportunityId={o.id} request={myRequest} isLoggedIn={!!user} />
      ) : (
        <div className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
          <Field label="Address" value={o.addressLine} />
          <Field label="Latitude" value={o.latitude} />
          <Field label="Longitude" value={o.longitude} />
          <Field label="Owner" value={o.owner?.fullName} />
          <Field label="Owner email" value={o.owner?.email} />
        </div>
      ),
    },
    {
      key: 'dataroom',
      label: 'Data room',
      badge: docCount || null,
      content: dataRoom ? (
        <DataRoom opportunityId={o.id} data={dataRoom} />
      ) : (
        <p className="text-sm text-muted">Data room unavailable.</p>
      ),
    },
    {
      key: 'dd',
      label: 'Due diligence',
      badge: ddOpen || null,
      content: <DueDiligencePanel opportunityId={o.id} data={dueDiligence} reference={ddReference} />,
    },
    ...(showOffers
      ? [
          {
            key: 'offers',
            label: isOwner ? 'Offers' : 'Your offer',
            badge: isOwner ? offers.length || null : null,
            content: (
              <div className="space-y-4">
                <OffersPanel
                  opportunityId={o.id}
                  isOwner={isOwner}
                  canOffer={canOffer}
                  offers={offers}
                  myOffer={myOffer}
                  structures={reference.structures}
                />
                {comparison && <OfferComparison opportunityId={o.id} initial={comparison} />}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/opportunities" className="text-sm text-muted hover:text-foreground">
        ← All opportunities
      </Link>

      {/* Hero */}
      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted">{o.reference}</span>
              <Badge tone="neutral">{OWNER_CATEGORY_LABEL[o.ownerCategory]}</Badge>
              <Badge tone="primary">{VERIFICATION_LABEL[o.verification]}</Badge>
              {o.confidentialLocked && <Badge tone="warning">🔒 Confidential</Badge>}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{o.title}</h1>
            <p className="mt-1 text-muted">
              {sectorLabels[o.sector] ?? o.sector}
              {o.city ? ` · ${o.city}` : ''} · {o.region ? `${o.region} · ` : ''}
              {o.countryCode}
            </p>
          </div>

          {(isOwner || !o.confidentialLocked) && (
            <Link href={`/opportunities/${o.id}/dashboard`} className="btn btn-primary shrink-0">
              📊 Investor dashboard
            </Link>
          )}
        </div>

        {o.summary && <p className="mt-4 max-w-3xl text-foreground/80">{o.summary}</p>}

        {/* Key figures at a glance */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <Field label="GDV" value={formatMoney(o.projectValue, o.currency)} />
          <Field label="Investment" value={formatMoney(o.investmentRequired, o.currency)} />
          <Field label="Target IRR" value={o.targetIrr ? `${o.targetIrr}%` : '—'} />
          <Field label="Land area" value={formatNumber(o.landAreaSqm, ' m²')} />
        </div>
      </div>

      <div className="mt-6">
        <Tabs tabs={tabs} />
      </div>
    </article>
  );
}
