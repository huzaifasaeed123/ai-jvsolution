/**
 * Demo opportunity catalogue.
 *
 * 30 listings spread across the twelve countries the intelligence reference
 * covers, every sector family, every lifecycle status and every verification
 * tier — so filters, country pages and the public statistics all have real
 * variation to show rather than one repeated shape.
 *
 * Money is written in MAJOR units here (readable) and converted to the BigInt
 * minor units the schema stores. Currencies follow the country.
 *
 * All projects are invented. Cities are real places, but no listing is modelled
 * on an actual scheme, and confidential fields (address, coordinates) are
 * plausible rather than accurate — they exist to exercise the reveal protocol.
 */
import {
  OwnerCategory,
  OpportunityStatus,
  VerificationTier,
  RiskLevel,
  PermitStatus,
  DataRoomReadiness,
  Prisma,
} from '@prisma/client';
import { prisma, money } from './context';
import { coverFor, galleryFor } from './media';

interface SeedOpportunity {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  sector: string;
  projectType: string;
  ownerCategory: OwnerCategory;
  status: OpportunityStatus;
  verification: VerificationTier;

  countryCode: string;
  region: string;
  city: string;
  /** Confidential — only revealed after an approved, NDA-signed access grant. */
  addressLine: string;
  latitude: number;
  longitude: number;

  landAreaSqm?: number;
  gfaSqm?: number;
  buaSqm?: number;
  nsaSqm?: number;
  plotRatio?: number;
  landUse?: string;
  heightLimit?: string;

  currency: string;
  projectValue?: number;
  investmentRequired?: number;
  targetIrr?: number;
  developmentPeriodMonths?: number;
  concessionPeriodYears?: number;

  structures: string[];
  riskLevel: RiskLevel;
  permitStatus: PermitStatus;
  dataRoomReadiness: DataRoomReadiness;

  requiredDeveloperExperience?: string;
  requiredContractorClass?: string;
  requiredOperatorType?: string;
  financingRequired: boolean;
}

export const OPPORTUNITIES: SeedOpportunity[] = [
  // ======================= United Arab Emirates =======================
  {
    id: 'sd-op-ae-01', ownerId: 'sd-u-own-ae',
    title: 'Marina District Mixed-Use Development',
    summary:
      'Waterfront plot released for a mixed-use scheme of serviced apartments, grade-A office and a retail podium. The landowner is seeking a development partner to fund and deliver in exchange for a share of net profit.',
    sector: 'mixed-use', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'AE', region: 'Dubai', city: 'Dubai',
    addressLine: 'Plot 4412, Marina Quay South', latitude: 25.0805, longitude: 55.1403,
    landAreaSqm: 24800, gfaSqm: 186000, buaSqm: 172000, nsaSqm: 141000, plotRatio: 7.5,
    landUse: 'Mixed-use (residential / commercial)', heightLimit: 'G+42',
    currency: 'AED', projectValue: 1850000000, investmentRequired: 620000000,
    targetIrr: 18.5, developmentPeriodMonths: 42,
    structures: ['net-profit-jv', 'gfa-share-jv', 'development-management'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.PRELIMINARY, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Minimum 3 delivered mixed-use towers above 150,000 sqm GFA',
    requiredContractorClass: 'Tier 1 main contractor, special grade',
    financingRequired: true,
  },
  {
    id: 'sd-op-ae-02', ownerId: 'sd-u-gov-ae',
    title: 'Logistics Park Phase 2 — Warehousing & Cold Chain',
    summary:
      'Second phase of an operating logistics park adjacent to the cargo corridor. Land is offered on a long-term lease for warehousing, cold chain and light assembly, with an option on the remaining plots.',
    sector: 'industrial-logistics', projectType: 'brownfield',
    ownerCategory: OwnerCategory.SEMI_GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T4,
    countryCode: 'AE', region: 'Dubai', city: 'Dubai South',
    addressLine: 'Sector L, Logistics Corridor East', latitude: 24.8961, longitude: 55.1614,
    landAreaSqm: 410000, gfaSqm: 245000, buaSqm: 238000, plotRatio: 0.6,
    landUse: 'Industrial / logistics', heightLimit: '18 m clear height',
    currency: 'AED', projectValue: 940000000, investmentRequired: 410000000,
    targetIrr: 14.2, developmentPeriodMonths: 30, concessionPeriodYears: 30,
    structures: ['long-term-lease', 'boot', 'lease-develop-operate'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Operator with 200,000 sqm+ of warehousing under management',
    requiredOperatorType: 'Specialist logistics operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-ae-03', ownerId: 'sd-u-gov-ae',
    title: 'Coastal Desalination & District Cooling PPP',
    summary:
      'Integrated seawater desalination and district cooling plant serving a new coastal community. Structured as a 25-year availability-payment concession with an offtake guarantee from the utility.',
    sector: 'utilities-energy-water', projectType: 'ppp',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.MATCHED, verification: VerificationTier.T5,
    countryCode: 'AE', region: 'Abu Dhabi', city: 'Abu Dhabi',
    addressLine: 'Coastal Utilities Reserve, Plot U-7', latitude: 24.4539, longitude: 54.3773,
    landAreaSqm: 96000, buaSqm: 41000,
    landUse: 'Utilities', heightLimit: '24 m',
    currency: 'AED', projectValue: 2450000000, investmentRequired: 1180000000,
    targetIrr: 12.8, developmentPeriodMonths: 36, concessionPeriodYears: 25,
    structures: ['dbfom', 'availability-payment', 'offtake-agreement', 'spv'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Two reference desalination plants above 50 MIGD',
    requiredOperatorType: 'Licensed utility operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-ae-04', ownerId: 'sd-u-gov-ae',
    title: 'Affordable Housing Programme — 3,200 Units',
    summary:
      'Government housing programme seeking a delivery partner for 3,200 units across three sites, with a rent-to-own pathway for eligible residents and a fixed hand-back at the end of the term.',
    sector: 'government-housing', projectType: 'greenfield',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T2,
    countryCode: 'AE', region: 'Sharjah', city: 'Sharjah',
    addressLine: 'Housing Reserve Sites A, B and D', latitude: 25.3463, longitude: 55.4209,
    landAreaSqm: 320000, gfaSqm: 296000, buaSqm: 288000, nsaSqm: 240000, plotRatio: 0.93,
    landUse: 'Residential', heightLimit: 'G+8',
    currency: 'AED', projectValue: 1120000000, investmentRequired: 480000000,
    targetIrr: 11.5, developmentPeriodMonths: 48,
    structures: ['rent-to-own', 'design-build-finance', 'deferred-land-price'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.BASIC,
    requiredDeveloperExperience: 'Volume residential delivery, 1,500+ units',
    requiredContractorClass: 'Grade A residential contractor',
    financingRequired: true,
  },

  // ============================ Saudi Arabia ============================
  {
    id: 'sd-op-sa-01', ownerId: 'sd-u-gov-sa',
    title: 'Coastal Resort & Marina Concession',
    summary:
      'Greenfield resort concession on a protected stretch of coastline: 420 keys across two hotels, a marina and a retail village. Environmental envelope is fixed and non-negotiable.',
    sector: 'hospitality', projectType: 'concession',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T4,
    countryCode: 'SA', region: 'Tabuk', city: 'Umluj',
    addressLine: 'Coastal Concession Parcel R-3', latitude: 25.0213, longitude: 37.2685,
    landAreaSqm: 780000, gfaSqm: 118000, buaSqm: 112000,
    landUse: 'Tourism / hospitality', heightLimit: 'G+4 (coastal envelope)',
    currency: 'SAR', projectValue: 2100000000, investmentRequired: 890000000,
    targetIrr: 16.4, developmentPeriodMonths: 44, concessionPeriodYears: 40,
    structures: ['concession', 'boot', 'management-contract'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Resort development above 300 keys in a comparable climate',
    requiredOperatorType: 'International hotel operator, upper-upscale or luxury',
    financingRequired: true,
  },
  {
    id: 'sd-op-sa-02', ownerId: 'sd-u-own-sa',
    title: 'Northern Business Park — Grade A Office Campus',
    summary:
      'Landowner seeking a JV partner for a five-building grade-A office campus with a shared amenity spine. Anchor pre-let discussions are advanced with two government-related tenants.',
    sector: 'office', projectType: 'greenfield',
    ownerCategory: OwnerCategory.SEMI_GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'SA', region: 'Riyadh', city: 'Riyadh',
    addressLine: 'North Ring Parcel 118', latitude: 24.8247, longitude: 46.6392,
    landAreaSqm: 62000, gfaSqm: 210000, buaSqm: 198000, nsaSqm: 163000, plotRatio: 3.4,
    landUse: 'Commercial / office', heightLimit: 'G+18',
    currency: 'SAR', projectValue: 1480000000, investmentRequired: 520000000,
    targetIrr: 15.1, developmentPeriodMonths: 38,
    structures: ['net-profit-jv', 'gross-revenue-jv', 'jda'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Grade A office delivery, 100,000 sqm+',
    financingRequired: true,
  },
  {
    id: 'sd-op-sa-03', ownerId: 'sd-u-gov-sa',
    title: 'Solar IPP with Battery Storage — 400 MW',
    summary:
      'Independent power project combining 400 MW of solar PV with 200 MWh of battery storage, under a 25-year power purchase agreement. Grid connection is secured and land is allocated.',
    sector: 'utilities-energy-water', projectType: 'infrastructure',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.IN_DEAL, verification: VerificationTier.T5,
    countryCode: 'SA', region: 'Eastern Province', city: 'Dammam',
    addressLine: 'Energy Reserve Block E-12', latitude: 26.4207, longitude: 50.0888,
    landAreaSqm: 6200000,
    landUse: 'Energy generation',
    currency: 'SAR', projectValue: 3200000000, investmentRequired: 2400000000,
    targetIrr: 11.9, developmentPeriodMonths: 28, concessionPeriodYears: 25,
    structures: ['boo', 'offtake-agreement', 'epc', 'spv'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'IPP sponsor with 500 MW+ of operating renewables',
    requiredOperatorType: 'Licensed generation operator',
    financingRequired: true,
  },

  // =============================== Egypt ===============================
  {
    id: 'sd-op-eg-01', ownerId: 'sd-u-gov-eg',
    title: 'Delta Agri-Logistics Hub',
    summary:
      'Cold-chain and grading hub serving delta farmland, with rail and road links to the port. Structured to transfer throughput risk to the operator while the authority retains the land.',
    sector: 'industrial-logistics', projectType: 'ppp',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'EG', region: 'Beheira', city: 'Damanhur',
    addressLine: 'Agri Zone, Parcel 27', latitude: 31.0341, longitude: 30.4682,
    landAreaSqm: 285000, gfaSqm: 96000, buaSqm: 92000,
    landUse: 'Agri-industrial', heightLimit: '16 m',
    currency: 'EGP', projectValue: 4800000000, investmentRequired: 2100000000,
    targetIrr: 19.8, developmentPeriodMonths: 26, concessionPeriodYears: 25,
    structures: ['bot', 'long-term-lease', 'operate-maintain'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Cold-chain facility delivery and operation',
    requiredOperatorType: 'Agri-logistics operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-eg-02', ownerId: 'sd-u-own-eg',
    title: 'Waterfront Regeneration — Mixed-Use Quarter',
    summary:
      'Regeneration of a disused port-adjacent quarter into residential, boutique hospitality and cultural space. Heritage facades on the northern edge must be retained.',
    sector: 'mixed-use', projectType: 'brownfield',
    ownerCategory: OwnerCategory.SEMI_GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T2,
    countryCode: 'EG', region: 'Alexandria', city: 'Alexandria',
    addressLine: 'Eastern Harbour, Block 9', latitude: 31.2001, longitude: 29.9187,
    landAreaSqm: 74000, gfaSqm: 152000, buaSqm: 144000, nsaSqm: 118000, plotRatio: 2.05,
    landUse: 'Mixed-use with heritage overlay', heightLimit: 'G+12 (G+5 on heritage frontage)',
    currency: 'EGP', projectValue: 7600000000, investmentRequired: 3100000000,
    targetIrr: 21.2, developmentPeriodMonths: 54,
    structures: ['gfa-share-jv', 'deferred-land-price', 'development-management'],
    riskLevel: RiskLevel.HIGH, permitStatus: PermitStatus.PRELIMINARY, dataRoomReadiness: DataRoomReadiness.BASIC,
    requiredDeveloperExperience: 'Heritage-sensitive urban regeneration',
    requiredContractorClass: 'Contractor with conservation accreditation',
    financingRequired: true,
  },
  {
    id: 'sd-op-eg-03', ownerId: 'sd-u-gov-eg',
    title: 'Ring Road Parking Concessions — 6 Sites',
    summary:
      'Six multi-storey parking sites offered as a bundled concession, with dynamic pricing rights and a revenue share to the municipality. Still being prepared for market.',
    sector: 'parking-transport', projectType: 'concession',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.DRAFT, verification: VerificationTier.T0,
    countryCode: 'EG', region: 'Cairo', city: 'Cairo',
    addressLine: 'Sites P1-P6, Ring Road corridor', latitude: 30.0444, longitude: 31.2357,
    landAreaSqm: 38000, gfaSqm: 112000, buaSqm: 108000,
    landUse: 'Transport / parking', heightLimit: 'G+6',
    currency: 'EGP', projectValue: 1900000000, investmentRequired: 860000000,
    targetIrr: 17.6, developmentPeriodMonths: 22, concessionPeriodYears: 20,
    structures: ['concession', 'bot', 'gross-revenue-jv'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.NONE, dataRoomReadiness: DataRoomReadiness.EMPTY,
    requiredOperatorType: 'Car park operator',
    financingRequired: true,
  },

  // ========================== United Kingdom ==========================
  {
    id: 'sd-op-gb-01', ownerId: 'sd-u-gov-gb',
    title: 'Regional Health Campus — Diagnostics & Day Surgery',
    summary:
      'A 340-bed diagnostics and day-surgery campus procured as a design-build-finance-maintain concession, with clinical services retained in the public sector.',
    sector: 'healthcare', projectType: 'ppp',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T4,
    countryCode: 'GB', region: 'South East', city: 'Dartford',
    addressLine: 'Health Campus Site, Gateway Park', latitude: 51.4463, longitude: 0.2192,
    landAreaSqm: 58000, gfaSqm: 74000, buaSqm: 71000,
    landUse: 'Health / institutional', heightLimit: '6 storeys',
    currency: 'GBP', projectValue: 410000000, investmentRequired: 265000000,
    targetIrr: 10.4, developmentPeriodMonths: 40, concessionPeriodYears: 30,
    structures: ['dbfo', 'availability-payment', 'spv'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Two delivered acute or diagnostic healthcare facilities',
    requiredContractorClass: 'Healthcare-accredited main contractor',
    financingRequired: true,
  },
  {
    id: 'sd-op-gb-02', ownerId: 'sd-u-own-gb',
    title: 'Brownfield Residential Regeneration — 1,180 Homes',
    summary:
      'Former industrial land with outline consent for 1,180 homes, 30% affordable. The landowner will contribute the site in exchange for a share of completed units.',
    sector: 'residential', projectType: 'brownfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'GB', region: 'North West', city: 'Manchester',
    addressLine: 'Former Works Site, Ashton Canal', latitude: 53.4808, longitude: -2.2426,
    landAreaSqm: 91000, gfaSqm: 118000, buaSqm: 112000, nsaSqm: 94000, plotRatio: 1.3,
    landUse: 'Residential', heightLimit: '8 storeys',
    currency: 'GBP', projectValue: 340000000, investmentRequired: 128000000,
    targetIrr: 17.2, developmentPeriodMonths: 60,
    structures: ['ready-stock-share', 'nsa-share', 'jda'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Residential developer, 800+ units delivered',
    financingRequired: true,
  },
  {
    id: 'sd-op-gb-03', ownerId: 'sd-u-gov-gb',
    title: 'Rail Depot Modernisation & Electrification',
    summary:
      'Modernisation of a regional rolling-stock depot including electrification, stabling extension and a maintenance shed, delivered under an availability-based concession.',
    sector: 'roads-rail-metro', projectType: 'brownfield',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.IN_DEAL, verification: VerificationTier.T5,
    countryCode: 'GB', region: 'West Midlands', city: 'Birmingham',
    addressLine: 'Depot Sidings, Sector 4', latitude: 52.4862, longitude: -1.8904,
    landAreaSqm: 142000, buaSqm: 38000,
    landUse: 'Rail infrastructure',
    currency: 'GBP', projectValue: 285000000, investmentRequired: 190000000,
    targetIrr: 9.8, developmentPeriodMonths: 34, concessionPeriodYears: 25,
    structures: ['dbom', 'availability-payment', 'rehabilitate-operate-transfer'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Rail depot or electrification delivery',
    requiredContractorClass: 'Rail-approved principal contractor',
    financingRequired: true,
  },

  // =============================== Germany ===============================
  {
    id: 'sd-op-de-01', ownerId: 'sd-u-own-de',
    title: 'Rhine Corridor Data Centre Campus — 48 MW',
    summary:
      'Powered land with a secured 48 MW grid connection, offered to a hyperscale or colocation partner. Waste heat is to be exported to the adjacent district heating network.',
    sector: 'data-centre', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'DE', region: 'Hesse', city: 'Frankfurt',
    addressLine: 'Industriepark Nord, Parcel 14', latitude: 50.1109, longitude: 8.6821,
    landAreaSqm: 128000, gfaSqm: 72000, buaSqm: 69000, plotRatio: 0.56,
    landUse: 'Industrial / technology', heightLimit: '22 m',
    currency: 'EUR', projectValue: 780000000, investmentRequired: 540000000,
    targetIrr: 13.6, developmentPeriodMonths: 32,
    structures: ['long-term-lease', 'boo', 'sale-leaseback'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Data centre developer with 30 MW+ delivered',
    requiredOperatorType: 'Colocation or hyperscale operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-de-02', ownerId: 'sd-u-gov-de',
    title: 'District Heating Network Extension',
    summary:
      'Extension of a municipal district heating network to 14,000 additional connections, with a transition from gas to waste heat and heat pumps over the concession term.',
    sector: 'waste-district-cooling', projectType: 'infrastructure',
    ownerCategory: OwnerCategory.SEMI_GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T4,
    countryCode: 'DE', region: 'Bavaria', city: 'Augsburg',
    addressLine: 'Network Zones 3 and 5', latitude: 48.3705, longitude: 10.8978,
    landAreaSqm: 21000, buaSqm: 14000,
    landUse: 'Utilities',
    currency: 'EUR', projectValue: 315000000, investmentRequired: 220000000,
    targetIrr: 9.2, developmentPeriodMonths: 46, concessionPeriodYears: 30,
    structures: ['concession', 'dbfo', 'operate-maintain'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredOperatorType: 'Licensed heat network operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-de-03', ownerId: 'sd-u-gov-de',
    title: 'Port Terminal Automation & Capacity Upgrade',
    summary:
      'Automation of two container berths with an increase in annual capacity to 1.8m TEU. The operator takes volume risk against a floor guaranteed by the port authority.',
    sector: 'seaport', projectType: 'brownfield',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.MATCHED, verification: VerificationTier.T4,
    countryCode: 'DE', region: 'Hamburg', city: 'Hamburg',
    addressLine: 'Terminal 3, Berths 12-13', latitude: 53.5511, longitude: 9.9937,
    landAreaSqm: 480000, buaSqm: 62000,
    landUse: 'Port / terminal',
    currency: 'EUR', projectValue: 620000000, investmentRequired: 445000000,
    targetIrr: 11.1, developmentPeriodMonths: 42, concessionPeriodYears: 30,
    structures: ['rehabilitate-operate-transfer', 'concession', 'government-revenue-guarantee'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Container terminal automation experience',
    requiredOperatorType: 'Global terminal operator',
    financingRequired: true,
  },

  // ================================ France ================================
  {
    id: 'sd-op-fr-01', ownerId: 'sd-u-gov-fr',
    title: 'Urban Mobility & Parking Concession',
    summary:
      'City-wide concession covering 11 car parks, kerbside enforcement and a park-and-ride interchange, with a mandated shift of 20% of capacity to electric charging.',
    sector: 'parking-transport', projectType: 'concession',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'FR', region: 'Auvergne-Rhone-Alpes', city: 'Lyon',
    addressLine: 'Concession lots 1-11, city centre', latitude: 45.7640, longitude: 4.8357,
    landAreaSqm: 64000, gfaSqm: 196000, buaSqm: 190000,
    landUse: 'Transport / parking',
    currency: 'EUR', projectValue: 240000000, investmentRequired: 138000000,
    targetIrr: 10.9, developmentPeriodMonths: 24, concessionPeriodYears: 22,
    structures: ['concession', 'gross-revenue-jv', 'operate-maintain'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredOperatorType: 'Urban mobility operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-fr-02', ownerId: 'sd-u-own-fr',
    title: 'Southern Solar Land Portfolio — 6 Parcels',
    summary:
      'Six agricultural parcels with favourable irradiation and grid proximity, offered to a renewables developer. Grid studies are commissioned but not yet returned.',
    sector: 'utilities-energy-water', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.DRAFT, verification: VerificationTier.T1,
    countryCode: 'FR', region: 'Provence-Alpes-Cote d Azur', city: 'Aix-en-Provence',
    addressLine: 'Parcels 401-406, plateau sector', latitude: 43.5297, longitude: 5.4474,
    landAreaSqm: 2400000,
    landUse: 'Agricultural / energy',
    currency: 'EUR', projectValue: 186000000, investmentRequired: 142000000,
    targetIrr: 8.9, developmentPeriodMonths: 20, concessionPeriodYears: 30,
    structures: ['long-term-lease', 'boo', 'offtake-agreement'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.NONE, dataRoomReadiness: DataRoomReadiness.EMPTY,
    requiredDeveloperExperience: 'Solar developer with grid connection track record',
    financingRequired: true,
  },

  // ================================ Spain ================================
  {
    id: 'sd-op-es-01', ownerId: 'sd-u-own-es',
    title: 'Coastal Resort Land Assembly — 3 Plots',
    summary:
      'Assembled coastal plots with resort zoning, previously marketed and now closed after the owner elected to retain the land. Retained for reference.',
    sector: 'hospitality', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.CLOSED, verification: VerificationTier.T2,
    countryCode: 'ES', region: 'Valencian Community', city: 'Alicante',
    addressLine: 'Plots 12, 13 and 15, coastal sector', latitude: 38.3452, longitude: -0.4810,
    landAreaSqm: 118000, gfaSqm: 64000, buaSqm: 61000, plotRatio: 0.54,
    landUse: 'Tourism', heightLimit: 'G+4',
    currency: 'EUR', projectValue: 210000000, investmentRequired: 96000000,
    targetIrr: 14.8, developmentPeriodMonths: 36,
    structures: ['fixed-land-price', 'net-profit-jv'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.PRELIMINARY, dataRoomReadiness: DataRoomReadiness.BASIC,
    financingRequired: false,
  },
  {
    id: 'sd-op-es-02', ownerId: 'sd-u-gov-es',
    title: 'Smart Lighting & Sensor Network Concession',
    summary:
      'Replacement of 61,000 street lights with connected LED units plus an air-quality and traffic sensor layer, paid from guaranteed energy savings.',
    sector: 'smart-city-digital', projectType: 'infrastructure',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'ES', region: 'Valencian Community', city: 'Valencia',
    addressLine: 'Municipal districts 1-19', latitude: 39.4699, longitude: -0.3763,
    landAreaSqm: 0,
    landUse: 'Municipal infrastructure',
    currency: 'EUR', projectValue: 128000000, investmentRequired: 92000000,
    targetIrr: 10.2, developmentPeriodMonths: 18, concessionPeriodYears: 15,
    structures: ['concession', 'availability-payment', 'operate-maintain'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredOperatorType: 'Energy services company (ESCO)',
    financingRequired: true,
  },

  // ============================== Portugal ==============================
  {
    id: 'sd-op-pt-01', ownerId: 'sd-u-own-pt',
    title: 'Riverside Office Campus — Phase 1',
    summary:
      'First phase of a riverside office campus with a target of net-zero operational carbon. The landowner seeks a funding partner and will retain a minority share.',
    sector: 'office', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'PT', region: 'Lisbon', city: 'Lisbon',
    addressLine: 'Riverside Parcel B2, eastern quay', latitude: 38.7223, longitude: -9.1393,
    landAreaSqm: 34000, gfaSqm: 88000, buaSqm: 84000, nsaSqm: 71000, plotRatio: 2.59,
    landUse: 'Commercial / office', heightLimit: '9 storeys',
    currency: 'EUR', projectValue: 296000000, investmentRequired: 132000000,
    targetIrr: 13.4, developmentPeriodMonths: 34,
    structures: ['net-profit-jv', 'development-management', 'spv'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Certified sustainable office delivery (BREEAM Excellent or equivalent)',
    financingRequired: true,
  },
  {
    id: 'sd-op-pt-02', ownerId: 'sd-u-own-pt',
    title: 'Regional Water Reuse Scheme',
    summary:
      'Tertiary treatment and reuse scheme supplying irrigation and golf demand, reducing abstraction from the regional aquifer. Concession has since reached financial close.',
    sector: 'utilities-energy-water', projectType: 'ppp',
    ownerCategory: OwnerCategory.SEMI_GOVERNMENT, status: OpportunityStatus.CLOSED, verification: VerificationTier.T5,
    countryCode: 'PT', region: 'Algarve', city: 'Faro',
    addressLine: 'Treatment Works, eastern basin', latitude: 37.0194, longitude: -7.9304,
    landAreaSqm: 46000, buaSqm: 12000,
    landUse: 'Utilities',
    currency: 'EUR', projectValue: 98000000, investmentRequired: 74000000,
    targetIrr: 8.4, developmentPeriodMonths: 26, concessionPeriodYears: 25,
    structures: ['dbfo', 'offtake-agreement', 'operate-maintain'],
    riskLevel: RiskLevel.LOW, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredOperatorType: 'Water utility operator',
    financingRequired: false,
  },

  // ================================ India ================================
  {
    id: 'sd-op-in-01', ownerId: 'sd-u-gov-in',
    title: 'Metro Corridor Transit-Oriented Development',
    summary:
      'Development rights above and around four metro stations, offered as a bundle. Revenue share to the transit authority is indexed to ridership.',
    sector: 'roads-rail-metro', projectType: 'ppp',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'IN', region: 'Maharashtra', city: 'Pune',
    addressLine: 'Station precincts 3, 6, 9 and 12', latitude: 18.5204, longitude: 73.8567,
    landAreaSqm: 96000, gfaSqm: 288000, buaSqm: 274000, nsaSqm: 226000, plotRatio: 3.0,
    landUse: 'Transit-oriented mixed-use', heightLimit: 'G+24',
    currency: 'INR', projectValue: 42000000000, investmentRequired: 16800000000,
    targetIrr: 18.9, developmentPeriodMonths: 52, concessionPeriodYears: 60,
    structures: ['long-term-lease', 'gross-revenue-jv', 'lease-develop-transfer'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Transit-oriented or high-density mixed-use delivery',
    financingRequired: true,
  },
  {
    id: 'sd-op-in-02', ownerId: 'sd-u-own-in',
    title: 'Industrial Park Expansion — Phase 3',
    summary:
      'Expansion of an occupied industrial park with plug-and-play units for auto components and electronics assembly. Existing phases run at 94% occupancy.',
    sector: 'industrial-logistics', projectType: 'brownfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T2,
    countryCode: 'IN', region: 'Maharashtra', city: 'Pune',
    addressLine: 'Industrial Estate, Phase 3 land bank', latitude: 18.6298, longitude: 73.7997,
    landAreaSqm: 210000, gfaSqm: 126000, buaSqm: 121000, plotRatio: 0.6,
    landUse: 'Industrial', heightLimit: '14 m',
    currency: 'INR', projectValue: 9600000000, investmentRequired: 4200000000,
    targetIrr: 16.7, developmentPeriodMonths: 28,
    structures: ['net-profit-jv', 'sale-leaseback', 'jda'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.BASIC,
    requiredDeveloperExperience: 'Industrial park development',
    financingRequired: true,
  },

  // ============================== Pakistan ==============================
  {
    id: 'sd-op-pk-01', ownerId: 'sd-u-gov-pk',
    title: 'Riverfront Urban Regeneration Programme',
    summary:
      'Long-term regeneration of a riverfront corridor: flood defence, public realm and mixed-use release parcels, phased over four release windows.',
    sector: 'mixed-use', projectType: 'brownfield',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T2,
    countryCode: 'PK', region: 'Punjab', city: 'Lahore',
    addressLine: 'Riverfront corridor, release parcels A-D', latitude: 31.5204, longitude: 74.3587,
    landAreaSqm: 620000, gfaSqm: 410000, buaSqm: 392000, nsaSqm: 318000, plotRatio: 0.66,
    landUse: 'Mixed-use with public realm obligation', heightLimit: 'G+16',
    currency: 'PKR', projectValue: 186000000000, investmentRequired: 74000000000,
    targetIrr: 22.4, developmentPeriodMonths: 72,
    structures: ['gfa-share-jv', 'deferred-land-price', 'lease-develop-transfer'],
    riskLevel: RiskLevel.HIGH, permitStatus: PermitStatus.PRELIMINARY, dataRoomReadiness: DataRoomReadiness.BASIC,
    requiredDeveloperExperience: 'Large-scale masterplan delivery',
    requiredContractorClass: 'PEC C-A licensed contractor',
    financingRequired: true,
  },
  {
    id: 'sd-op-pk-02', ownerId: 'sd-u-gov-pk',
    title: 'Education City Campus — Phase 1',
    summary:
      'Shared-campus model hosting three institutions with common laboratories, library and student housing, delivered under a build-operate-transfer arrangement.',
    sector: 'education', projectType: 'greenfield',
    ownerCategory: OwnerCategory.SEMI_GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T1,
    countryCode: 'PK', region: 'Sindh', city: 'Karachi',
    addressLine: 'Education Reserve, Sector 7', latitude: 24.8607, longitude: 67.0011,
    landAreaSqm: 240000, gfaSqm: 138000, buaSqm: 132000, plotRatio: 0.58,
    landUse: 'Educational', heightLimit: 'G+6',
    currency: 'PKR', projectValue: 48000000000, investmentRequired: 21000000000,
    targetIrr: 15.3, developmentPeriodMonths: 40, concessionPeriodYears: 30,
    structures: ['bot', 'design-build-finance', 'management-contract'],
    riskLevel: RiskLevel.MEDIUM, permitStatus: PermitStatus.IN_PROGRESS, dataRoomReadiness: DataRoomReadiness.BASIC,
    requiredOperatorType: 'Education campus operator',
    financingRequired: true,
  },

  // ================================ China ================================
  {
    id: 'sd-op-cn-01', ownerId: 'sd-u-own-cn',
    title: 'Delta Logistics Gateway — Bonded Warehousing',
    summary:
      'Bonded warehousing and cross-dock facility on a river-rail interchange, targeting e-commerce fulfilment and re-export flows.',
    sector: 'industrial-logistics', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T3,
    countryCode: 'CN', region: 'Jiangsu', city: 'Suzhou',
    addressLine: 'Logistics Zone, Parcel 22', latitude: 31.2989, longitude: 120.5853,
    landAreaSqm: 320000, gfaSqm: 198000, buaSqm: 191000, plotRatio: 0.62,
    landUse: 'Logistics / bonded', heightLimit: '16 m',
    currency: 'CNY', projectValue: 3400000000, investmentRequired: 1450000000,
    targetIrr: 13.1, developmentPeriodMonths: 30,
    structures: ['long-term-lease', 'net-profit-jv', 'sale-leaseback'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredOperatorType: 'Bonded logistics operator',
    financingRequired: true,
  },
  {
    id: 'sd-op-cn-02', ownerId: 'sd-u-gov-cn',
    title: 'Provincial Sports & Events Complex',
    summary:
      'A 38,000-seat stadium with an adjoining aquatics centre and events plaza. Archived after the provincial programme was re-sequenced.',
    sector: 'tourism-culture-sports', projectType: 'greenfield',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.ARCHIVED, verification: VerificationTier.T2,
    countryCode: 'CN', region: 'Zhejiang', city: 'Hangzhou',
    addressLine: 'Sports Reserve, Eastern District', latitude: 30.2741, longitude: 120.1551,
    landAreaSqm: 410000, gfaSqm: 164000, buaSqm: 158000,
    landUse: 'Sports / civic', heightLimit: '46 m',
    currency: 'CNY', projectValue: 5600000000, investmentRequired: 3100000000,
    targetIrr: 8.6, developmentPeriodMonths: 48, concessionPeriodYears: 30,
    structures: ['bot', 'availability-payment', 'management-contract'],
    riskLevel: RiskLevel.HIGH, permitStatus: PermitStatus.PRELIMINARY, dataRoomReadiness: DataRoomReadiness.BASIC,
    requiredOperatorType: 'Venue and events operator',
    financingRequired: true,
  },

  // =========================== United States ===========================
  {
    id: 'sd-op-us-01', ownerId: 'sd-u-gov-us',
    title: 'Airport Cargo Terminal Concession',
    summary:
      'Design, finance and operation of a 46,000 sqm air cargo terminal with airside apron, under a 30-year concession with a minimum annual guarantee to the airport.',
    sector: 'airport', projectType: 'concession',
    ownerCategory: OwnerCategory.GOVERNMENT, status: OpportunityStatus.PUBLISHED, verification: VerificationTier.T4,
    countryCode: 'US', region: 'Illinois', city: 'Chicago',
    addressLine: 'Cargo Area C, Apron 7', latitude: 41.8781, longitude: -87.6298,
    landAreaSqm: 168000, gfaSqm: 46000, buaSqm: 44000,
    landUse: 'Aviation / cargo', heightLimit: '20 m (airside envelope)',
    currency: 'USD', projectValue: 380000000, investmentRequired: 255000000,
    targetIrr: 12.3, developmentPeriodMonths: 36, concessionPeriodYears: 30,
    structures: ['dbfom', 'concession', 'government-revenue-guarantee'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.COMPLETE,
    requiredDeveloperExperience: 'Air cargo facility delivery, airside experience essential',
    requiredOperatorType: 'Air cargo handler',
    financingRequired: true,
  },
  {
    id: 'sd-op-us-02', ownerId: 'sd-u-own-us',
    title: 'Build-to-Rent Portfolio — 940 Homes',
    summary:
      'Four build-to-rent communities totalling 940 homes across two metros, offered as a single programmatic JV with a forward-funding structure.',
    sector: 'residential', projectType: 'greenfield',
    ownerCategory: OwnerCategory.PRIVATE, status: OpportunityStatus.MATCHED, verification: VerificationTier.T3,
    countryCode: 'US', region: 'Texas', city: 'Austin',
    addressLine: 'Communities N1, N2, S4 and S6', latitude: 30.2672, longitude: -97.7431,
    landAreaSqm: 264000, gfaSqm: 142000, buaSqm: 136000, nsaSqm: 118000, plotRatio: 0.54,
    landUse: 'Residential', heightLimit: '3 storeys',
    currency: 'USD', projectValue: 410000000, investmentRequired: 168000000,
    targetIrr: 15.6, developmentPeriodMonths: 44,
    structures: ['net-profit-jv', 'development-management', 'spv'],
    riskLevel: RiskLevel.MODERATE, permitStatus: PermitStatus.APPROVED, dataRoomReadiness: DataRoomReadiness.PARTIAL,
    requiredDeveloperExperience: 'Build-to-rent operator with 500+ units stabilised',
    financingRequired: true,
  },
];

/**
 * Reference in the same shape the app generates (`JV-<CC>-<6 hex>`), but derived
 * from the seed id so it is stable across runs instead of random.
 */
function referenceFor(o: SeedOpportunity): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < o.id.length; i += 1) {
    h ^= o.id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `JV-${o.countryCode}-${h.toString(16).toUpperCase().padStart(6, '0').slice(0, 6)}`;
}

export async function seedOpportunities(): Promise<void> {
  let i = 0;
  for (const o of OPPORTUNITIES) {
    // Walk the sector image pool so two listings in one sector differ.
    const variant = i;
    const data: Prisma.OpportunityUncheckedUpdateInput = {
      reference: referenceFor(o),
      title: o.title,
      summary: o.summary,
      sector: o.sector,
      projectType: o.projectType,
      ownerCategory: o.ownerCategory,
      status: o.status,
      verification: o.verification,
      coverImageUrl: coverFor(o.sector, variant),
      galleryUrls: galleryFor(o.sector, variant, 3),
      countryCode: o.countryCode,
      region: o.region,
      city: o.city,
      addressLine: o.addressLine,
      latitude: o.latitude,
      longitude: o.longitude,
      landAreaSqm: o.landAreaSqm ?? null,
      gfaSqm: o.gfaSqm ?? null,
      buaSqm: o.buaSqm ?? null,
      nsaSqm: o.nsaSqm ?? null,
      plotRatio: o.plotRatio ?? null,
      landUse: o.landUse ?? null,
      heightLimit: o.heightLimit ?? null,
      currency: o.currency,
      projectValueCents: o.projectValue === undefined ? null : money(o.projectValue),
      investmentRequiredCents: o.investmentRequired === undefined ? null : money(o.investmentRequired),
      targetIrr: o.targetIrr ?? null,
      developmentPeriodMonths: o.developmentPeriodMonths ?? null,
      concessionPeriodYears: o.concessionPeriodYears ?? null,
      structures: o.structures,
      riskLevel: o.riskLevel,
      permitStatus: o.permitStatus,
      dataRoomReadiness: o.dataRoomReadiness,
      requiredDeveloperExperience: o.requiredDeveloperExperience ?? null,
      requiredContractorClass: o.requiredContractorClass ?? null,
      requiredOperatorType: o.requiredOperatorType ?? null,
      financingRequired: o.financingRequired,
      ownerId: o.ownerId,
    };

    await prisma.opportunity.upsert({
      where: { id: o.id },
      update: data,
      create: { id: o.id, ...(data as Prisma.OpportunityUncheckedCreateInput) },
    });
    i += 1;
  }

  const byStatus = OPPORTUNITIES.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const countries = new Set(OPPORTUNITIES.map((o) => o.countryCode)).size;
  const sectors = new Set(OPPORTUNITIES.map((o) => o.sector)).size;
  console.log(
    `  ${OPPORTUNITIES.length} opportunities across ${countries} countries, ${sectors} sectors`,
  );
  console.log(
    `  status: ${Object.entries(byStatus).map(([s, n]) => `${s} ${n}`).join(', ')}`,
  );
}
