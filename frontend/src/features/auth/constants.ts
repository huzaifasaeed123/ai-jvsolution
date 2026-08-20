import type { Role } from './types';

export const ROLE_OPTIONS: { value: Role; label: string; blurb: string }[] = [
  { value: 'OWNER', label: 'Landowner', blurb: 'I own land or an asset and want the right partner.' },
  { value: 'DEVELOPER', label: 'Developer', blurb: 'I develop projects and look for opportunities.' },
  { value: 'INVESTOR', label: 'Investor', blurb: 'I fund projects and joint ventures.' },
  { value: 'GOVERNMENT', label: 'Government entity', blurb: 'We publish public / PPP opportunities.' },
];

// Initial country pack (extended in Phase 1, Step 6 with full intelligence pages).
export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'CN', name: 'China' },
  { code: 'US', name: 'United States' },
];
