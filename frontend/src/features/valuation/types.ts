export type ValuationMethod = 'residual' | 'comparable' | 'income' | 'dcf';

export interface ValuationOutputs {
  method: ValuationMethod;
  value: number;
  low: number | null;
  high: number | null;
  perSqm: number | null;
  breakdown: Record<string, number>;
}

export interface Explanation {
  text: string;
  method: 'template' | 'llm';
  confidence: 'deterministic' | 'estimated';
  provider: string;
}

export interface ValuationResult {
  method: ValuationMethod;
  formulaVersion: string;
  outputs: ValuationOutputs;
  explanation: Explanation;
}
