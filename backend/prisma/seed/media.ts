/**
 * Demo imagery.
 *
 * Every URL is a direct link with explicit width/height, so the demo renders at
 * a predictable size and never pulls a multi-megabyte original. Photo IDs were
 * each checked to resolve and were catalogued by subject, so a seaport
 * opportunity gets a seaport photo rather than a random building.
 *
 * This module exists ONLY for seeded demo data. Real listings will carry
 * operator-uploaded imagery streamed through the API.
 */

const UNSPLASH = 'https://images.unsplash.com/photo-';
const DICEBEAR = 'https://api.dicebear.com/9.x';

/** Cover images are 16:9 to match the CoverImage component's aspect box. */
export const COVER_W = 1200;
export const COVER_H = 675;
/** Gallery thumbnails are 4:3. */
export const GALLERY_W = 800;
export const GALLERY_H = 600;

function photo(id: string, w: number, h: number): string {
  return `${UNSPLASH}${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
}

// --- Catalogued by subject -------------------------------------------------

const LAND = ['1470071459604-3b5ec3a7fe05', '1497436072909-60f360e1d4b1', '1577495508048-b635879837f1'];
const HOUSING = [
  '1449844908441-8829872d2607', '1460317442991-0ec209397118', '1494526585095-c41746248156',
  '1523192193543-6e7296d960e4', '1545324418-cc1a3fa10c00', '1600585154340-be6161a56a0c',
];
const HOUSING_MASS = ['1516156008625-3a9d6067fab5', '1523192193543-6e7296d960e4', '1460317442991-0ec209397118'];
const INTERIORS = ['1493809842364-78817add7ffb', '1600607687939-ce8a6c25118c'];
const OFFICE = [
  '1486406146926-c627a92ad1ab', '1497366754035-f200968a6e72', '1497366811353-6870744d04b2',
  '1518005020951-eccb494ad742', '1552664730-d307ca884978', '1590650153855-d9e808231d41',
];
const CITY = ['1477959858617-67f85cf4f1df', '1486325212027-8081e485255e', '1512453979798-5ea266f8880c', '1519501025264-65ba15a82390'];
const HOSPITALITY = ['1580587771525-78b9dba3b914', '1494526585095-c41746248156'];
const CONSTRUCTION = [
  '1504307651254-35680f356dfd', '1508450859948-4e04fabaa4ea', '1516216628859-9bccecab13ca',
  '1541888946425-d81bb19240f5', '1565008447742-97f6f38c985c',
];
const LOGISTICS = ['1590069261209-f8e9b8642343', '1519003722824-194d4455a60c', '1558618666-fcd25c85cd64'];
const HEALTHCARE = ['1516549655169-df83a0774514'];
const CIVIC = ['1487958449943-2429e8be8625', '1524230572899-a752b3835840', '1466442929976-97f336a657be'];
const AIRPORT = ['1436491865332-7a61a109cc05', '1474302770737-173ee21bab63'];
const SEAPORT = ['1578575437130-527eed3abbec'];
const ROADS = ['1519003722824-194d4455a60c', '1512453979798-5ea266f8880c', '1544620347-c4fd4a3d5957'];
const UTILITIES = ['1473341304170-971dccb5ac1e', '1487875961445-47a00398c267', '1513828583688-c52646db42da'];
const DIGITAL = ['1581094794329-c8112a89af12', '1518005020951-eccb494ad742'];
const PARKING = ['1590674899484-d5640e854abe', '1489515217757-5fd1be406fef', '1544620347-c4fd4a3d5957'];
const SPORT = ['1461896836934-ffe607ba8211'];

/** Sector code → candidate photos, ordered best-fit first. */
const BY_SECTOR: Record<string, string[]> = {
  'private-land': [...LAND, ...HOUSING],
  'government-land': [...LAND, ...CIVIC],
  'semi-government-asset': [...OFFICE, ...CIVIC],
  residential: [...HOUSING, ...INTERIORS],
  commercial: [...OFFICE, ...CITY],
  retail: [...CITY, ...OFFICE],
  office: OFFICE,
  'mixed-use': [...CITY, ...CONSTRUCTION],
  hospitality: [...HOSPITALITY, ...INTERIORS],
  'industrial-logistics': LOGISTICS,
  healthcare: [...HEALTHCARE, ...CIVIC],
  education: [...CIVIC, ...OFFICE],
  'government-housing': [...HOUSING_MASS, ...CONSTRUCTION],
  airport: AIRPORT,
  seaport: [...SEAPORT, ...LOGISTICS],
  'roads-rail-metro': ROADS,
  'utilities-energy-water': UTILITIES,
  'smart-city-digital': [...DIGITAL, ...CITY],
  'data-centre': [...DIGITAL, ...LOGISTICS],
  'parking-transport': PARKING,
  'waste-district-cooling': [...UTILITIES, ...LOGISTICS],
  'public-municipal': [...CIVIC, ...CITY],
  'tourism-culture-sports': [...SPORT, ...CIVIC, ...HOSPITALITY],
};

const FALLBACK = [...CITY, ...CONSTRUCTION];

function poolFor(sector: string): string[] {
  const p = BY_SECTOR[sector];
  return p && p.length ? p : FALLBACK;
}

/**
 * Cover for a sector. `variant` walks the pool so two opportunities in the same
 * sector do not show the identical photo.
 */
export function coverFor(sector: string, variant = 0): string {
  const pool = poolFor(sector);
  return photo(pool[variant % pool.length], COVER_W, COVER_H);
}

/** `count` distinct gallery shots, skipping whichever photo became the cover. */
export function galleryFor(sector: string, variant = 0, count = 3): string[] {
  const pool = poolFor(sector);
  const out: string[] = [];
  for (let i = 1; i <= count && i < pool.length; i += 1) {
    out.push(photo(pool[(variant + i) % pool.length], GALLERY_W, GALLERY_H));
  }
  return out;
}

/** Illustrated person, stable for a given seed. */
export function avatarFor(seed: string): string {
  return `${DICEBEAR}/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e8e5df,d9e3f0,ffd5dc,c0e5c8&radius=50`;
}

/** Initials mark standing in for a corporate logo. */
export function logoFor(name: string, bg: string): string {
  return `${DICEBEAR}/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}&radius=12&fontWeight=600`;
}
