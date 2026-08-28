import type { Locale } from './config';

/**
 * Message catalogs. `en` is the complete reference catalog and its keys define
 * the Messages type; other locales are Partial and fall back to English per key.
 *
 * Market/corpus content (country intelligence, structure library) intentionally
 * stays in English for now — only UI chrome is translated at this stage.
 */
const en = {
  'nav.howItWorks': 'How it works',
  'nav.opportunities': 'Opportunities',
  'nav.countries': 'Country intelligence',
  'nav.structures': 'Structures',
  'nav.tenders': 'Tenders',
  'nav.dashboard': 'Dashboard',
  'nav.signIn': 'Sign in',
  'nav.join': 'Join',
  'nav.signOut': 'Sign out',

  'home.badge': 'Two-sided JV, PPP & concession platform',
  'home.ctaOwner': 'I own land or assets',
  'home.ctaDeveloper': 'I develop or invest',
  'home.statsOpportunities': 'Live opportunities',
  'home.statsValue': 'Project value listed',
  'home.statsMandates': 'Active mandates',
  'home.statsMarkets': 'Markets covered',

  'common.language': 'Language',
  'common.learnMore': 'Learn more',
  'common.createAccount': 'Create your account',
  'common.browseMarket': 'Browse market',
  'common.notAdvice':
    'Educational summaries only — not legal, tax or investment advice.',
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

/** Partial catalogs — anything absent falls back to English. */
const ar: Partial<Messages> = {
  'nav.tenders': 'المناقصات',
  'nav.howItWorks': 'كيف يعمل',
  'nav.opportunities': 'الفرص',
  'nav.countries': 'معلومات الدول',
  'nav.structures': 'الهياكل',
  'nav.dashboard': 'لوحة التحكم',
  'nav.signIn': 'تسجيل الدخول',
  'nav.join': 'انضم',
  'nav.signOut': 'تسجيل الخروج',
  'common.language': 'اللغة',
};

const ur: Partial<Messages> = {
  'nav.tenders': 'ٹینڈرز',
  'nav.howItWorks': 'یہ کیسے کام کرتا ہے',
  'nav.opportunities': 'مواقع',
  'nav.countries': 'ممالک کی معلومات',
  'nav.structures': 'ڈھانچے',
  'nav.dashboard': 'ڈیش بورڈ',
  'nav.signIn': 'سائن ان',
  'nav.join': 'شامل ہوں',
  'nav.signOut': 'سائن آؤٹ',
  'common.language': 'زبان',
};

const fr: Partial<Messages> = {
  'nav.tenders': "Appels d'offres",
  'nav.howItWorks': 'Comment ça marche',
  'nav.opportunities': 'Opportunités',
  'nav.countries': 'Intelligence pays',
  'nav.structures': 'Structures',
  'nav.dashboard': 'Tableau de bord',
  'nav.signIn': 'Se connecter',
  'nav.join': 'Rejoindre',
  'nav.signOut': 'Se déconnecter',
  'common.language': 'Langue',
};

const es: Partial<Messages> = {
  'nav.tenders': 'Licitaciones',
  'nav.howItWorks': 'Cómo funciona',
  'nav.opportunities': 'Oportunidades',
  'nav.countries': 'Inteligencia de países',
  'nav.structures': 'Estructuras',
  'nav.dashboard': 'Panel',
  'nav.signIn': 'Iniciar sesión',
  'nav.join': 'Únete',
  'nav.signOut': 'Cerrar sesión',
  'common.language': 'Idioma',
};

const de: Partial<Messages> = {
  'nav.tenders': 'Ausschreibungen',
  'nav.howItWorks': 'So funktioniert es',
  'nav.opportunities': 'Chancen',
  'nav.countries': 'Länderinformationen',
  'nav.structures': 'Strukturen',
  'nav.dashboard': 'Übersicht',
  'nav.signIn': 'Anmelden',
  'nav.join': 'Beitreten',
  'nav.signOut': 'Abmelden',
  'common.language': 'Sprache',
};

const zh: Partial<Messages> = {
  'nav.tenders': '招标',
  'nav.howItWorks': '运作方式',
  'nav.opportunities': '机会',
  'nav.countries': '国家情报',
  'nav.structures': '结构',
  'nav.dashboard': '仪表板',
  'nav.signIn': '登录',
  'nav.join': '加入',
  'nav.signOut': '退出',
  'common.language': '语言',
};

const CATALOGS: Record<Locale, Partial<Messages>> = { en, ar, ur, fr, es, de, zh };

/** Resolve a full catalog for a locale, English-filled. */
export function getMessages(locale: Locale): Messages {
  return { ...en, ...(CATALOGS[locale] ?? {}) };
}

/** Coverage %, useful for tracking translation progress. */
export function coverage(locale: Locale): number {
  const total = Object.keys(en).length;
  const translated = Object.keys(CATALOGS[locale] ?? {}).length;
  return Math.round((translated / total) * 100);
}
