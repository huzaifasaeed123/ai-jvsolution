import type { Role, User } from './types';

/**
 * Client-side auth calls. These hit the Next BFF routes (/api/auth/*), which
 * talk to the backend and manage httpOnly cookies. Components use these, never
 * the backend directly.
 */

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  }
  return data as T;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  country?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: (input: RegisterInput) => post<{ user: User }>('/api/auth/register', input),
  login: (input: LoginInput) => post<{ user: User }>('/api/auth/login', input),
  logout: () => post<{ ok: true }>('/api/auth/logout'),
};
