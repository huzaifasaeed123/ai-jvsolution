/**
 * Reference data for opportunities (spec §3 sectors, §5 structure library, §31 filters).
 * These are VALIDATED STRING CODES, not DB enums — adding a new sector/structure
 * later is a one-line change here, no migration. The frontend fetches these lists
 * from GET /reference/opportunities so dropdowns stay in sync.
 */

export interface RefItem {
  code: string;
  label: string;
}

/** Sectors — private, semi-government and government opportunity domains (spec §3). */
export const SECTORS: RefItem[] = [
  { code: 'private-land', label: 'Private land & projects' },
  { code: 'government-land', label: 'Government land' },
  { code: 'semi-government-asset', label: 'Semi-government land & assets' },
  { code: 'residential', label: 'Residential' },
  { code: 'commercial', label: 'Commercial' },
  { code: 'retail', label: 'Retail' },
  { code: 'office', label: 'Office' },
  { code: 'mixed-use', label: 'Mixed-use' },
  { code: 'hospitality', label: 'Hospitality & tourism' },
  { code: 'industrial-logistics', label: 'Logistics, industrial & free zones' },
  { code: 'healthcare', label: 'Healthcare & social infrastructure' },
  { code: 'education', label: 'Education' },
  { code: 'government-housing', label: 'Government housing & accommodation' },
  { code: 'airport', label: 'Airport concessions & development' },
  { code: 'seaport', label: 'Seaport & terminal concessions' },
  { code: 'roads-rail-metro', label: 'Roads, bridges, rail & metro' },
  { code: 'utilities-energy-water', label: 'Utilities, power, renewables, water & wastewater' },
  { code: 'smart-city-digital', label: 'Smart cities & digital infrastructure' },
  { code: 'data-centre', label: 'Data centres' },
  { code: 'parking-transport', label: 'Parking & transport concessions' },
  { code: 'waste-district-cooling', label: 'Waste management & district cooling' },
  { code: 'public-municipal', label: 'Public markets & municipal assets' },
  { code: 'tourism-culture-sports', label: 'Tourism, culture, sports & public facilities' },
];

/** Project types (spec §31). */
export const PROJECT_TYPES: RefItem[] = [
  { code: 'greenfield', label: 'Greenfield development' },
  { code: 'brownfield', label: 'Brownfield / redevelopment' },
  { code: 'infrastructure', label: 'Infrastructure' },
  { code: 'concession', label: 'Concession' },
  { code: 'ppp', label: 'Public-private partnership' },
  { code: 'asset-recycling', label: 'Asset recycling / monetisation' },
  { code: 'operation-maintenance', label: 'Operation & maintenance' },
];

/** Opportunity / procurement structure library (spec §5). */
export const STRUCTURES: RefItem[] = [
  { code: 'net-profit-jv', label: 'Net Profit JV' },
  { code: 'gross-revenue-jv', label: 'Gross Revenue JV' },
  { code: 'gfa-share-jv', label: 'GFA Share JV' },
  { code: 'nsa-share', label: 'NSA / NFA / Saleable Area Share' },
  { code: 'ready-stock-share', label: 'Ready Stock / Completed Unit Share' },
  { code: 'fixed-land-price', label: 'Fixed Land Price' },
  { code: 'deferred-land-price', label: 'Deferred Land Price' },
  { code: 'land-cost-multiple', label: 'Land Cost Multiple' },
  { code: 'hybrid-landowner-return', label: 'Hybrid Landowner Return' },
  { code: 'long-term-lease', label: 'Long-Term Lease' },
  { code: 'musataha', label: 'Musataha' },
  { code: 'bot', label: 'BOT (Build-Operate-Transfer)' },
  { code: 'boot', label: 'BOOT (Build-Own-Operate-Transfer)' },
  { code: 'boo', label: 'BOO (Build-Own-Operate)' },
  { code: 'bto', label: 'BTO (Build-Transfer-Operate)' },
  { code: 'design-build', label: 'Design-Build' },
  { code: 'design-build-finance', label: 'Design-Build-Finance' },
  { code: 'dbfo', label: 'DBFO' },
  { code: 'dbfom', label: 'DBFOM' },
  { code: 'dbom', label: 'DBOM' },
  { code: 'ppp', label: 'PPP' },
  { code: 'concession', label: 'Concession' },
  { code: 'availability-payment', label: 'Availability Payment' },
  { code: 'government-revenue-guarantee', label: 'Government Revenue Guarantee' },
  { code: 'rent-to-own', label: 'Rent-to-Own' },
  { code: 'lease-develop-operate', label: 'Lease-Develop-Operate' },
  { code: 'lease-develop-transfer', label: 'Lease-Develop-Transfer' },
  { code: 'rehabilitate-operate-transfer', label: 'Rehabilitate-Operate-Transfer' },
  { code: 'rehabilitate-own-operate', label: 'Rehabilitate-Own-Operate' },
  { code: 'operate-maintain', label: 'Operate & Maintain' },
  { code: 'management-contract', label: 'Management Contract' },
  { code: 'offtake-agreement', label: 'Offtake Agreement' },
  { code: 'asset-recycling', label: 'Asset Recycling' },
  { code: 'sale-leaseback', label: 'Sale & Leaseback' },
  { code: 'development-management', label: 'Development Management Agreement' },
  { code: 'cost-plus', label: 'Cost Plus' },
  { code: 'gmp', label: 'Guaranteed Maximum Price' },
  { code: 'turnkey', label: 'Turnkey' },
  { code: 'epc', label: 'EPC' },
  { code: 'epcf', label: 'EPCF' },
  { code: 'epcm', label: 'EPCM' },
  { code: 'unsolicited-proposal', label: 'Unsolicited Proposal' },
  { code: 'swiss-challenge', label: 'Swiss Challenge' },
  { code: 'jda', label: 'Joint Development Agreement' },
  { code: 'spv', label: 'SPV Structure' },
];

export const SECTOR_CODES = SECTORS.map((s) => s.code);
export const PROJECT_TYPE_CODES = PROJECT_TYPES.map((p) => p.code);
export const STRUCTURE_CODES = STRUCTURES.map((s) => s.code);

export const OWNER_CATEGORIES: RefItem[] = [
  { code: 'PRIVATE', label: 'Private' },
  { code: 'SEMI_GOVERNMENT', label: 'Semi-government' },
  { code: 'GOVERNMENT', label: 'Government' },
];

export const RISK_LEVELS: RefItem[] = [
  { code: 'LOW', label: 'Low' },
  { code: 'MODERATE', label: 'Moderate' },
  { code: 'MEDIUM', label: 'Medium' },
  { code: 'HIGH', label: 'High' },
];

export const PERMIT_STATUSES: RefItem[] = [
  { code: 'NONE', label: 'None' },
  { code: 'PRELIMINARY', label: 'Preliminary' },
  { code: 'IN_PROGRESS', label: 'In progress' },
  { code: 'APPROVED', label: 'Approved' },
];

export const DATA_ROOM_READINESS: RefItem[] = [
  { code: 'EMPTY', label: 'Empty' },
  { code: 'BASIC', label: 'Basic' },
  { code: 'PARTIAL', label: 'Partial' },
  { code: 'COMPLETE', label: 'Complete' },
];

export const VERIFICATION_TIERS: RefItem[] = [
  { code: 'T0', label: 'Draft / unverified' },
  { code: 'T1', label: 'Declared information' },
  { code: 'T2', label: 'Documents reviewed' },
  { code: 'T3', label: 'Ownership / authority verified' },
  { code: 'T4', label: 'Professional due diligence verified' },
  { code: 'T5', label: 'Registry / authority linked' },
];

export const OPPORTUNITY_REFERENCE = {
  sectors: SECTORS,
  projectTypes: PROJECT_TYPES,
  structures: STRUCTURES,
  ownerCategories: OWNER_CATEGORIES,
  riskLevels: RISK_LEVELS,
  permitStatuses: PERMIT_STATUSES,
  dataRoomReadiness: DATA_ROOM_READINESS,
  verificationTiers: VERIFICATION_TIERS,
};
