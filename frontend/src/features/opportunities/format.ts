import type { RefItem } from './types';

/** Build a code -> label lookup from a reference list. */
export function toLabelMap(items: RefItem[]): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.code, i.label]));
}

/** Compact money formatting, e.g. $85.0M, $40.0M, $1.2B. */
export function formatMoney(amount: number | null, currency = 'USD'): string {
  if (amount === null || amount === undefined) return '—';
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(value: number | null, suffix = ''): string {
  if (value === null || value === undefined) return '—';
  return `${value.toLocaleString()}${suffix}`;
}

export const OWNER_CATEGORY_LABEL: Record<string, string> = {
  PRIVATE: 'Private',
  SEMI_GOVERNMENT: 'Semi-government',
  GOVERNMENT: 'Government',
};

export const VERIFICATION_LABEL: Record<string, string> = {
  T0: 'Tier 0 · Draft',
  T1: 'Tier 1 · Declared',
  T2: 'Tier 2 · Documents reviewed',
  T3: 'Tier 3 · Authority verified',
  T4: 'Tier 4 · Due diligence verified',
  T5: 'Tier 5 · Registry linked',
};
