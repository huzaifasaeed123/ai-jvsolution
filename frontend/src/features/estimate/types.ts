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

export interface Explanation {
  text: string;
  method: 'template' | 'llm';
  confidence: 'deterministic' | 'estimated';
  provider: string;
}

export interface EstimateResult {
  formulaVersion: string;
  outputs: EstimateOutputs;
  explanation: Explanation;
}

export interface RefItem {
  code: string;
  label: string;
}

export interface EstimateReference {
  specLevels: (RefItem & { baseRatePerSqm: number })[];
  unitBases: RefItem[];
  costElements: { code: string; label: string; share: number }[];
}
