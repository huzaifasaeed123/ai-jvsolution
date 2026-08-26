import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeasibilityOutputs } from '../feasibility/feasibility.engine';

/**
 * LLM provider abstraction (spec §35). Today it produces deterministic,
 * template-based explanations — no external calls, no cost, data stays local.
 * When AI_PROVIDER is set (e.g. "anthropic" or "local"), this is the single
 * place to plug a real model in; the rest of the app depends only on this
 * interface. All outputs are tagged with method + confidence (spec §37).
 */
export interface Explanation {
  text: string;
  method: 'template' | 'llm';
  confidence: 'deterministic' | 'estimated';
  provider: string;
}

@Injectable()
export class ExplainerService {
  private readonly provider: string;

  constructor(private readonly config: ConfigService) {
    this.provider = this.config.get<string>('ai.provider', 'template');
  }

  explainFeasibility(o: FeasibilityOutputs): Explanation {
    // Provider switch point — only "template" is implemented for now.
    return { ...this.templateFeasibility(o), method: 'template', confidence: 'deterministic', provider: this.provider };
  }

  private templateFeasibility(o: FeasibilityOutputs): { text: string } {
    const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
    const money = (n: number) =>
      `${o.currency} ${Math.round(n).toLocaleString()}`;

    const verdict =
      o.viabilityScore >= 75
        ? 'strongly viable'
        : o.viabilityScore >= 50
          ? 'viable with an adequate margin'
          : o.viabilityScore >= 25
            ? 'marginal — sensitive to costs and pricing'
            : 'not viable on these assumptions';

    const headroom = o.breakEvenSalePricePerSqm
      ? `Break-even sale price is ${money(o.breakEvenSalePricePerSqm)}/m²; the deal absorbs price falls down to that level before losing money.`
      : '';

    const down = o.scenarios.find((s) => s.name === 'Downside');
    const downNote = down
      ? `In the downside case (−10% price, +10% cost, +6 months) profit-on-cost moves to ${pct(down.profitOnCost)}.`
      : '';

    const text = [
      `On these inputs the project looks ${verdict}.`,
      `Gross development value is ${money(o.gdv)} against a total project cost of ${money(o.totalProjectCost)}, giving a net profit of ${money(o.netProfit)} — a ${pct(o.profitOnCost)} margin on cost and an unlevered project IRR of ${pct(o.projectIrr)}.`,
      headroom,
      downNote,
      'These figures are model estimates from the stated assumptions, not investment advice — validate with local cost and sales evidence.',
    ]
      .filter(Boolean)
      .join(' ');

    return { text };
  }
}
