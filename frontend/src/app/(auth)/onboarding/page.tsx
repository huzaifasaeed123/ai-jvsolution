import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { RoleChooser } from './RoleChooser';

export const metadata = { title: 'Choose your role' };

/**
 * Only reachable by a signed-in account that has not chosen a role yet.
 * Anyone else is sent on — an established user must not be able to revisit
 * this page and quietly change their own role.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.roleConfirmed) redirect('/dashboard');

  return <RoleChooser initial={user.role} />;
}
