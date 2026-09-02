/**
 * English is the reference catalogue: its keys define the Messages type, and
 * every other locale is a Partial that falls back to English per key. That way
 * an untranslated string shows in English rather than showing its key.
 *
 * Market corpus content — country intelligence prose, the structure library,
 * opportunity titles — stays in English deliberately. It is editorial data from
 * the API, not UI chrome, and translating it belongs to content operations
 * rather than the front end.
 */
export const en = {
  // ---------------------------------------------------------------- chrome
  'nav.howItWorks': 'How it works',
  'nav.opportunities': 'Opportunities',
  'nav.countries': 'Country intelligence',
  'nav.structures': 'Structures',
  'nav.tenders': 'Tenders',
  'nav.dashboard': 'Dashboard',
  'nav.signIn': 'Sign in',
  'nav.join': 'Join',
  'nav.signOut': 'Sign out',
  'nav.menu': 'Menu',
  'nav.tagline': 'JV · PPP · Concessions',

  // ------------------------------------------------------------------ home
  'home.eyebrow': 'Joint ventures · PPP · Concessions',
  'home.title1': 'Your opportunity.',
  'home.title2': 'Their capital.',
  'home.title3': 'One venture.',
  'home.lede':
    'connects landowners, governments and asset holders with developers, investors and contractors — with explainable matching, graded verification and a permission-controlled deal room.',
  'home.ctaOwner': 'I own land or assets',
  'home.ctaDeveloper': 'I develop or invest',
  'home.trustLine': 'Confidential fields never leave the server until access is granted',
  'home.liveBadge': 'Live on the platform',

  'home.statsOpportunities': 'Live opportunities',
  'home.statsValue': 'Value listed',
  'home.statsVerified': 'Verified listings',
  'home.statsMarkets': 'Markets covered',
  'home.statsFootnote': 'Counted live from the platform',
  'home.statsStructures': 'partnership structures supported',
  'home.statsMandate': 'active mandate',
  'home.statsMandates': 'active mandates',

  'home.dealsEyebrow': 'Open now',
  'home.dealsTitle': 'Currently seeking partners',
  'home.dealsBrowseAll': 'Browse all opportunities',

  'home.sidesEyebrow': 'Two sides, one deal room',
  'home.sidesTitle': 'Whichever side of the table you sit on',
  'home.ownersTitle': 'For owners & authorities',
  'home.ownerStep1': 'List your opportunity privately, in guided steps',
  'home.ownerStep2': 'See what it could become — feasibility, valuation and structure options',
  'home.ownerStep3': 'Approve who sees it, then compare benchmarked offers side by side',
  'home.ownerCta': 'List an opportunity',
  'home.capitalTitle': 'For developers & investors',
  'home.capitalStep1': 'Define your mandate once — sectors, markets, ticket size, target return',
  'home.capitalStep2': 'Receive matched, underwriting-ready opportunities with an explainable score',
  'home.capitalStep3': 'Model, request access and submit an offer in one deal room',
  'home.capitalCta': 'Define a mandate',

  'home.capabilitiesEyebrow': 'Built for institutional trust',
  'home.capabilitiesTitle': 'Every number the platform produces can be explained',
  'home.capFitTitle': 'Explainable Fit Score',
  'home.capFitDesc':
    'Two-sided matching that scores every opportunity–mandate pair and shows which factors earned the points. No black box.',
  'home.capAnonTitle': 'Anonymous until approved',
  'home.capAnonDesc':
    'Exact location and owner identity stay sealed until the owner approves access and an NDA is signed. Approval alone reveals nothing.',
  'home.capRoomTitle': 'Permission-controlled data room',
  'home.capRoomDesc':
    'A structured vault where every folder carries its own access level and every download is authorised and written to an audit trail.',
  'home.capModelTitle': 'Feasibility & valuation',
  'home.capModelDesc':
    'IRR, NPV, payback and break-even, plus valuation by method — each run storing its inputs and assumptions so results reproduce.',
  'home.capPassportTitle': 'Opportunity Passport',
  'home.capPassportDesc':
    'A tiered verification record from T0 to T5, showing which facts were checked, by whom, and what remains open.',
  'home.capStructureTitle': 'Structure recommender',
  'home.capStructureDesc':
    'Ranks JV, PPP and concession formulas against your deal profile, with a stated reason for each placement.',

  'home.marketsEyebrow': 'Market intelligence',
  'home.marketsTitle': 'How partnerships work, market by market',
  'home.marketsAll': 'All {count} markets',
  'home.marketsOwnerShare': 'owner share',

  'home.finalTitle': 'Ready to find your partner?',
  'home.finalBody':
    'Create an account and list an opportunity or define a mandate. Your confidential details stay sealed until you decide otherwise.',

  // ---------------------------------------------------------------- footer
  'footer.blurb':
    'A meeting place for landowners, governments and asset holders on one side, and developers, investors and contractors on the other — with explainable matching, graded verification and controlled disclosure between them.',
  'footer.liveFigures': 'Platform figures are counted live, never hard-coded',
  'footer.platform': 'Platform',
  'footer.intelligence': 'Intelligence',
  'footer.getStarted': 'Get started',
  'footer.tenderNotices': 'Tender notices',
  'footer.structureLibrary': 'Structure library',
  'footer.structuresExplained': 'Deal structures explained',
  'footer.verificationTiers': 'Verification tiers',
  'footer.listOpportunity': 'List an opportunity',
  'footer.defineMandate': 'Define a mandate',
  'footer.publishTender': 'Publish a tender',
  'footer.activeMarkets': 'Active markets',
  'footer.covered': 'covered',
  'footer.rights': 'All rights reserved.',
  'footer.disclaimer':
    'Market intelligence and modelling — not legal, tax or investment advice. Verify with qualified local advisors before committing to a structure.',

  // ---------------------------------------------------------------- common
  'common.language': 'Language',
  'common.learnMore': 'Learn more',
  'common.createAccount': 'Create your account',
  'common.browseMarket': 'Browse market',
  'common.tryAgain': 'Try again',
  'common.retrying': 'Retrying…',
  'common.loading': 'Loading…',
  'common.clear': 'Clear',
  'common.search': 'Search…',
  'common.previous': 'Previous',
  'common.next': 'Next',
  'common.page': 'Page',
  'common.of': 'of',
  'common.backToHome': 'Back to home',
  'common.notAdvice': 'Educational summaries only — not legal, tax or investment advice.',

  // ---------------------------------------------------------------- errors
  'error.title': 'This page could not be loaded',
  'error.eyebrow': 'Something went wrong',
  'error.body':
    'The error has been logged. Trying again often resolves it — if not, the rest of the site is still available.',
  'error.reference': 'Reference',
  'error.notFoundTitle': 'This page does not exist',
  'error.notFoundBody':
    'The link may be out of date, or the item may have been withdrawn or is not shared with you.',
  'error.loadFailed': 'Could not load {what}',
  'error.loadFailedBody':
    'This is usually temporary. Nothing has been lost — the data could not be reached just now.',

  // -------------------------------------------------------------- listings
  'opportunities.eyebrow': 'The market',
  'opportunities.title': 'Opportunities',
  'opportunities.published': 'published',
  'opportunities.one': 'opportunity',
  'opportunities.many': 'opportunities',
  'opportunities.lede':
    'across the platform. Exact location and owner identity stay sealed until the owner approves access and an NDA is signed.',
  'opportunities.searchPlaceholder': 'Search opportunities…',
  'opportunities.allSectors': 'All sectors',
  'opportunities.allOwners': 'All owner types',
  'opportunities.anyRisk': 'Any risk level',
  'opportunities.emptyTitle': 'Nothing matches those filters',
  'opportunities.emptyBody':
    'Try widening the sector, owner type or risk level — or clear the filters to see the whole market.',
  'opportunities.gdv': 'GDV',
  'opportunities.investment': 'Investment',
  'opportunities.targetIrr': 'Target IRR',
  'opportunities.landArea': 'Land area',
  'opportunities.backToAll': 'Opportunities',
  'opportunities.confidential': 'Confidential',
  'opportunities.investorDashboard': 'Investor dashboard',

  'tenders.eyebrow': 'Public procurement',
  'tenders.title': 'Tender notices',
  'tenders.lede':
    'Open procurement from government and semi-government authorities. Every notice publishes its requirements, risk allocation and evaluation criteria up front — before a single bid is opened.',
  'tenders.openForBids': 'Open for bids',
  'tenders.closed': 'Closed & in progress',
  'tenders.allCountries': 'All countries',
  'tenders.emptyTitle': 'No tender notices published yet',
  'tenders.emptyBody':
    'Government and semi-government authorities publish procurement here.',
  'tenders.estimatedValue': 'Estimated value',

  'countries.eyebrow': 'Market intelligence',
  'countries.title': 'Country intelligence',
  'countries.lede':
    'How land partnerships actually work in each market — the structures in common use, what an owner typically retains, and the legal mechanics that shape a deal.',
  'countries.market': 'market',
  'countries.markets': 'markets',
  'countries.ownerShare': 'Typical owner share',
  'countries.buildCost': 'Build cost',
  'countries.salePrice': 'Sale price (mid-market)',
  'countries.structuresInUse': 'Structures in common use',
  'countries.titleSystem': 'Title system',
  'countries.foreignOwnership': 'Foreign ownership',
  'countries.considerations': 'Structuring considerations',
  'countries.authorities': 'Key authorities',
  'countries.exploring': 'Exploring a venture in',
  'countries.exploringBody':
    'List an opportunity or define a mandate and get matched with an explainable score.',
  'countries.viewOpportunities': 'View opportunities here',
  'countries.getStarted': 'Get started',
  'countries.disclaimer':
    'Indicative planning ranges for orientation only — not legal, tax or investment advice. Verify with qualified local advisors before committing to a structure.',

  'structures.eyebrow': 'Structure library',
  'structures.title': 'Partnership structures',
  'structures.lede':
    'There is rarely one right way to structure a venture. These are the formulas in common use — what the owner receives, who carries the risk, and when each tends to fit.',
  'structures.supported': 'structures supported',
  'structures.explained': 'explained',
  'structures.ownerGets': 'Owner gets',
  'structures.risk': 'Risk',
  'structures.bestFor': 'Best for',
  'structures.notSure': 'Not sure which structure fits?',
  'structures.notSureBody':
    'Describe your opportunity and the recommender ranks the formulas against it, with a stated reason for each placement.',
  'structures.tryRecommender': 'Try the recommender',

  // ------------------------------------------------------------------ auth
  'auth.signInEyebrow': 'Sign in',
  'auth.welcomeBack': 'Welcome back',
  'auth.signInLede': 'Pick up where you left off — your opportunities, mandates and deal rooms.',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signingIn': 'Signing in…',
  'auth.newHere': 'New here?',
  'auth.createAccountLink': 'Create an account',
  'auth.registerEyebrow': 'Create account',
  'auth.joinTitle': 'Join the platform',
  'auth.joinLede': 'One account, whichever side of the venture you sit on.',
  'auth.joiningAs': 'I am joining as',
  'auth.fullName': 'Full name',
  'auth.country': 'Country',
  'auth.selectCountry': 'Select a country…',
  'auth.minChars': 'Minimum 8 characters.',
  'auth.creatingAccount': 'Creating account…',
  'auth.createAccountBtn': 'Create account',
  'auth.haveAccount': 'Already have an account?',
  'auth.panelTitle': 'One deal room for both sides of a venture',
  'auth.panelBody':
    'connects landowners, governments and asset holders with the developers, investors and contractors who can deliver — under controlled disclosure.',

  // ------------------------------------------------------------- dashboard
  'dash.overview': 'Overview',
  'dash.browseMarket': 'Browse market',
  'dash.deals': 'Deals',
  'dash.myOpportunities': 'My opportunities',
  'dash.myMandates': 'My mandates',
  'dash.myOffers': 'My offers',
  'dash.myTenders': 'My tenders',
  'dash.myBids': 'My bids',
  'dash.consortiums': 'Consortiums',
  'dash.accessRequests': 'Access requests',
  'dash.aiTools': 'AI tools',
  'dash.feasibility': 'Feasibility',
  'dash.valuation': 'Valuation',
  'dash.estimate': 'Estimate',
  'dash.structure': 'Structure',
  'dash.administration': 'Administration',
  'dash.backOffice': 'Back office',
  'dash.welcome': 'Welcome back',
  'dash.newOpportunity': 'New opportunity',
  'dash.newMandate': 'New mandate',
  'dash.newTender': 'New tender',
} as const;

/** Widened to `string` — a translation must be allowed to differ from the
 *  English literal it replaces, or every locale file fails to type-check. */
export type Messages = { [K in keyof typeof en]: string };
export type MessageKey = keyof Messages;
