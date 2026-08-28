/**
 * i18n foundation (spec §38, §42 — internationalisation and RTL are foundational).
 * Locale is stored in a cookie and resolved on the server, so no route
 * restructuring is required. English is complete; other locales carry a partial
 * catalog and fall back to English for anything missing.
 */

export const LOCALES = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'ur', label: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'fr', label: 'French', native: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'de', label: 'German', native: 'Deutsch', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', native: '中文', dir: 'ltr' },
] as const;

export type Locale = (typeof LOCALES)[number]['code'];
export type Direction = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'jv_locale';

export function isLocale(value: string | undefined): value is Locale {
  return !!value && LOCALES.some((l) => l.code === value);
}

export function directionOf(locale: Locale): Direction {
  return (LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr') as Direction;
}
