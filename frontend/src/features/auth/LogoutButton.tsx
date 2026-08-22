'use client';

import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { IconLogout } from '@/components/ui/icons';

export function LogoutButton({ full = false }: { full?: boolean }) {
  const router = useRouter();

  async function onLogout() {
    await authApi.logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      className={`btn btn-outline ${full ? 'w-full' : ''}`}
    >
      <IconLogout width={16} height={16} />
      Sign out
    </button>
  );
}
