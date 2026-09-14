import 'server-only';
import { config } from '@/lib/config';

/**
 * Whether this deployment has Google credentials configured.
 *
 * Asked on the server so the button is simply absent when it cannot work,
 * rather than rendering and failing when pressed. Falls back to false on any
 * error for the same reason.
 */
export async function isGoogleEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${config.apiUrl}/auth/google/status`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const { enabled } = (await res.json()) as { enabled?: boolean };
    return enabled === true;
  } catch {
    return false;
  }
}
