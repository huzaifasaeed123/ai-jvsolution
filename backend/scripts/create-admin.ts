/**
 * Admin setup script. Admins cannot self-register, so use this to create or
 * promote one directly.
 *
 *   npx ts-node scripts/create-admin.ts <email> <password> [fullName]
 */
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  const [email, password, fullName] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: ts-node scripts/create-admin.ts <email> <password> [fullName]');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { role: Role.ADMIN, passwordHash },
      create: {
        email: email.toLowerCase(),
        passwordHash,
        fullName: fullName ?? 'Administrator',
        role: Role.ADMIN,
      },
    });
    console.log(`✔ Admin ready: ${user.email} (${user.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
