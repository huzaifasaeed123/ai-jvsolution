'use client';

import { useRouter } from 'next/navigation';
import { authApi } from './api';

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await authApi.logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}
