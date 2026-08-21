import { Mandate } from '@prisma/client';

function centsToMajor(cents: bigint | null): number | null {
  return cents === null ? null : Number(cents) / 100;
}

/** Mandates are private to their owner; serialization just normalizes money. */
export function serializeMandate(m: Mandate) {
  return {
    id: m.id,
    title: m.title,
    ownerId: m.ownerId,
    sectors: m.sectors,
    countryCodes: m.countryCodes,
    projectTypes: m.projectTypes,
    structures: m.structures,
    ownerCategories: m.ownerCategories,
    currency: m.currency,
    minInvestment: centsToMajor(m.minInvestmentCents),
    maxInvestment: centsToMajor(m.maxInvestmentCents),
    targetIrr: m.targetIrr,
    riskAppetite: m.riskAppetite,
    active: m.active,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export type SerializedMandate = ReturnType<typeof serializeMandate>;
