import type { Locale } from '../config';
import { en, type Messages, type MessageKey } from './en';
import { ar } from './ar';
import { ur } from './ur';
import { fr } from './fr';
import { es } from './es';
import { de } from './de';
import { zh } from './zh';

export type { Messages, MessageKey };

const CATALOGS: Record<Locale, Partial<Messages>> = { en, ar, ur, fr, es, de, zh };

/** Resolve a full catalog for a locale, English-filled for any missing key. */
export function getMessages(locale: Locale): Messages {
  return { ...en, ...(CATALOGS[locale] ?? {}) };
}

/** Coverage %, useful for tracking translation progress. */
export function coverage(locale: Locale): number {
  const total = Object.keys(en).length;
  const translated = Object.keys(CATALOGS[locale] ?? {}).length;
  return Math.round((translated / total) * 100);
}
