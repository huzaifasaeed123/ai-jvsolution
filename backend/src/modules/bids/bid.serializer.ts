import { BidDetail } from './bids.repository';

function centsToMajor(cents: bigint | null): number | null {
  return cents === null ? null : Number(cents) / 100;
}

/** Envelope contents are only ever added by toUnsealed(). */
function envelope(b: BidDetail) {
  return {
    technicalProposal: b.technicalProposal,
    methodology: b.methodology,
    deliveryMonths: b.deliveryMonths,
    experienceYears: b.experienceYears,
    keyPersonnel: b.keyPersonnel,
    localContentPct: b.localContentPct,
    currency: b.currency,
    bidPrice: centsToMajor(b.bidPriceCents),
    annualPayment: centsToMajor(b.annualPaymentCents),
    revenueSharePct: b.revenueSharePct,
    financialCapacity: centsToMajor(b.financialCapacityCents),
    declarations: b.declarations,
  };
}

/**
 * Sealed view (spec §13). Before the submission deadline the authority may see
 * only that a bid EXISTS and whether it is compliant — never its contents.
 * Whitelisting (not blacklisting) means new envelope fields can't leak by accident.
 */
function sealedView(b: BidDetail) {
  return {
    id: b.id,
    reference: b.reference,
    tenderId: b.tenderId,
    status: b.status,
    bidder: b.bidder,
    consortium: b.consortium,
    bidSecurityProvided: b.bidSecurityProvided,
    checklistComplete: b.checklistComplete,
    submittedAt: b.submittedAt,
    withdrawnAt: b.withdrawnAt,
    disqualifiedReason: b.disqualifiedReason,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    sealed: true as const,
  };
}

export const BidSerializer = {
  /** What the authority sees before the deadline. */
  toSealed(b: BidDetail) {
    return sealedView(b);
  },

  /** Full contents — the bidder's own view, or the authority's after the deadline. */
  toUnsealed(b: BidDetail) {
    return { ...sealedView(b), ...envelope(b), sealed: false as const };
  },
};

export type SealedBid = ReturnType<typeof BidSerializer.toSealed>;
export type UnsealedBid = ReturnType<typeof BidSerializer.toUnsealed>;
