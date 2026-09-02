import 'server-only';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, directionOf, isLocale, type Locale } from './config';
import { getMessages, type MessageKey } from './messages';

/**
 * Resolves the active locale on the server: cookie first, then the browser's
 * Accept-Language header, then the default.
 */
export async function getLocale(): Promise<Locale> {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const accept = (await headers()).get('accept-language') ?? '';
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

/** Replace `{token}` placeholders — the only interpolation these catalogs need. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Translator for server components: `const t = await getTranslator()`.
 * `t('home.marketsAll', { count: 12 })` fills `{count}` in the string.
 */
export async function getTranslator() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const t = (key: MessageKey, vars?: Record<string, string | number>) =>
    interpolate(messages[key], vars);
  return Object.assign(t, { locale, dir: directionOf(locale), locales: LOCALES });
}
