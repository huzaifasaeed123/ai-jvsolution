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
import { CoverImage, Gallery } from '@/components/ui/Media';
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
    <article className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb — where you are, and the way back */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/opportunities"
          className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          Opportunities
        </Link>
        <span aria-hidden className="text-muted/40">/</span>
        <span className="font-mono text-xs text-muted">{o.reference}</span>
      </nav>

      {/* Hero — banner is capped so the page opens on content, not a wall of image */}
      <div className="card mt-3 overflow-hidden">
        {o.coverImageUrl ? (
          <div className="relative">
            <CoverImage
              src={o.coverImageUrl}
              alt={o.title}
              seed={o.reference}
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              ratio="21 / 9"
              className="max-h-[300px]"
            />
            {/* Scrim keeps the overlaid text legible whatever the photo does */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                  {OWNER_CATEGORY_LABEL[o.ownerCategory]}
                </span>
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                  {VERIFICATION_LABEL[o.verification]}
                </span>
                {o.confidentialLocked && (
                  <span className="rounded-md bg-amber-400/25 px-2 py-0.5 text-[11px] font-medium text-amber-50 ring-1 ring-inset ring-amber-200/40 backdrop-blur-sm">
                    Confidential
                  </span>
                )}
              </div>
              <h1 className="mt-2 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                {o.title}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {sectorLabels[o.sector] ?? o.sector}
                {o.city ? ` · ${o.city}` : ''} · {o.region ? `${o.region} · ` : ''}
                {o.countryCode}
              </p>
            </div>
          </div>
        ) : (
          /* No photo — the same information, without pretending there is a banner */
          <div className="border-b border-border p-6 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{OWNER_CATEGORY_LABEL[o.ownerCategory]}</Badge>
              <Badge tone="primary">{VERIFICATION_LABEL[o.verification]}</Badge>
              {o.confidentialLocked && <Badge tone="warning">🔒 Confidential</Badge>}
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight">{o.title}</h1>
            <p className="mt-1 text-muted">
              {sectorLabels[o.sector] ?? o.sector}
              {o.city ? ` · ${o.city}` : ''} · {o.region ? `${o.region} · ` : ''}
              {o.countryCode}
            </p>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            {o.summary ? (
              <p className="max-w-2xl text-foreground/80">{o.summary}</p>
            ) : (
              <span />
            )}
            {(isOwner || !o.confidentialLocked) && (
              <Link
                href={`/opportunities/${o.id}/dashboard`}
                className="btn btn-primary shrink-0"
              >
                Investor dashboard
              </Link>
            )}
          </div>

          {/* Key figures at a glance */}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
            <Field label="GDV" value={formatMoney(o.projectValue, o.currency)} />
            <Field label="Investment" value={formatMoney(o.investmentRequired, o.currency)} />
            <Field label="Target IRR" value={o.targetIrr ? `${o.targetIrr}%` : '—'} />
            <Field label="Land area" value={formatNumber(o.landAreaSqm, ' m²')} />
          </div>

          <Gallery urls={o.galleryUrls ?? []} alt={o.title} />
        </div>
      </div>

      <div className="mt-6">
        <Tabs tabs={tabs} />
      </div>
    </article>
  );
}
