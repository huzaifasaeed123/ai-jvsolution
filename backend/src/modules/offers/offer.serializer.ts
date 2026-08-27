import { OfferWithSubmitter } from './offers.repository';

function centsToMajor(cents: bigint | null): number | null {
  return cents === null ? null : Number(cents) / 100;
}

/** Serialize an offer, converting money and exposing the submitter summary. */
export function serializeOffer(o: OfferWithSubmitter) {
  return {
    id: o.id,
    opportunityId: o.opportunityId,
    type: o.type,
    status: o.status,
    structure: o.structure,
    currency: o.currency,
    investmentAmount: centsToMajor(o.investmentAmountCents),
    ownerSharePct: o.ownerSharePct,
    targetIrr: o.targetIrr,
    developmentMonths: o.developmentMonths,
    experienceYears: o.experienceYears,
    financialCapacity: centsToMajor(o.financialCapacityCents),
    guarantees: o.guarantees,
    message: o.message,
    submittedBy: o.submittedBy,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export type SerializedOffer = ReturnType<typeof serializeOffer>;
