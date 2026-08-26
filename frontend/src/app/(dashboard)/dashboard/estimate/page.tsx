import { getEstimateReference } from '@/features/estimate/api';
import { EstimateStudio } from '@/features/estimate/components/EstimateStudio';

export const metadata = { title: 'AI Estimate' };

export default async function EstimatePage() {
  const reference = await getEstimateReference();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">AI Estimate</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted">
        Benchmark construction and development cost by area and specification level, with an
        elemental breakdown and per-unit metrics. Deterministic estimates — confirm with a quantity
        surveyor.
      </p>
      <EstimateStudio reference={reference} />
    </div>
  );
}
