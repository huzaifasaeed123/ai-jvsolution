import { ValuationStudio } from '@/features/valuation/components/ValuationStudio';

export const metadata = { title: 'AI Valuation' };

export default function ValuationPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">AI Valuation</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted">
        Value land or an asset four ways — residual land value, comparable sales, income
        capitalisation, and DCF. Deterministic estimates from your inputs; confirm with a
        registered valuer.
      </p>
      <ValuationStudio />
    </div>
  );
}
