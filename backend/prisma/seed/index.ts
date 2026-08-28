/**
 * Demo seed.
 *
 *   npm run seed                      # upsert demo data
 *   npm run seed -- --reset           # remove demo data first
 *   npm run seed -- --only=identity   # run selected steps only
 *
 * Three properties this seed holds to:
 *
 * 1. IDEMPOTENT — every row has a stable `sd-` id and is upserted, so running
 *    it twice produces the same database, not duplicates.
 * 2. SURGICAL — a reset deletes only `sd-` rows. Accounts and opportunities
 *    created by hand survive, including the admin you already log in with.
 * 3. GUARDED — it refuses to touch anything that looks like production.
 */
import * as argon2 from 'argon2';
import { prisma, flags, shouldRun } from './context';
import { COMPANIES, USERS, DEMO_PASSWORD, companyLogo, userAvatar } from './identity';
import { seedOpportunities } from './opportunities';
import { seedDealFlow } from './dealflow';
import { seedProcurement } from './procurement';

// --- Safety -----------------------------------------------------------------

/**
 * Seeding writes fictional companies and government authorities. Harmless in
 * dev, actively misleading in production — so refuse unless the database is
 * local and NODE_ENV is not production.
 */
function assertSafeTarget(): void {
  if (flags.force) {
    console.warn('!  --force given: skipping environment safety checks.');
    return;
  }
  const url = process.env.DATABASE_URL ?? '';
  if (!url) throw new Error('DATABASE_URL is not set.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data with NODE_ENV=production.');
  }
  if (!/@(localhost|127\.0\.0\.1|host\.docker\.internal)[:/]/.test(url)) {
    throw new Error(
      'Refusing to seed: DATABASE_URL does not point at a local database. ' +
        'Pass --force only if you are certain this target is disposable.',
    );
  }
}

// --- Reset ------------------------------------------------------------------

/**
 * Delete seeded rows only, children before parents so no FK is ever orphaned.
 * One statement per table regardless of relation depth.
 */
async function resetSeedData(): Promise<void> {
  const tables = [
    'ConsortiumMember', 'Bid', 'SwissChallenge', 'Addendum', 'Clarification', 'Tender',
    'Consortium', 'Offer', 'DocumentVersion', 'Document', 'Folder', 'DueDiligenceItem',
    'VerificationRecord', 'FeasibilityRun', 'ValuationRun', 'EstimateRun', 'AccessRequest',
    'AuditLog', 'Mandate', 'Opportunity', 'User', 'Company',
  ];
  let total = 0;
  for (const t of tables) {
    const n = await prisma.$executeRawUnsafe(`delete from "${t}" where id like $1`, 'sd-%');
    if (n > 0) {
      console.log(`  - ${t}: removed ${n}`);
      total += n;
    }
  }
  console.log(`  ${total} demo rows removed`);
}

// --- Identity ---------------------------------------------------------------

async function seedIdentity(): Promise<void> {
  // Every demo account shares one password, so hash it once instead of 26
  // times — argon2 is deliberately slow and the resulting hash is identical.
  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  for (const c of COMPANIES) {
    const data = { name: c.name, country: c.country, logoUrl: companyLogo(c) };
    await prisma.company.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }
  console.log(`  ${COMPANIES.length} companies`);

  for (const u of USERS) {
    const data = {
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      accessLevel: u.accessLevel,
      country: u.country,
      companyId: u.companyId,
      avatarUrl: userAvatar(u),
    };
    await prisma.user.upsert({
      where: { id: u.id },
      update: data,
      create: { id: u.id, passwordHash, ...data },
    });
  }
  const byRole = USERS.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});
  const summary = Object.entries(byRole)
    .map(([r, n]) => `${r} ${n}`)
    .join(', ');
  console.log(`  ${USERS.length} users (${summary})`);
}

// --- Entry point ------------------------------------------------------------

async function main(): Promise<void> {
  assertSafeTarget();
  console.log(`Seeding ${(process.env.DATABASE_URL ?? '').replace(/:[^:@]+@/, ':***@')}`);

  if (flags.reset) {
    console.log('\nRemoving existing demo data...');
    await resetSeedData();
  }

  const steps: [string, () => Promise<void>][] = [
    ['identity', seedIdentity],
    ['opportunities', seedOpportunities],
    ['dealflow', seedDealFlow],
    ['procurement', seedProcurement],
  ];

  for (const [name, run] of steps) {
    if (!shouldRun(name)) continue;
    console.log(`\n${name}...`);
    await run();
  }

  console.log(`\nDone. Demo accounts all use the password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e: unknown) => {
    console.error('\nSeed failed:', e instanceof Error ? e.stack : e);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
