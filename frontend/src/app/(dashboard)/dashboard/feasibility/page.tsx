import { FeasibilityStudio } from '@/features/feasibility/components/FeasibilityStudio';

export const metadata = { title: 'AI Feasibility Studio' };

export default function FeasibilityPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">AI Feasibility Studio</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted">
        Model a development: enter the scheme, get GDV, profit, IRR, NPV, break-even and downside
        scenarios instantly. Figures are deterministic estimates from your assumptions — validate
        with local evidence.
      </p>
      <FeasibilityStudio />
    </div>
  );
}
