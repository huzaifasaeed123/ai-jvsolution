import { RecommenderStudio } from '@/features/recommender/components/RecommenderStudio';

export const metadata = { title: 'AI Structure Recommender' };

export default function RecommenderPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">AI Structure Recommender</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted">
        Describe the opportunity and get a ranked, explainable recommendation across JV, PPP and
        concession structures. Guidance only — confirm with legal and financial advisors.
      </p>
      <RecommenderStudio />
    </div>
  );
}
