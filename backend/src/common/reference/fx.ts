/**
 * Indicative FX reference for cross-currency aggregation.
 *
 * Opportunities are listed in local currency. Any figure that adds several
 * listings together therefore has to normalise first — summing raw minor units
 * across currencies would count PKR 1 as USD 1 and wildly overstate the total.
 *
 * These are STATIC, INDICATIVE rates, deliberately not a live FX feed:
 * - the platform's engines are deterministic by design (no external calls, no
 *   per-request cost, reproducible results);
 * - a headline "total value listed" needs stability more than precision — it
 *   should not move because a rate ticked;
 * - anything transactional must use the deal's own currency, never this table.
 *
 * Bump RATES_VERSION whenever a rate changes, so any stored figure derived from
 * it can be traced back to the table that produced it (spec §42 provenance).
 */

export const RATES_VERSION = 'fx-indicative-2026.1';

/** Units of the listed currency per 1 USD. */
const PER_USD: Record<string, number> = {
  USD: 1,
  AED: 3.67,
  SAR: 3.75,
  EGP: 48.5,
  GBP: 0.79,
  EUR: 0.92,
  INR: 83.5,
  PKR: 278,
  CNY: 7.25,
};

/** The currency every normalised aggregate is expressed in. */
export const BASE_CURRENCY = 'USD';

/**
 * Convert a major-unit amount to USD. Unknown currencies return null rather
 * than silently assuming parity — a wrong number is worse than a missing one.
 */
export function toUsd(amount: number, currency: string): number | null {
  const rate = PER_USD[currency?.toUpperCase()];
  if (!rate) return null;
  return amount / rate;
}

/** True when a currency can be normalised. */
export function isSupportedCurrency(currency: string): boolean {
  return Boolean(PER_USD[currency?.toUpperCase()]);
}

export const SUPPORTED_CURRENCIES = Object.keys(PER_USD);
