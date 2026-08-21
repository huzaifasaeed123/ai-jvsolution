import { getOpportunityReference } from '@/features/opportunities/api';
import { CreateMandateForm } from '@/features/mandates/components/CreateMandateForm';

export const metadata = { title: 'New mandate' };

export default async function NewMandatePage() {
  const reference = await getOpportunityReference();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Define a mandate</h1>
      <p className="mt-1 mb-8 text-sm text-foreground/60">
        Tell us your criteria once. Matched, underwriting-ready opportunities come to you.
      </p>
      <CreateMandateForm reference={reference} />
    </div>
  );
}
