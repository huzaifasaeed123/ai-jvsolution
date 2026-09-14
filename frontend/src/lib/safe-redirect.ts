/**
 * Validate a post-login destination.
 *
 * The rule is that a redirect target must be a path on this site and nothing
 * else. A full URL taken from a query parameter is an open redirect: a crafted
 * link signs someone in and then sends them, freshly authenticated, to an
 * attacker's page — which is a convincing place to ask for a password.
 *
 * Rejected: absolute URLs, protocol-relative `//host` (a browser treats that
 * as another origin), backslash variants that some parsers normalise to `/`,
 * and anything not starting with a single `/`.
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;

  // Percent-encoding is a common way to smuggle `//` or `\` past a naive check.
  let candidate = value;
  try {
    candidate = decodeURIComponent(value);
  } catch {
    return null;
  }

  if (!candidate.startsWith('/')) return null;
  if (candidate.startsWith('//')) return null;
  if (candidate.startsWith('/\\')) return null;
  if (candidate.includes('\\')) return null;
  // A scheme anywhere in the string means it is not a plain path.
  if (/^\/+[a-z][a-z0-9+.-]*:/i.test(candidate)) return null;

  return candidate;
}
