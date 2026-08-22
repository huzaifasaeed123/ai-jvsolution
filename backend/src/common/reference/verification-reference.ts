import { VERIFICATION_TIERS } from './opportunity-reference';

/** Fields that a reviewer can mark as verified on an Opportunity Passport (spec §23). */
export const VERIFIABLE_FIELDS = [
  { code: 'ownership', label: 'Ownership' },
  { code: 'title-deed', label: 'Title deed' },
  { code: 'exact-location', label: 'Exact location' },
  { code: 'land-area', label: 'Land area' },
  { code: 'planning-permits', label: 'Planning & permits' },
  { code: 'valuation', label: 'Valuation' },
  { code: 'financials', label: 'Financials' },
  { code: 'government-authority', label: 'Government / authority' },
  { code: 'registry-link', label: 'Registry link' },
];

export const VERIFIABLE_FIELD_CODES = VERIFIABLE_FIELDS.map((f) => f.code);

export const VERIFICATION_REFERENCE = {
  tiers: VERIFICATION_TIERS,
  verifiableFields: VERIFIABLE_FIELDS,
};
