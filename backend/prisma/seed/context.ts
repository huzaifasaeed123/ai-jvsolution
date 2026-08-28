/**
 * Shared seed context.
 *
 * Lives in its own module so the step files and the orchestrator can both
 * import the client without importing each other.
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const argv = process.argv.slice(2);

export const flags = {
  reset: argv.includes('--reset'),
  force: argv.includes('--force'),
  only: (argv.find((a) => a.startsWith('--only=')) ?? '')
    .replace('--only=', '')
    .split(',')
    .filter(Boolean),
};

export function shouldRun(step: string): boolean {
  return flags.only.length === 0 || flags.only.includes(step);
}

/**
 * Fixed clock. Every relative date in the seed is derived from this instant, so
 * "closes in 12 days" stays 12 days whenever the seed is run, and a deadline
 * that is meant to have passed always has.
 */
export const NOW = new Date();

/** Days from NOW, as a Date. Negative values are in the past. */
export function days(n: number): Date {
  return new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);
}

/** Major currency units to the BigInt minor units the schema stores. */
export function money(major: number): bigint {
  return BigInt(Math.round(major * 100));
}
