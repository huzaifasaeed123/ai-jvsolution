/**
 * Central runtime config, sourced from env vars. No hard-coded brand/URLs in code
 * (spec §39 — new-domain deploy changes env only). Import this instead of reading
 * process.env directly across the app.
 */
export const config = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? 'JV Solution',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
} as const;
