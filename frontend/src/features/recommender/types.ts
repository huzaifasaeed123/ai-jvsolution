export type OwnerType = 'PRIVATE' | 'SEMI_GOVERNMENT' | 'GOVERNMENT';
export type Level = 'low' | 'medium' | 'high';

export interface RecommenderInputs {
  ownerType: OwnerType;
  landOwnershipRetained?: boolean;
  financingRequired?: boolean;
  userPay?: boolean;
  governmentPay?: boolean;
  transferRequired?: boolean;
  revenueCertainty?: Level;
  riskAppetite?: Level;
  concessionTermYears?: number;
}

export interface StructureScore {
  code: string;
  label: string;
  category: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  reasons: string[];
}

export interface Explanation {
  text: string;
  method: 'template' | 'llm';
  confidence: 'deterministic' | 'estimated';
  provider: string;
}

export interface RecommendationResult {
  version: string;
  recommended: StructureScore | null;
  alternatives: StructureScore[];
  ranked: StructureScore[];
  explanation: Explanation;
}
