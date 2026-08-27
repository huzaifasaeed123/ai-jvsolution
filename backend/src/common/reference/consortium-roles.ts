/** Consortium member roles (spec §15). */
export interface RefItem {
  code: string;
  label: string;
}

export const CONSORTIUM_ROLES: RefItem[] = [
  { code: 'lead-investor', label: 'Lead investor' },
  { code: 'developer', label: 'Developer' },
  { code: 'main-contractor', label: 'Main contractor' },
  { code: 'operator', label: 'Operator' },
  { code: 'financier', label: 'Financier' },
  { code: 'technical-partner', label: 'Technical partner' },
  { code: 'local-partner', label: 'Local partner' },
  { code: 'technology-partner', label: 'Technology partner' },
  { code: 'brand', label: 'Brand' },
  { code: 'consultant', label: 'Consultant' },
  { code: 'legal-advisor', label: 'Legal advisor' },
];

export const CONSORTIUM_ROLE_CODES = CONSORTIUM_ROLES.map((r) => r.code);

export const CONSORTIUM_REFERENCE = { roles: CONSORTIUM_ROLES };
