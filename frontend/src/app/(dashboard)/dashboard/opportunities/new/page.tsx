import { getOpportunityReference } from '@/features/opportunities/api';
import { CreateOpportunityForm } from '@/features/opportunities/components/CreateOpportunityForm';

export const metadata = { title: 'New opportunity' };

export default async function NewOpportunityPage() {
  const reference = await getOpportunityReference();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">List a new opportunity</h1>
      <p className="mt-1 mb-8 text-sm text-foreground/60">
        A few guided steps. Sensitive details stay private until you approve access.
      </p>
      <CreateOpportunityForm reference={reference} />
    </div>
  );
}
