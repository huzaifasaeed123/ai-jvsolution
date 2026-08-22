import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role, AccessLevel, User } from '@prisma/client';

/** Minimal fake user row. */
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'jane@example.com',
    passwordHash: 'x',
    fullName: 'Jane',
    role: Role.OWNER,
    accessLevel: AccessLevel.REGISTERED,
    country: 'AE',
    companyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<Pick<UsersService, 'findByEmail' | 'findById' | 'create'>>;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') } as unknown as JwtService;
    const config = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    service = new AuthService(users as unknown as UsersService, jwt, config);
  });

  it('rejects registration when the email already exists', async () => {
    users.findByEmail.mockResolvedValue(makeUser());
    await expect(
      service.register({ fullName: 'Jane', email: 'jane@example.com', password: 'strongpass123', role: Role.OWNER }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses self-registration as ADMIN (privilege-escalation guard)', async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(
      service.register({ fullName: 'Sneaky', email: 'a@x.com', password: 'strongpass123', role: Role.ADMIN }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(users.create).not.toHaveBeenCalled();
  });

  it('registers a new user and never returns the password hash', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockImplementation(async (data) =>
      makeUser({ email: data.email as string, passwordHash: 'hashed' }),
    );

    const result = await service.register({
      fullName: 'Jane',
      email: 'jane@example.com',
      password: 'strongpass123',
      role: Role.OWNER,
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects login with a wrong password', async () => {
    const hash = await argon2.hash('correct-password');
    users.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));

    await expect(
      service.login({ email: 'jane@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs in with the correct password', async () => {
    const hash = await argon2.hash('correct-password');
    users.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));

    const result = await service.login({ email: 'jane@example.com', password: 'correct-password' });
    expect(result.user.email).toBe('jane@example.com');
    expect(result.accessToken).toBeDefined();
  });
});
