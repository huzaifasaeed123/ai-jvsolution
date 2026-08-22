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
      <p className="text-[11px] uppercase tracking-wide text-foreground/40">{label}</p>
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

  const sectorLabels = toLabelMap(reference.sectors);
  const structureLabels = toLabelMap(reference.structures);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/opportunities" className="text-sm text-foreground/50 hover:text-foreground">
        ← All opportunities
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-foreground/50">{o.reference}</span>
        <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[11px] font-medium">
          {OWNER_CATEGORY_LABEL[o.ownerCategory]}
        </span>
        <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[11px] font-medium">
          {VERIFICATION_LABEL[o.verification]}
        </span>
      </div>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{o.title}</h1>
      <p className="mt-1 text-foreground/60">
        {sectorLabels[o.sector] ?? o.sector}
        {o.city ? ` · ${o.city}` : ''} · {o.region ? `${o.region} · ` : ''}
        {o.countryCode}
      </p>
      {o.summary && <p className="mt-4 max-w-2xl text-foreground/80">{o.summary}</p>}

      {/* Opportunity Passport */}
      {passport && (
        <div className="mt-6">
          <VerificationPanel opportunityId={o.id} data={passport} reference={verifyReference} />
        </div>
      )}

      {/* Investment */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Investment</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="GDV" value={formatMoney(o.projectValue, o.currency)} />
          <Field label="Investment required" value={formatMoney(o.investmentRequired, o.currency)} />
          <Field label="Target IRR" value={o.targetIrr ? `${o.targetIrr}%` : '—'} />
          <Field label="Financing needed" value={o.financingRequired ? 'Yes' : 'No'} />
        </div>
      </section>

      {/* Physical */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Land & planning</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Land area" value={formatNumber(o.landAreaSqm, ' m²')} />
          <Field label="GFA" value={formatNumber(o.gfaSqm, ' m²')} />
          <Field label="Plot ratio" value={o.plotRatio ?? '—'} />
          <Field label="Land use" value={o.landUse} />
        </div>
      </section>

      {/* Structures */}
      {o.structures.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Applicable structures
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {o.structures.map((s) => (
              <span key={s} className="rounded-full border border-foreground/15 px-3 py-1 text-sm">
                {structureLabels[s] ?? s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Confidential zone */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Location & ownership
        </h2>
        {o.confidentialLocked ? (
          <AccessPanel opportunityId={o.id} request={myRequest} isLoggedIn={!!user} />
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Address" value={o.addressLine} />
            <Field label="Latitude" value={o.latitude} />
            <Field label="Longitude" value={o.longitude} />
            <Field label="Owner" value={o.owner?.fullName} />
            <Field label="Owner email" value={o.owner?.email} />
          </div>
        )}
      </section>

      {/* Data Room */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Data room</h2>
        <div className="mt-3">
          {dataRoom ? (
            <DataRoom opportunityId={o.id} data={dataRoom} />
          ) : (
            <p className="text-sm text-foreground/50">Data room unavailable.</p>
          )}
        </div>
      </section>

      {/* Due Diligence */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Due diligence</h2>
        <div className="mt-3">
          <DueDiligencePanel opportunityId={o.id} data={dueDiligence} reference={ddReference} />
        </div>
      </section>
    </article>
  );
}
