/**
 * Public structure library (spec §2, §5). ORIGINAL editorial explaining how each
 * partnership / procurement formula actually works. Complements the machine
 * codes in opportunity-reference.ts, which stay the source of truth for values.
 *
 * Grouped so the public page can present private JV, public-private and
 * construction/delivery formulas separately.
 */

export type StructureGroup = 'private-jv' | 'lease-rights' | 'ppp-concession' | 'delivery';

export interface StructureEntry {
  code: string;
  group: StructureGroup;
  /** How value is shared, in one line. */
  mechanism: string;
  /** What the owner typically receives. */
  ownerReceives: string;
  /** Who carries the main risk. */
  riskProfile: string;
  /** When this formula tends to be the right answer. */
  bestFor: string;
}

export const STRUCTURE_GROUPS: { code: StructureGroup; label: string; blurb: string }[] = [
  {
    code: 'private-jv',
    label: 'Private joint ventures',
    blurb: 'The owner contributes land or an asset and shares in the finished value.',
  },
  {
    code: 'lease-rights',
    label: 'Leases & development rights',
    blurb: 'The owner keeps title and grants a time-limited right to build and operate.',
  },
  {
    code: 'ppp-concession',
    label: 'PPP & concessions',
    blurb: 'A private party finances, builds and operates a public asset for a defined term.',
  },
  {
    code: 'delivery',
    label: 'Delivery & construction',
    blurb: 'Procurement formulas for building the asset once the venture is structured.',
  },
];

export const STRUCTURE_LIBRARY: StructureEntry[] = [
  // ---- Private JV ----
  {
    code: 'gfa-share-jv', group: 'private-jv',
    mechanism: 'The owner grants development rights; the finished built area is split by an agreed ratio.',
    ownerReceives: 'A defined share of the completed floor area, to sell or hold.',
    riskProfile: 'The developer funds construction; the owner carries market risk on their units.',
    bestFor: 'Owners who want exposure to finished product rather than a fixed land price.',
  },
  {
    code: 'jda', group: 'private-jv',
    mechanism: 'A development agreement grants the right to build, with the split defined by area or revenue.',
    ownerReceives: 'Area or revenue share per the agreement, usually with milestone protections.',
    riskProfile: 'Developer funds delivery; owner retains title until handover in most drafts.',
    bestFor: 'The default land-partnership formula in many emerging markets.',
  },
  {
    code: 'gross-revenue-jv', group: 'private-jv',
    mechanism: 'The owner takes a percentage of gross sales revenue instead of units.',
    ownerReceives: 'A share of top-line sales, typically escrowed and audited.',
    riskProfile: 'Owner avoids cost overrun exposure but does not control pricing.',
    bestFor: 'Owners who want simplicity and insulation from the cost base.',
  },
  {
    code: 'net-profit-jv', group: 'private-jv',
    mechanism: 'Parties share the project\'s net profit after all costs are recovered.',
    ownerReceives: 'A share of profit — higher upside, but exposed to cost performance.',
    riskProfile: 'Both parties share development risk; requires strong cost governance.',
    bestFor: 'Sophisticated owners comfortable with development economics.',
  },
  {
    code: 'spv', group: 'private-jv',
    mechanism: 'Land is contributed into a project company at an agreed value, becoming equity.',
    ownerReceives: 'An equity stake with returns via a waterfall (capital, preferred return, promote).',
    riskProfile: 'Shared equity risk; governance sits in the shareholders agreement.',
    bestFor: 'Institutional ventures where third-party capital joins the same vehicle.',
  },
  {
    code: 'ready-stock-share', group: 'private-jv',
    mechanism: 'The owner transfers the plot and is paid in finished units at completion.',
    ownerReceives: 'Completed units rather than cash.',
    riskProfile: 'Owner takes completion risk; secure entitlement with a registered guarantee.',
    bestFor: 'Markets where unit swaps are the established norm.',
  },
  {
    code: 'fixed-land-price', group: 'private-jv',
    mechanism: 'A straightforward sale at an agreed price, sometimes staged.',
    ownerReceives: 'Cash certainty, with no exposure to project outcome.',
    riskProfile: 'Developer takes all development and market risk.',
    bestFor: 'Owners prioritising certainty and a clean exit.',
  },
  {
    code: 'deferred-land-price', group: 'private-jv',
    mechanism: 'A sale where payment is deferred to milestones or completion.',
    ownerReceives: 'A higher headline price in exchange for payment timing risk.',
    riskProfile: 'Owner carries counterparty risk; security over the land is common.',
    bestFor: 'Bridging a valuation gap without giving up a fixed price.',
  },

  // ---- Leases & development rights ----
  {
    code: 'musataha', group: 'lease-rights',
    mechanism: 'A registrable right to build and own buildings on another party\'s land for a fixed term.',
    ownerReceives: 'Periodic rent, with the improvements reverting at expiry.',
    riskProfile: 'Developer funds and operates; the right is mortgageable, so bankable.',
    bestFor: 'Owners who want income while retaining ultimate ownership.',
  },
  {
    code: 'long-term-lease', group: 'lease-rights',
    mechanism: 'A long ground lease; the developer builds and owns improvements for the term.',
    ownerReceives: 'Indexed ground rent, plus reversion of land and buildings at expiry.',
    riskProfile: 'Low risk to the owner; the developer carries delivery and operating risk.',
    bestFor: 'Patient owners — institutions, endowments, public bodies.',
  },
  {
    code: 'rent-to-own', group: 'lease-rights',
    mechanism: 'Occupancy with rent contributing toward eventual purchase.',
    ownerReceives: 'Income now with a defined disposal path.',
    riskProfile: 'Owner retains title until the purchase completes.',
    bestFor: 'Affordability-driven residential and social programmes.',
  },
  {
    code: 'sale-leaseback', group: 'lease-rights',
    mechanism: 'An owner sells the asset and leases it back to continue occupying it.',
    ownerReceives: 'Capital released now, in exchange for a rental obligation.',
    riskProfile: 'Converts an owned asset into a long-term liability.',
    bestFor: 'Corporates and authorities recycling capital from operational property.',
  },

  // ---- PPP & concessions ----
  {
    code: 'bot', group: 'ppp-concession',
    mechanism: 'Build-Operate-Transfer: private party builds, operates for a term, then transfers.',
    ownerReceives: 'A delivered asset at no upfront public cost, returned at term end.',
    riskProfile: 'Private side carries construction and demand risk.',
    bestFor: 'Revenue-generating infrastructure where users can be charged.',
  },
  {
    code: 'boot', group: 'ppp-concession',
    mechanism: 'Build-Own-Operate-Transfer: ownership sits privately during the term.',
    ownerReceives: 'Transfer of a functioning asset at expiry.',
    riskProfile: 'Similar to BOT with clearer private ownership during the term.',
    bestFor: 'Long-dated assets needing private balance-sheet treatment.',
  },
  {
    code: 'boo', group: 'ppp-concession',
    mechanism: 'Build-Own-Operate: no transfer — the private party retains the asset.',
    ownerReceives: 'Service delivery rather than an asset.',
    riskProfile: 'Private side takes full lifecycle and residual risk.',
    bestFor: 'Assets where public ownership is not required (e.g. some utilities).',
  },
  {
    code: 'dbfo', group: 'ppp-concession',
    mechanism: 'Design-Build-Finance-Operate, typically remunerated by government payments.',
    ownerReceives: 'A designed, financed, operated asset against availability payments.',
    riskProfile: 'Demand risk stays public; performance risk sits privately.',
    bestFor: 'Social infrastructure with no viable user charge.',
  },
  {
    code: 'dbfom', group: 'ppp-concession',
    mechanism: 'As DBFO, with maintenance bundled across the full lifecycle.',
    ownerReceives: 'Whole-life performance under one contract.',
    riskProfile: 'Strong lifecycle incentive; complex contract management.',
    bestFor: 'Assets where maintenance quality drives whole-life cost.',
  },
  {
    code: 'concession', group: 'ppp-concession',
    mechanism: 'A right to operate a public asset and collect revenue for a term.',
    ownerReceives: 'A concession fee and/or revenue share, plus reversion.',
    riskProfile: 'Concessionaire takes demand risk.',
    bestFor: 'Ports, airports, toll roads and similar user-pay assets.',
  },
  {
    code: 'availability-payment', group: 'ppp-concession',
    mechanism: 'The authority pays for the asset being available to standard, not for usage.',
    ownerReceives: 'Predictable service without demand exposure for the private party.',
    riskProfile: 'Low private demand risk; deductions for underperformance.',
    bestFor: 'Hospitals, schools and courts where usage cannot be charged.',
  },
  {
    code: 'unsolicited-proposal', group: 'ppp-concession',
    mechanism: 'A private party proposes a project the authority had not tendered.',
    ownerReceives: 'Access to private innovation and pipeline.',
    riskProfile: 'Requires a transparent evaluation route to stay competitive.',
    bestFor: 'Novel projects originating outside the public pipeline.',
  },
  {
    code: 'swiss-challenge', group: 'ppp-concession',
    mechanism: 'An unsolicited proposal is published and third parties may counter-bid.',
    ownerReceives: 'Price tension while preserving the originator\'s incentive.',
    riskProfile: 'Balances innovation reward against value-for-money testing.',
    bestFor: 'Jurisdictions formalising unsolicited proposals.',
  },
  {
    code: 'asset-recycling', group: 'ppp-concession',
    mechanism: 'A mature income-producing public asset is leased to fund new infrastructure.',
    ownerReceives: 'An upfront capital sum, with ownership and reversion retained.',
    riskProfile: 'Transfers operating risk while monetising a stabilised asset.',
    bestFor: 'Authorities funding new build from existing assets.',
  },

  // ---- Delivery & construction ----
  {
    code: 'design-build', group: 'delivery',
    mechanism: 'A single contract covering both design and construction.',
    ownerReceives: 'Single-point responsibility and a faster programme.',
    riskProfile: 'Contractor carries design coordination risk.',
    bestFor: 'Straightforward assets where speed and certainty matter.',
  },
  {
    code: 'epc', group: 'delivery',
    mechanism: 'Engineer-Procure-Construct, usually to a fixed price and date.',
    ownerReceives: 'A completed facility with strong price certainty.',
    riskProfile: 'Contractor absorbs most delivery risk, priced accordingly.',
    bestFor: 'Industrial, energy and process facilities.',
  },
  {
    code: 'epcf', group: 'delivery',
    mechanism: 'EPC with the contractor also arranging finance.',
    ownerReceives: 'Delivery and funding under one counterparty.',
    riskProfile: 'Concentrates risk in one party — assess balance-sheet strength.',
    bestFor: 'Owners without immediate access to construction finance.',
  },
  {
    code: 'gmp', group: 'delivery',
    mechanism: 'Guaranteed maximum price, with savings below the cap often shared.',
    ownerReceives: 'A cost ceiling with transparency and upside sharing.',
    riskProfile: 'Contractor absorbs overrun above the cap.',
    bestFor: 'Complex projects where scope evolves during design.',
  },
  {
    code: 'turnkey', group: 'delivery',
    mechanism: 'A complete facility handed over ready to operate.',
    ownerReceives: 'An operational asset with minimal owner involvement.',
    riskProfile: 'Contractor carries integration risk.',
    bestFor: 'Owners without in-house delivery capability.',
  },
  {
    code: 'development-management', group: 'delivery',
    mechanism: 'A development manager runs the project for a fee, often with an incentive.',
    ownerReceives: 'Professional delivery while retaining ownership and upside.',
    riskProfile: 'Owner keeps development risk; manager is incentivised on outcome.',
    bestFor: 'Owners who want to develop but lack an internal team.',
  },
  {
    code: 'operate-maintain', group: 'delivery',
    mechanism: 'An operator runs and maintains an existing asset under contract.',
    ownerReceives: 'Professional operations against defined service levels.',
    riskProfile: 'Performance risk transfers; ownership does not.',
    bestFor: 'Completed assets needing specialist operations.',
  },
];

export function structuresByGroup() {
  return STRUCTURE_GROUPS.map((g) => ({
    ...g,
    entries: STRUCTURE_LIBRARY.filter((s) => s.group === g.code),
  }));
}

export function findStructureEntry(code: string) {
  return STRUCTURE_LIBRARY.find((s) => s.code === code);
}
