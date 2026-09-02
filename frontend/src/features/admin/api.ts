import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import { apiReadResult } from '@/lib/api-client';
import type {
  AdminOverview,
  AdminUser,
  AdminOpportunity,
  AdminTender,
  AuditEntry,
  AdminAccessRequest,
  QueueItem,
  Growth,
  Paged,
} from './types';

/**
 * Server-side reads for the back-office. Every one requires an admin token —
 * the API answers 403 otherwise, and these fall back to an empty result rather
 * than throwing, so one failing panel cannot take down the whole console.
 */
async function get<T>(path: string, fallback: T): Promise<T> {
  const token = await getAccessToken();
  if (!token) return fallback;
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return fallback;
  const text = await res.text();
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') s.set(k, String(v));
  }
  const out = s.toString();
  return out ? `?${out}` : '';
}

const EMPTY = <T,>(): Paged<T> => ({ items: [], total: 0, page: 1, pages: 1 });

export function getOverview() {
  return get<AdminOverview | null>('/admin/overview', null);
}

export function getGrowth() {
  return get<Growth | null>('/admin/metrics/growth', null);
}

export function listUsers(params: Record<string, string | undefined>) {
  return get<Paged<AdminUser>>(`/admin/users${qs(params)}`, EMPTY<AdminUser>());
}

/**
 * As listUsers, but says whether the read worked. An operator shown "no
 * accounts" during an outage would reasonably conclude the directory had been
 * wiped, so this distinction matters more here than almost anywhere.
 */
export async function listUsersResult(params: Record<string, string | undefined>) {
  return apiReadResult<Paged<AdminUser>>(
    `/admin/users${qs(params)}`,
    EMPTY<AdminUser>(),
    { auth: true },
  );
}

export function getUser(id: string) {
  return get<AdminUser | null>(`/admin/users/${id}`, null);
}

export function listAdminOpportunities(params: Record<string, string | undefined>) {
  return get<Paged<AdminOpportunity>>(
    `/admin/opportunities${qs(params)}`,
    EMPTY<AdminOpportunity>(),
  );
}

export function getVerificationQueue() {
  return get<{ total: number; items: QueueItem[] }>('/admin/verification-queue', {
    total: 0,
    items: [],
  });
}

export function listAdminTenders(params: Record<string, string | undefined>) {
  return get<Paged<AdminTender>>(`/admin/tenders${qs(params)}`, EMPTY<AdminTender>());
}

export function listAudit(params: Record<string, string | undefined>) {
  return get<Paged<AuditEntry>>(`/admin/audit${qs(params)}`, EMPTY<AuditEntry>());
}

export function listAuditActions() {
  return get<{ action: string; count: number }[]>('/admin/audit/actions', []);
}

export function listAccessRequests(params: Record<string, string | undefined>) {
  return get<Paged<AdminAccessRequest>>(
    `/admin/access-requests${qs(params)}`,
    EMPTY<AdminAccessRequest>(),
  );
}
