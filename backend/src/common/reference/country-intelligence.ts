/**
 * Country intelligence corpus (spec §2 "country intelligence pages").
 * ORIGINAL editorial content written for this platform — not copied from any
 * reference site. Figures are indicative planning ranges for orientation only,
 * carry a `dataAsOf` stamp, and are explicitly not advice (spec §37 governance).
 *
 * Stored as reference data (not DB rows) because it is read-only editorial that
 * ships with the app; the admin-managed statistics are separate and DB-driven.
 */

export interface CountryIntelligence {
  code: string;
  name: string;
  flag: string;
  region: string;
  currency: string;
  /** One-line positioning for the grid card. */
  tagline: string;
  /** Longer editorial overview. */
  overview: string;
  /** Indicative construction cost band, USD per m². */
  buildCostPerSqm: { low: number; high: number };
  /** Indicative mid-market sale price band, USD per m². */
  salePricePerSqm: { low: number; high: number };
  /** Typical owner share of value in a land JV (%). */
  ownerShareRange: { low: number; high: number };
  /** Structure codes commonly used in this market. */
  commonStructures: string[];
  /** Whether foreign entities can typically hold real property. */
  foreignOwnership: string;
  titleSystem: string;
  /** Key regulators / authorities. */
  authorities: string[];
  /** Practical considerations for structuring a venture here. */
  considerations: string[];
  dataAsOf: string;
}

const AS_OF = '2026-Q3';

export const COUNTRY_INTELLIGENCE: CountryIntelligence[] = [
  {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', currency: 'AED',
    tagline: 'Mature JV market with registrable development rights.',
    overview:
      'The UAE combines a deep developer base with structures purpose-built for land partnerships. Musataha grants a registrable right to build and own improvements on another party\'s land for a fixed term, which lets a landowner retain title while a developer finances and delivers. Escrow regulation on off-plan sales is well established, and freehold zones give foreign investors direct ownership in defined districts.',
    buildCostPerSqm: { low: 1400, high: 2100 },
    salePricePerSqm: { low: 3000, high: 5500 },
    ownerShareRange: { low: 20, high: 35 },
    commonStructures: ['musataha', 'gfa-share-jv', 'jda', 'long-term-lease', 'spv'],
    foreignOwnership: 'Full freehold for all nationalities within designated freehold zones; leasehold or usufruct elsewhere.',
    titleSystem: 'Government-guaranteed electronic registry with digital title deeds.',
    authorities: ['Land department / registry', 'Real-estate regulator', 'Municipality planning'],
    considerations: [
      'Musataha and long-lease terms are registrable and mortgageable — bankable for project finance.',
      'Off-plan sales proceeds typically flow through a regulated escrow account.',
      'Plot-level development rights are set on the affection plan; confirm before underwriting.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', currency: 'SAR',
    tagline: 'Giga-project pipeline and an expanding PPP framework.',
    overview:
      'Saudi Arabia is running one of the largest development programmes globally, with a maturing private-participation framework covering infrastructure and social assets. Land partnerships frequently use development agreements or Musataha-style rights, and government-linked entities are common counterparties, which raises the importance of clear approval pathways.',
    buildCostPerSqm: { low: 1100, high: 1900 },
    salePricePerSqm: { low: 1800, high: 4200 },
    ownerShareRange: { low: 20, high: 40 },
    commonStructures: ['musataha', 'jda', 'ppp', 'bot', 'spv'],
    foreignOwnership: 'Permitted with licensing; restrictions apply in specific holy-city jurisdictions.',
    titleSystem: 'National electronic deed registry.',
    authorities: ['Real-estate authority', 'Municipal affairs', 'PPP centre'],
    considerations: [
      'Public-sector counterparties bring formal procurement and approval sequencing.',
      'A white-land levy encourages activation of undeveloped urban plots.',
      'Local content requirements often feature in public tenders.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'North Africa', currency: 'EGP',
    tagline: 'Area-share development agreements are the market norm.',
    overview:
      'Egyptian land ventures are dominated by area-share and revenue-share development agreements, where the owner contributes land and receives a proportion of the finished product or gross sales. Currency movement and financing cost are the dominant underwriting variables, so indexation and staged milestones are common protections.',
    buildCostPerSqm: { low: 350, high: 750 },
    salePricePerSqm: { low: 700, high: 1800 },
    ownerShareRange: { low: 25, high: 45 },
    commonStructures: ['jda', 'gfa-share-jv', 'gross-revenue-jv', 'ready-stock-share'],
    foreignOwnership: 'Permitted with limits on quantity and land type; desert land has specific rules.',
    titleSystem: 'Registration system with notarised and registered deed routes.',
    authorities: ['New urban communities authority', 'Governorate planning', 'Survey authority'],
    considerations: [
      'Index owner entitlements where inflation risk is material.',
      'Confirm the registration route early — it affects financeability.',
      'Staged handover of owner units is a common protection.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', currency: 'GBP',
    tagline: 'Promotion and option agreements around a plan-led system.',
    overview:
      'The UK planning system is discretionary and plan-led, so much of the value uplift sits in securing consent. Land is frequently controlled through option or promotion agreements, where a promoter funds the planning process in exchange for a share of the uplift. Ground leases and joint ventures are standard for delivery.',
    buildCostPerSqm: { low: 2000, high: 3400 },
    salePricePerSqm: { low: 3500, high: 9000 },
    ownerShareRange: { low: 20, high: 40 },
    commonStructures: ['long-term-lease', 'spv', 'net-profit-jv', 'design-build'],
    foreignOwnership: 'No general restriction; overseas entities holding property must be registered.',
    titleSystem: 'State-guaranteed central land registry.',
    authorities: ['Local planning authority', 'Building control', 'Environment agency'],
    considerations: [
      'Planning risk dominates — structure payments around consent milestones.',
      'Affordable-housing and infrastructure contributions affect residual value.',
      'Long ground leases are a well-understood institutional product.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', currency: 'EUR',
    tagline: 'Heritable building rights enable long-term land partnerships.',
    overview:
      'Germany offers the Erbbaurecht — a registrable, inheritable, mortgageable right to own a building on another party\'s land, typically for decades. It allows institutional and municipal owners to retain land while enabling development against an indexed ground rent. Planning is municipality-led and procedurally rigorous.',
    buildCostPerSqm: { low: 2200, high: 3600 },
    salePricePerSqm: { low: 3800, high: 8500 },
    ownerShareRange: { low: 15, high: 30 },
    commonStructures: ['long-term-lease', 'spv', 'design-build', 'net-profit-jv'],
    foreignOwnership: 'No general restriction on foreign ownership.',
    titleSystem: 'Court-maintained land register with high evidentiary weight.',
    authorities: ['Municipal building authority', 'Land registry court', 'Regional planning'],
    considerations: [
      'Heritable building rights are financeable and long-dated — suited to patient capital.',
      'Ground rent is usually indexed; compensation at expiry is often mandated.',
      'Energy-efficiency standards materially affect build cost.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', currency: 'EUR',
    tagline: 'Payment-in-kind and forward-sale structures are established.',
    overview:
      'French practice includes paying a landowner partly or wholly in finished premises, and forward-sale mechanisms that let a developer contract institutional buyers before completion. Both reduce the developer\'s upfront land outlay and give the owner exposure to finished value.',
    buildCostPerSqm: { low: 1900, high: 3200 },
    salePricePerSqm: { low: 3200, high: 9500 },
    ownerShareRange: { low: 20, high: 40 },
    commonStructures: ['ready-stock-share', 'spv', 'long-term-lease', 'design-build'],
    foreignOwnership: 'No general restriction on foreign ownership.',
    titleSystem: 'Notary-driven conveyancing with a public property file.',
    authorities: ['Commune planning', 'Prefecture', 'Notary'],
    considerations: [
      'Payment-in-kind is taxed on both legs — model the tax carefully.',
      'Forward sales to institutions can de-risk the sales programme.',
      'Notarial process shapes the transaction timetable.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', currency: 'EUR',
    tagline: 'Land-for-units swaps remain the classic owner-friendly route.',
    overview:
      'The permuta — transferring land in exchange for finished units — is deeply embedded in Spanish practice and remains attractive to owners who want exposure to completed product rather than a fixed price. Regional planning variation is significant, so the applicable autonomous-community rules matter.',
    buildCostPerSqm: { low: 1100, high: 2000 },
    salePricePerSqm: { low: 2000, high: 6000 },
    ownerShareRange: { low: 25, high: 35 },
    commonStructures: ['ready-stock-share', 'jda', 'spv', 'design-build'],
    foreignOwnership: 'Open to foreign buyers; a foreigner tax identification number is required.',
    titleSystem: 'Property registry with strong protection for registered rights.',
    authorities: ['Municipal town planning', 'Autonomous community', 'Property registry'],
    considerations: [
      'Secure the owner\'s unit entitlement with a registered guarantee.',
      'Planning rules vary meaningfully by region.',
      'Both legs of a swap can trigger transfer taxation.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe', currency: 'EUR',
    tagline: 'Active urban regeneration with unit-swap precedent.',
    overview:
      'Portugal combines urban rehabilitation incentives with a straightforward registry. Owners often take finished units in exchange for contributing a building or plot, especially in regeneration zones where refurbishment carries lighter regulatory friction than new build.',
    buildCostPerSqm: { low: 900, high: 1800 },
    salePricePerSqm: { low: 1800, high: 5500 },
    ownerShareRange: { low: 25, high: 35 },
    commonStructures: ['ready-stock-share', 'jda', 'long-term-lease', 'spv'],
    foreignOwnership: 'Open to foreign ownership.',
    titleSystem: 'Land registry with notarial conveyancing.',
    authorities: ['Municipal council', 'Urban rehabilitation authority', 'Land registry'],
    considerations: [
      'Rehabilitation zones can carry incentives and lighter constraints.',
      'Confirm the licensing route before committing to a programme.',
      'Condominium structuring matters where units are split.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'IN', name: 'India', flag: '🇮🇳', region: 'South Asia', currency: 'INR',
    tagline: 'Joint development agreements dominate land partnerships.',
    overview:
      'The joint development agreement — owner grants development rights, developer builds at its own cost, and the finished area or revenue is split — is the default structure across major Indian cities. Regulatory registration of projects and escrow of buyer funds have significantly formalised the market.',
    buildCostPerSqm: { low: 400, high: 900 },
    salePricePerSqm: { low: 800, high: 3000 },
    ownerShareRange: { low: 30, high: 50 },
    commonStructures: ['jda', 'gfa-share-jv', 'gross-revenue-jv', 'spv'],
    foreignOwnership: 'Restricted for direct land holding; foreign capital typically enters via corporate structures.',
    titleSystem: 'State-level registration; title diligence is essential.',
    authorities: ['State real-estate regulator', 'Municipal corporation', 'Development authority'],
    considerations: [
      'Title diligence and chain-of-ownership review are critical.',
      'Development rights are usually granted via a registered agreement plus power of attorney.',
      'Project registration and buyer-fund escrow are regulated.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'PK', name: 'Pakistan', flag: '🇵🇰', region: 'South Asia', currency: 'PKR',
    tagline: 'Area-share ventures with a premium on title verification.',
    overview:
      'Land ventures typically follow an area-share or revenue-share model. Digitisation of land records has improved verification in several provinces, but title and approval diligence remain the decisive risk factors, and financing cost is a major underwriting variable.',
    buildCostPerSqm: { low: 250, high: 600 },
    salePricePerSqm: { low: 500, high: 1600 },
    ownerShareRange: { low: 30, high: 50 },
    commonStructures: ['jda', 'gfa-share-jv', 'gross-revenue-jv'],
    foreignOwnership: 'Permitted with approvals; corporate structures are common.',
    titleSystem: 'Provincial land records, increasingly digitised.',
    authorities: ['Development authority', 'Cantonment / municipal board', 'Board of revenue'],
    considerations: [
      'Verify records against the digitised provincial registry where available.',
      'Approval sequencing drives programme risk.',
      'Financing cost volatility should be stress-tested.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'CN', name: 'China', flag: '🇨🇳', region: 'East Asia', currency: 'CNY',
    tagline: 'Land-use rights are granted for fixed terms, not owned outright.',
    overview:
      'Land is state or collectively owned; what transacts is a land-use right for a defined term by use class. Ventures are therefore structured around the rights holder and the project company, with the grant term and permitted use driving value.',
    buildCostPerSqm: { low: 600, high: 1400 },
    salePricePerSqm: { low: 1500, high: 6000 },
    ownerShareRange: { low: 20, high: 40 },
    commonStructures: ['spv', 'jda', 'long-term-lease', 'design-build'],
    foreignOwnership: 'Foreign participation generally via approved corporate vehicles.',
    titleSystem: 'Registered land-use rights with defined terms.',
    authorities: ['Natural resources bureau', 'Housing and construction bureau', 'Planning bureau'],
    considerations: [
      'The remaining grant term is central to valuation.',
      'Permitted use class constrains the development programme.',
      'Structure around the project company holding the rights.',
    ],
    dataAsOf: AS_OF,
  },
  {
    code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America', currency: 'USD',
    tagline: 'Equity JVs and ground leases with waterfall economics.',
    overview:
      'US practice favours contributing land into a project entity at an agreed value, with returns distributed through a waterfall — capital return, preferred return, then promote. Ground leases are equally established for owners who want to retain the freehold. Zoning and entitlement are highly local.',
    buildCostPerSqm: { low: 2000, high: 4000 },
    salePricePerSqm: { low: 3000, high: 12000 },
    ownerShareRange: { low: 20, high: 50 },
    commonStructures: ['spv', 'long-term-lease', 'net-profit-jv', 'design-build'],
    foreignOwnership: 'Generally open; certain transactions face national-security review.',
    titleSystem: 'County recording with title insurance as standard practice.',
    authorities: ['City / county planning', 'Building department', 'State environmental agency'],
    considerations: [
      'Waterfall terms (preferred return, promote) drive the economics — model them explicitly.',
      'Entitlement risk is local and can be lengthy.',
      'Title insurance is the norm rather than a state guarantee.',
    ],
    dataAsOf: AS_OF,
  },
];

export const COUNTRY_CODES = COUNTRY_INTELLIGENCE.map((c) => c.code);

export function findCountry(code: string): CountryIntelligence | undefined {
  return COUNTRY_INTELLIGENCE.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

/** Compact shape for the country grid. */
export function countrySummaries() {
  return COUNTRY_INTELLIGENCE.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    region: c.region,
    currency: c.currency,
    tagline: c.tagline,
    ownerShareRange: c.ownerShareRange,
    commonStructures: c.commonStructures.slice(0, 3),
  }));
}
