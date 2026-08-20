import { config } from './config';

/**
 * Typed fetch wrapper — the single entry point for talking to the NestJS API.
 * Feature modules call this via their own `api.ts`; components never fetch directly.
 * Token handling/refresh is added in Step 2 (auth).
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Bearer token, when calling from server components with the user's session. */
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const url = `${config.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as Record<string, unknown>).message)
        : res.statusText) || 'Request failed';
    throw new ApiError(res.status, payload, message);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};
