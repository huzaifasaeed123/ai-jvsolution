import { OpportunityWithOwner } from './opportunities.repository';

/**
 * Public-vs-confidential serialization (spec §24, §42).
 * PUBLIC view whitelists non-sensitive fields and hides exact location + owner
 * identity. FULL view (owner/admin, and — from Step 5 — access-granted users)
 * adds the confidential fields. Whitelisting (not blacklisting) prevents new
 * confidential fields from leaking by accident.
 */

function centsToMajor(cents: bigint | null): number | null {
  return cents === null ? null : Number(cents) / 100;
}

function publicView(o: OpportunityWithOwner) {
  return {
    id: o.id,
    reference: o.reference,
    title: o.title,
    summary: o.summary,
    sector: o.sector,
    projectType: o.projectType,
    ownerCategory: o.ownerCategory,
    status: o.status,
    verification: o.verification,

    // Marketing imagery — public by design (no site plans, no exact location)
    coverImageUrl: o.coverImageUrl,
    galleryUrls: o.galleryUrls,

    // Location — coarse only
    countryCode: o.countryCode,
    region: o.region,
    city: o.city,

    // Physical / planning
    landAreaSqm: o.landAreaSqm,
    gfaSqm: o.gfaSqm,
    buaSqm: o.buaSqm,
    nsaSqm: o.nsaSqm,
    plotRatio: o.plotRatio,
    landUse: o.landUse,
    heightLimit: o.heightLimit,

    // Commercial (indicative)
    currency: o.currency,
    projectValue: centsToMajor(o.projectValueCents),
    investmentRequired: centsToMajor(o.investmentRequiredCents),
    targetIrr: o.targetIrr,
    developmentPeriodMonths: o.developmentPeriodMonths,
    concessionPeriodYears: o.concessionPeriodYears,

    // Structure & risk
    structures: o.structures,
    riskLevel: o.riskLevel,
    permitStatus: o.permitStatus,
    dataRoomReadiness: o.dataRoomReadiness,

    // Requirements
    requiredDeveloperExperience: o.requiredDeveloperExperience,
    requiredContractorClass: o.requiredContractorClass,
    requiredOperatorType: o.requiredOperatorType,
    financingRequired: o.financingRequired,

    createdAt: o.createdAt,

    // Confidential fields are hidden until access is granted.
    confidentialLocked: true as const,
  };
}

export type PublicOpportunity = ReturnType<typeof publicView>;

export const OpportunitySerializer = {
  toPublic(o: OpportunityWithOwner) {
    return publicView(o);
  },

  /** Owner / admin / access-granted view: adds confidential fields + owner identity. */
  toFull(o: OpportunityWithOwner) {
    return {
      ...publicView(o),
      confidentialLocked: false as const,
      addressLine: o.addressLine,
      latitude: o.latitude,
      longitude: o.longitude,
      owner: o.owner,
      ownerId: o.ownerId,
      updatedAt: o.updatedAt,
      deletedAt: o.deletedAt,
    };
  },
};
