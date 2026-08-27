import { notFound } from 'next/navigation';
import { getConsortium, getConsortiumRoles } from '@/features/consortiums/api';
import { ConsortiumDetail } from '@/features/consortiums/components/ConsortiumDetail';

export const metadata = { title: 'Consortium' };

export default async function ConsortiumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [consortium, roles] = await Promise.all([getConsortium(id), getConsortiumRoles()]);
  if (!consortium) notFound();
  return <ConsortiumDetail consortium={consortium} roles={roles} />;
}
