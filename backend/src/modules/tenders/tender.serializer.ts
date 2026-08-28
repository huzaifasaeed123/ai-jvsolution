import { TenderDetail } from './tenders.repository';

function centsToMajor(cents: bigint | null): number | null {
  return cents === null ? null : Number(cents) / 100;
}

/**
 * Tender view. Everything published here is deliberately PUBLIC to bidders —
 * transparency is the point of a tender notice. Only draft tenders are
 * restricted, and that is enforced in the service, not by hiding fields.
 */
export function serializeTender(t: TenderDetail, viewerId?: string) {
  const now = Date.now();
  const deadline = t.submissionDeadline?.getTime() ?? null;
  return {
    id: t.id,
    reference: t.reference,
    title: t.title,
    procurementType: t.procurementType,
    stage: t.stage,
    opportunity: t.opportunity,
    authority: { id: t.authority.id, name: t.authority.fullName },
    isAuthority: viewerId === t.authorityId,

    employerRequirements: t.employerRequirements,
    outputSpecification: t.outputSpecification,
    siteInformation: t.siteInformation,
    governmentSupport: t.governmentSupport,
    paymentMechanism: t.paymentMechanism,
    riskAllocation: t.riskAllocation ?? [],
    evaluationCriteria: t.evaluationCriteria ?? [],

    currency: t.currency,
    estimatedValue: centsToMajor(t.estimatedValueCents),
    bidSecurity: centsToMajor(t.bidSecurityCents),
    concessionYears: t.concessionYears,

    clarificationDeadline: t.clarificationDeadline,
    submissionDeadline: t.submissionDeadline,
    publishedAt: t.publishedAt,

    // Derived helpers for the UI
    isOpenForBids: t.stage === 'PUBLISHED' || t.stage === 'CLARIFICATION',
    deadlinePassed: deadline !== null && deadline < now,
    daysRemaining:
      deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 86_400_000)),

    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export type SerializedTender = ReturnType<typeof serializeTender>;
