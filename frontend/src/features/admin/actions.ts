'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Role, AccessLevel } from '@/features/auth/types';

/**
 * Write actions for the back-office.
 *
 * Each surfaces the API's own message on failure rather than a generic one —
 * the guardrails ("this is the last active administrator") are the useful part,
 * and swallowing them would leave the operator guessing.
 */
async function send(path: string, method: 'POST' | 'PATCH', body?: unknown) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const m = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(m) ? m.join(', ') : (m ?? 'Request failed'));
  }
  return data;
}

function refreshUsers(id?: string) {
  revalidatePath('/dashboard/admin/users');
  if (id) revalidatePath(`/dashboard/admin/users/${id}`);
  revalidatePath('/dashboard/admin');
}

export async function setUserRole(id: string, role: Role) {
  const r = await send(`/admin/users/${id}/role`, 'PATCH', { role });
  refreshUsers(id);
  return r;
}

export async function setUserAccessLevel(id: string, accessLevel: AccessLevel) {
  const r = await send(`/admin/users/${id}/access-level`, 'PATCH', { accessLevel });
  refreshUsers(id);
  return r;
}

export async function suspendUser(id: string, reason: string) {
  const r = await send(`/admin/users/${id}/suspend`, 'POST', { reason });
  refreshUsers(id);
  return r;
}

export async function reinstateUser(id: string) {
  const r = await send(`/admin/users/${id}/reinstate`, 'POST');
  refreshUsers(id);
  return r;
}

export async function signOutUser(id: string) {
  const r = await send(`/admin/users/${id}/sign-out`, 'POST');
  refreshUsers(id);
  return r;
}

export async function deleteUser(id: string, reason: string) {
  const r = await send(`/admin/users/${id}/delete`, 'POST', { reason });
  refreshUsers(id);
  return r;
}

function refreshContent() {
  revalidatePath('/dashboard/admin/opportunities');
  revalidatePath('/dashboard/admin/verification');
  revalidatePath('/dashboard/admin');
}

export async function unpublishOpportunity(id: string, reason: string) {
  const r = await send(`/admin/opportunities/${id}/unpublish`, 'POST', { reason });
  refreshContent();
  return r;
}

export async function archiveOpportunity(id: string, reason: string) {
  const r = await send(`/admin/opportunities/${id}/archive`, 'POST', { reason });
  refreshContent();
  return r;
}

export async function restoreOpportunity(id: string) {
  const r = await send(`/admin/opportunities/${id}/restore`, 'POST');
  refreshContent();
  return r;
}
