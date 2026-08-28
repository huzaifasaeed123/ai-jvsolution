/**
 * Demo organisations and people.
 *
 * Names are invented. Nothing here is modelled on a real company or a real
 * public authority — a demo dataset must not put words in a real institution's
 * mouth, and these authority accounts publish tenders and award contracts.
 *
 * Ids are stable, human-readable and prefixed `sd-`. That makes the seed
 * idempotent (re-running upserts rather than duplicating) and lets a reset
 * remove exactly the seeded rows, leaving anything created by hand untouched.
 */
import { Role, AccessLevel } from '@prisma/client';
import { avatarFor, logoFor } from './media';

export const SEED_PREFIX = 'sd-';

/** One password for every demo account, so any role can be tried instantly. */
export const DEMO_PASSWORD = 'Demo!2026';

export interface SeedCompany {
  id: string;
  name: string;
  country: string;
  /** Brand hex (no leading hash) used for the generated logo mark. */
  brand: string;
}

export const COMPANIES: SeedCompany[] = [
  // --- Public / semi-public bodies (invented) ---
  { id: 'sd-co-gma', name: 'Gulf Metropolitan Authority', country: 'AE', brand: '0f4c81' },
  { id: 'sd-co-npdc', name: 'Northern Province Development Commission', country: 'SA', brand: '1b6b4c' },
  { id: 'sd-co-ndda', name: 'Nile Delta Development Agency', country: 'EG', brand: 'a8541b' },
  { id: 'sd-co-trta', name: 'Thames Regional Transport Authority', country: 'GB', brand: '3b3f8c' },
  { id: 'sd-co-rvsa', name: 'Rhine Valley Services Agency', country: 'DE', brand: '2f5d62' },
  { id: 'sd-co-icdb', name: 'Indus City Development Board', country: 'PK', brand: '7a3b6e' },

  // --- Owners / asset holders ---
  { id: 'sd-co-emch', name: 'Emirates Coastal Holdings', country: 'AE', brand: '134e6f' },
  { id: 'sd-co-lusa', name: 'Lusitania Asset Management', country: 'PT', brand: '8c3b2f' },
  { id: 'sd-co-atlb', name: 'Atlas Bay Ventures', country: 'ES', brand: 'b8642a' },

  // --- Developers / contractors / operators ---
  { id: 'sd-co-sol', name: 'Solstice Infrastructure Group', country: 'AE', brand: '1f4e79' },
  { id: 'sd-co-nwd', name: 'Northwind Development Holdings', country: 'DE', brand: '344e5c' },
  { id: 'sd-co-aur', name: 'Aurora Urban Developments', country: 'SA', brand: '6b4c2a' },
  { id: 'sd-co-ced', name: 'Cedarline Contracting', country: 'EG', brand: '4a5d3a' },
  { id: 'sd-co-idd', name: 'Indus Delta Developers', country: 'PK', brand: '2e6b5e' },
  { id: 'sd-co-srif', name: 'Silk Road Infrastructure', country: 'CN', brand: '8a2f2f' },

  // --- Investors / funds ---
  { id: 'sd-co-mcp', name: 'Meridian Capital Partners', country: 'GB', brand: '20304a' },
  { id: 'sd-co-bhi', name: 'Blue Harbour Investments', country: 'US', brand: '15496b' },
  { id: 'sd-co-gmc', name: 'Ganges Metro Capital', country: 'IN', brand: '7a4b1f' },
  { id: 'sd-co-sahr', name: 'Sahara Renewables Fund', country: 'EG', brand: 'a06a1c' },
  { id: 'sd-co-cvf', name: 'Cordillera Value Fund', country: 'FR', brand: '3f5b4a' },
];

export interface SeedUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessLevel: AccessLevel;
  country: string;
  companyId: string;
}

/**
 * 26 accounts. Every role is represented, every rung of the access ladder is
 * held by someone, and the countries match the twelve that the country
 * intelligence reference covers — so filters and country pages all have
 * something real to show.
 */
export const USERS: SeedUser[] = [
  // --- Platform administration ---
  { id: 'sd-u-admin1', email: 'admin.demo@jvsolution.test', fullName: 'Amina Rashid', role: Role.ADMIN, accessLevel: AccessLevel.TRANSACTION, country: 'AE', companyId: 'sd-co-gma' },
  { id: 'sd-u-admin2', email: 'ops.demo@jvsolution.test', fullName: 'Thomas Bergmann', role: Role.ADMIN, accessLevel: AccessLevel.TRANSACTION, country: 'DE', companyId: 'sd-co-rvsa' },

  // --- Government authorities (publish tenders, award concessions) ---
  { id: 'sd-u-gov-ae', email: 'authority.ae@jvsolution.test', fullName: 'Khalid Al Mazrouei', role: Role.GOVERNMENT, accessLevel: AccessLevel.TRANSACTION, country: 'AE', companyId: 'sd-co-gma' },
  { id: 'sd-u-gov-sa', email: 'authority.sa@jvsolution.test', fullName: 'Nourah Al Qahtani', role: Role.GOVERNMENT, accessLevel: AccessLevel.TRANSACTION, country: 'SA', companyId: 'sd-co-npdc' },
  { id: 'sd-u-gov-eg', email: 'authority.eg@jvsolution.test', fullName: 'Mostafa Ibrahim', role: Role.GOVERNMENT, accessLevel: AccessLevel.DUE_DILIGENCE, country: 'EG', companyId: 'sd-co-ndda' },
  { id: 'sd-u-gov-gb', email: 'authority.gb@jvsolution.test', fullName: 'Eleanor Whitfield', role: Role.GOVERNMENT, accessLevel: AccessLevel.TRANSACTION, country: 'GB', companyId: 'sd-co-trta' },
  { id: 'sd-u-gov-pk', email: 'authority.pk@jvsolution.test', fullName: 'Sana Iqbal', role: Role.GOVERNMENT, accessLevel: AccessLevel.NDA, country: 'PK', companyId: 'sd-co-icdb' },

  // --- Owners / landowners / asset holders ---
  { id: 'sd-u-own-ae', email: 'owner.ae@jvsolution.test', fullName: 'Faisal Al Nuaimi', role: Role.OWNER, accessLevel: AccessLevel.VERIFIED, country: 'AE', companyId: 'sd-co-emch' },
  { id: 'sd-u-own-pt', email: 'owner.pt@jvsolution.test', fullName: 'Ines Carvalho', role: Role.OWNER, accessLevel: AccessLevel.VERIFIED, country: 'PT', companyId: 'sd-co-lusa' },
  { id: 'sd-u-own-es', email: 'owner.es@jvsolution.test', fullName: 'Javier Dominguez', role: Role.OWNER, accessLevel: AccessLevel.REGISTERED, country: 'ES', companyId: 'sd-co-atlb' },
  { id: 'sd-u-own-sa', email: 'owner.sa@jvsolution.test', fullName: 'Abdulaziz Al Harbi', role: Role.OWNER, accessLevel: AccessLevel.VERIFIED, country: 'SA', companyId: 'sd-co-npdc' },
  { id: 'sd-u-own-eg', email: 'owner.eg@jvsolution.test', fullName: 'Yasmin Fahmy', role: Role.OWNER, accessLevel: AccessLevel.NDA, country: 'EG', companyId: 'sd-co-ndda' },
  { id: 'sd-u-own-gb', email: 'owner.gb@jvsolution.test', fullName: 'Marcus Ellery', role: Role.OWNER, accessLevel: AccessLevel.VERIFIED, country: 'GB', companyId: 'sd-co-trta' },

  // --- Developers / contractors / operators ---
  { id: 'sd-u-dev-ae', email: 'developer.ae@jvsolution.test', fullName: 'Rania Haddad', role: Role.DEVELOPER, accessLevel: AccessLevel.DUE_DILIGENCE, country: 'AE', companyId: 'sd-co-sol' },
  { id: 'sd-u-dev-de', email: 'developer.de@jvsolution.test', fullName: 'Lukas Vogel', role: Role.DEVELOPER, accessLevel: AccessLevel.NDA, country: 'DE', companyId: 'sd-co-nwd' },
  { id: 'sd-u-dev-sa', email: 'developer.sa@jvsolution.test', fullName: 'Turki Al Otaibi', role: Role.DEVELOPER, accessLevel: AccessLevel.VERIFIED, country: 'SA', companyId: 'sd-co-aur' },
  { id: 'sd-u-dev-eg', email: 'developer.eg@jvsolution.test', fullName: 'Hala Mansour', role: Role.DEVELOPER, accessLevel: AccessLevel.NDA, country: 'EG', companyId: 'sd-co-ced' },
  { id: 'sd-u-dev-pk', email: 'developer.pk@jvsolution.test', fullName: 'Bilal Chaudhry', role: Role.DEVELOPER, accessLevel: AccessLevel.REGISTERED, country: 'PK', companyId: 'sd-co-idd' },
  { id: 'sd-u-dev-cn', email: 'developer.cn@jvsolution.test', fullName: 'Wei Zhang', role: Role.DEVELOPER, accessLevel: AccessLevel.VERIFIED, country: 'CN', companyId: 'sd-co-srif' },
  { id: 'sd-u-dev-fr', email: 'developer.fr@jvsolution.test', fullName: 'Camille Rousseau', role: Role.DEVELOPER, accessLevel: AccessLevel.REGISTERED, country: 'FR', companyId: 'sd-co-cvf' },

  // --- Investors / funds ---
  { id: 'sd-u-inv-gb', email: 'investor.gb@jvsolution.test', fullName: 'Oliver Brandt', role: Role.INVESTOR, accessLevel: AccessLevel.DUE_DILIGENCE, country: 'GB', companyId: 'sd-co-mcp' },
  { id: 'sd-u-inv-us', email: 'investor.us@jvsolution.test', fullName: 'Danielle Ortiz', role: Role.INVESTOR, accessLevel: AccessLevel.TRANSACTION, country: 'US', companyId: 'sd-co-bhi' },
  { id: 'sd-u-inv-in', email: 'investor.in@jvsolution.test', fullName: 'Arjun Nair', role: Role.INVESTOR, accessLevel: AccessLevel.NDA, country: 'IN', companyId: 'sd-co-gmc' },
  { id: 'sd-u-inv-eg', email: 'investor.eg@jvsolution.test', fullName: 'Omar Selim', role: Role.INVESTOR, accessLevel: AccessLevel.VERIFIED, country: 'EG', companyId: 'sd-co-sahr' },
  { id: 'sd-u-inv-fr', email: 'investor.fr@jvsolution.test', fullName: 'Sylvie Marchand', role: Role.INVESTOR, accessLevel: AccessLevel.NDA, country: 'FR', companyId: 'sd-co-cvf' },
  { id: 'sd-u-inv-cn', email: 'investor.cn@jvsolution.test', fullName: 'Li Chen', role: Role.INVESTOR, accessLevel: AccessLevel.PUBLIC, country: 'CN', companyId: 'sd-co-srif' },
];

export function companyLogo(c: SeedCompany): string {
  return logoFor(c.name, c.brand);
}

export function userAvatar(u: SeedUser): string {
  return avatarFor(u.id);
}

/** Look up a seeded user by id; throws loudly rather than seeding a bad FK. */
export function userById(id: string): SeedUser {
  const u = USERS.find((x) => x.id === id);
  if (!u) throw new Error(`Seed error: unknown user id "${id}"`);
  return u;
}
