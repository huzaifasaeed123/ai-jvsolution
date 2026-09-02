'use client';

import { useEffect, useState, useCallback } from 'react';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, directionOf, type Locale } from './config';
import { getMessages, type MessageKey } from './messages';

/** Read the locale cookie client-side. Used only where a server translator is unreachable. */
function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Translator for Client Components — error boundaries, forms and anything that
 * calls a server action, none of which can read the locale cookie server-side.
 *
 * Reads document.cookie on mount rather than props, because the two places this
 * matters most — error.tsx and global-error.tsx — are rendered directly by Next
 * without the app's own layout in the tree, so there is no server parent to pass
 * a locale down from. The English render on the very first paint is intentional:
 * it avoids a hydration mismatch, and corrects itself an instant later once the
 * cookie is read.
 */
export function useTranslator() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(readLocaleCookie());
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      interpolate(getMessages(locale)[key], vars),
    [locale],
  );

  return Object.assign(t, { locale, dir: directionOf(locale) });
}
