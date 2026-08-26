/**
 * Deterministic construction/development cost estimate engine (spec §8). Pure
 * functions, no AI. Produces an elemental cost breakdown plus fees, contingency,
 * escalation and insurance, expressed per m² and (optionally) per unit.
 */
import { SPEC_LEVELS, COST_ELEMENTS } from '../../common/reference/estimate-reference';

export const ESTIMATE_FORMULA_VERSION = 'estimate-1.0.0';

export interface EstimateInputs {
  currency?: string;
  areaSqm: number; // GFA
  specLevel?: string; // maps to a base rate; default 'standard'
  baseRatePerSqm?: number; // overrides spec level when set
  externalWorksPct?: number; // of construction, default 8
  professionalFeesPct?: number; // default 10
  authorityFeesPct?: number; // default 3
  contingencyPct?: number; // default 8
  escalationPct?: number; // default 4
  insurancePct?: number; // default 1.5
  units?: number; // optional, for a per-unit metric
  unitBasis?: string; // label, e.g. 'unit' | 'room' | 'key'
}

export interface EstimateOutputs {
  currency: string;
  specLevel: string;
  rateUsed: number;
  areaSqm: number;
  construction: number;
  elements: { code: string; label: string; amount: number }[];
  externalWorks: number;
  baseBuild: number;
  professionalFees: number;
  authorityFees: number;
  contingency: number;
  escalation: number;
  insurance: number;
  totalDevelopmentCost: number;
  costPerSqm: number;
  costPerUnit: number | null;
  unitBasis: string | null;
}

export function computeEstimate(i: EstimateInputs): EstimateOutputs {
  const specCode = i.specLevel ?? 'standard';
  const spec = SPEC_LEVELS.find((s) => s.code === specCode) ?? SPEC_LEVELS[1];
  const rate = i.baseRatePerSqm ?? spec.baseRatePerSqm;

  const externalPct = i.externalWorksPct ?? 8;
  const feesPct = i.professionalFeesPct ?? 10;
  const authPct = i.authorityFeesPct ?? 3;
  const contPct = i.contingencyPct ?? 8;
  const escPct = i.escalationPct ?? 4;
  const insPct = i.insurancePct ?? 1.5;

  const construction = i.areaSqm * rate;
  const elements = COST_ELEMENTS.map((e) => ({
    code: e.code,
    label: e.label,
    amount: round(construction * e.share),
  }));
  const externalWorks = construction * (externalPct / 100);
  const baseBuild = construction + externalWorks;

  const professionalFees = baseBuild * (feesPct / 100);
  const authorityFees = baseBuild * (authPct / 100);
  const subtotal = baseBuild + professionalFees + authorityFees;
  const contingency = subtotal * (contPct / 100);
  const escalation = subtotal * (escPct / 100);
  const insurance = baseBuild * (insPct / 100);

  const totalDevelopmentCost =
    baseBuild + professionalFees + authorityFees + contingency + escalation + insurance;

  const costPerSqm = i.areaSqm > 0 ? totalDevelopmentCost / i.areaSqm : 0;
  const costPerUnit = i.units && i.units > 0 ? totalDevelopmentCost / i.units : null;

  return {
    currency: i.currency ?? 'USD',
    specLevel: specCode,
    rateUsed: round(rate),
    areaSqm: i.areaSqm,
    construction: round(construction),
    elements,
    externalWorks: round(externalWorks),
    baseBuild: round(baseBuild),
    professionalFees: round(professionalFees),
    authorityFees: round(authorityFees),
    contingency: round(contingency),
    escalation: round(escalation),
    insurance: round(insurance),
    totalDevelopmentCost: round(totalDevelopmentCost),
    costPerSqm: round(costPerSqm),
    costPerUnit: costPerUnit === null ? null : round(costPerUnit),
    unitBasis: i.units ? (i.unitBasis ?? 'unit') : null,
  };
}

function round(n: number): number {
  return Math.round(n);
}
