/** Reference data for the AI Estimate engine (spec §8). */
export interface SpecLevel {
  code: string;
  label: string;
  baseRatePerSqm: number; // indicative USD/m² building construction rate
}

/** Indicative build rates by quality/specification level (USD/m²). */
export const SPEC_LEVELS: SpecLevel[] = [
  { code: 'economy', label: 'Economy', baseRatePerSqm: 900 },
  { code: 'standard', label: 'Standard', baseRatePerSqm: 1400 },
  { code: 'premium', label: 'Premium', baseRatePerSqm: 2200 },
  { code: 'luxury', label: 'Luxury', baseRatePerSqm: 3500 },
  { code: 'ultra-luxury', label: 'Ultra-luxury', baseRatePerSqm: 5500 },
  { code: 'government', label: 'Government', baseRatePerSqm: 1600 },
  { code: 'institutional', label: 'Institutional', baseRatePerSqm: 1800 },
  { code: 'hospital', label: 'Hospital', baseRatePerSqm: 3000 },
  { code: 'education', label: 'Education', baseRatePerSqm: 1600 },
  { code: 'hotel', label: 'Hotel brand', baseRatePerSqm: 2800 },
  { code: 'green', label: 'Green building', baseRatePerSqm: 1700 },
  { code: 'net-zero', label: 'Net-zero', baseRatePerSqm: 2000 },
];

export const SPEC_LEVEL_CODES = SPEC_LEVELS.map((s) => s.code);

/** Units the total cost can be expressed against. */
export const UNIT_BASES = [
  { code: 'sqm', label: 'per m²' },
  { code: 'sqft', label: 'per ft²' },
  { code: 'unit', label: 'per unit' },
  { code: 'room', label: 'per room' },
  { code: 'key', label: 'per key' },
  { code: 'bed', label: 'per bed' },
  { code: 'student', label: 'per student' },
  { code: 'parking-bay', label: 'per parking bay' },
];

/** Elemental cost categories, as a share of building construction. Sum = 1.0. */
export const COST_ELEMENTS = [
  { code: 'substructure', label: 'Substructure', share: 0.1 },
  { code: 'superstructure', label: 'Superstructure', share: 0.28 },
  { code: 'facade', label: 'Façade', share: 0.16 },
  { code: 'mep', label: 'MEP', share: 0.26 },
  { code: 'fitout', label: 'Fit-out & interiors', share: 0.2 },
];

export const ESTIMATE_REFERENCE = {
  specLevels: SPEC_LEVELS,
  unitBases: UNIT_BASES,
  costElements: COST_ELEMENTS,
};
