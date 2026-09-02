import 'server-only';
import { config } from './config';
import { getAccessToken } from './session';

/**
 * The single server-side reader for the API.
 *
 * Why this exists: these helpers run inside React Server Components, where a
 * thrown error is not a local failure — it unwinds the whole route and the
 * visitor gets an error page instead of the site. A listings page should still
 * render its header and filters when the stats endpoint is briefly unavailable,
 * and a dashboard should not disappear because one panel timed out.
 *
 * So every read degrades to a caller-supplied fallback and never throws. Four
 * distinct failures were previously handled inconsistently across seventeen
 * feature modules, and each one has taken a page down at some point:
 *
 *   1. the network call itself throwing — DNS, TLS, connection refused;
 *   2. a non-2xx response;
 *   3. a 200 with an empty body, which res.json() rejects on;
 *   4. a 200 with a body that is not valid JSON.
 *
 * Writes are different and live in Server Actions: there a failure must reach
 * the person who pressed the button, so those still throw and the component
 * catches and displays the message.
 */

export interface ReadOptions {
  /** Attach the caller's bearer token. Reads that reveal more to the owner. */
  auth?: boolean;
  /** Seconds to cache. Omit for always-fresh (the default). */
  revalidate?: number;
  /** Escape hatch for callers that need a specific cache mode. */
  cache?: RequestCache;
  /** Milliseconds before the read is abandoned. */
  timeoutMs?: number;
}

/**
 * An API that hangs is worse than one that refuses: a refused connection fails
 * in milliseconds, while a hung one holds the render until something upstream
 * gives up, pinning a server worker the whole time. A few slow requests can
 * therefore take out a page that has nothing to do with them.
 */
const DEFAULT_TIMEOUT_MS = 10_000;

/** True when the failure is worth an operator's attention, rather than a 404. */
function isNoteworthy(status: number | null): boolean {
  return status === null || status >= 500;
}

/**
 * Next signals control flow by throwing: notFound(), redirect(), and the
 * dynamic-rendering marker all arrive as exceptions carrying a digest. They are
 * not failures and must reach the framework, so a blanket catch has to let them
 * back out — swallowing them silently breaks static/dynamic detection and turns
 * a notFound() into an empty page.
 */
function isFrameworkSignal(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const digest = (err as { digest?: unknown }).digest;
  if (typeof digest === 'string') {
    if (
      digest === 'DYNAMIC_SERVER_USAGE' ||
      digest === 'NEXT_NOT_FOUND' ||
      digest.startsWith('NEXT_REDIRECT')
    ) {
      return true;
    }
  }
  return (err as { name?: string }).name === 'DynamicServerError';
}

/**
 * GET `path`, or return `fallback` if anything at all goes wrong.
 *
 * The fallback is a required argument rather than an optional one so that every
 * call site has to decide what the page shows when the data is missing.
 */
export async function apiRead<T>(
  path: string,
  fallback: T,
  options: ReadOptions = {},
): Promise<T> {
  const { auth = false, revalidate, cache, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  let token: string | undefined;
  if (auth) {
    token = await getAccessToken();
    // An unauthenticated read is not an error — the caller's fallback already
    // describes what an anonymous visitor should see.
    if (!token) return fallback;
  }

  const init: RequestInit & { next?: { revalidate: number } } = {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(timeoutMs),
  };
  if (revalidate !== undefined) init.next = { revalidate };
  else init.cache = cache ?? 'no-store';

  let status: number | null = null;
  try {
    const res = await fetch(`${config.apiUrl}${path}`, init);
    status = res.status;
    if (!res.ok) {
      logFailure(path, status, res.statusText);
      return fallback;
    }

    // A 200 with no body is legitimate on some endpoints (a tender with no
    // Swiss Challenge, for instance). res.json() would reject on it.
    const text = await res.text();
    if (!text) return fallback;

    return JSON.parse(text) as T;
  } catch (err) {
    if (isFrameworkSignal(err)) throw err;
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    logFailure(
      path,
      status,
      timedOut ? `timed out after ${timeoutMs}ms` : err instanceof Error ? err.message : String(err),
    );
    return fallback;
  }
}

/**
 * Server logs are the only place these failures are visible, since the page
 * itself degrades silently by design. Without this a broken endpoint looks
 * identical to genuinely empty data.
 */
function logFailure(path: string, status: number | null, detail: string) {
  if (!isNoteworthy(status)) return;
  console.error(
    `[api] ${path} failed${status ? ` (${status})` : ' (no response)'}: ${detail}`,
  );
}
