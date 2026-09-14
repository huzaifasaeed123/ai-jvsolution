import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessLevel, Role, User, UserStatus } from '@prisma/client';
import { GoogleAuthService, GoogleProfile } from './google.service';
import { UsersRepository } from '../users/users.repository';

function makeUser(over: Partial<User> = {}): User {
  return {
    id: 'u-1',
    email: 'someone@example.com',
    passwordHash: 'argon2-hash',
    fullName: 'Existing User',
    role: Role.OWNER,
    roleConfirmed: true,
    accessLevel: AccessLevel.REGISTERED,
    country: 'AE',
    avatarUrl: null,
    googleId: null,
    status: UserStatus.ACTIVE,
    suspendedAt: null,
    suspendedReason: null,
    suspendedById: null,
    tokenVersion: 0,
    lastLoginAt: null,
    deletedAt: null,
    companyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

function profile(over: Partial<GoogleProfile> = {}): GoogleProfile {
  return {
    sub: 'google-sub-123',
    email: 'someone@example.com',
    email_verified: true,
    name: 'Someone Google',
    picture: 'https://lh3.googleusercontent.com/a/pic',
    ...over,
  };
}

describe('GoogleAuthService', () => {
  let repo: {
    findByGoogleId: jest.Mock;
    findByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  let service: GoogleAuthService;

  function build(enabled = true) {
    const config = {
      get: jest.fn((key: string) =>
        ({
          'google.enabled': enabled,
          'google.clientId': 'client-id',
          'google.clientSecret': 'client-secret',
          'google.redirectUri': 'http://localhost:3000/api/auth/google/callback',
        })[key],
      ),
    } as unknown as ConfigService;
    return new GoogleAuthService(config, repo as unknown as UsersRepository);
  }

  beforeEach(() => {
    repo = {
      findByGoogleId: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((data: Partial<User>) =>
        Promise.resolve(makeUser({ id: 'new-1', ...data })),
      ),
      update: jest.fn().mockImplementation((id: string, data: Partial<User>) =>
        Promise.resolve(makeUser({ id, ...data })),
      ),
    };
    service = build();
  });

  // --- case 1: returning Google user ---------------------------------------

  it('signs in a returning user matched on the Google subject', async () => {
    repo.findByGoogleId.mockResolvedValue(makeUser({ id: 'u-9', googleId: 'google-sub-123' }));
    const { user, isNew } = await service.resolveUser(profile());
    expect(isNew).toBe(false);
    expect(user.id).toBe('u-9');
    // Email lookup must not even be consulted — the subject is authoritative.
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  // --- case 2: link to an existing password account -------------------------

  it('links a verified Google email to an existing password account', async () => {
    repo.findByEmail.mockResolvedValue(makeUser({ id: 'u-5' }));
    const { user, isNew } = await service.resolveUser(profile({ email_verified: true }));
    expect(isNew).toBe(false);
    expect(user.id).toBe('u-5');
    expect(repo.update).toHaveBeenCalledWith('u-5', expect.objectContaining({
      googleId: 'google-sub-123',
    }));
    // Linking must never create a second account for the same person.
    expect(repo.create).not.toHaveBeenCalled();
  });

  // --- case 3: the takeover guard ------------------------------------------

  it('refuses to link when Google has not verified the email address', async () => {
    repo.findByEmail.mockResolvedValue(makeUser({ id: 'u-5' }));
    await expect(
      service.resolveUser(profile({ email_verified: false })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  // --- case 4: brand new account -------------------------------------------

  it('creates a passwordless account with an unconfirmed role', async () => {
    const { user, isNew } = await service.resolveUser(profile({ email: 'fresh@example.com' }));
    expect(isNew).toBe(true);
    const created = repo.create.mock.calls[0][0] as Partial<User>;
    expect(created.passwordHash).toBeNull();
    expect(created.roleConfirmed).toBe(false);
    expect(created.googleId).toBe('google-sub-123');
    expect(user.id).toBe('new-1');
  });

  it('falls back to the email local-part when Google sends no name', async () => {
    await service.resolveUser(profile({ email: 'fresh@example.com', name: undefined }));
    const created = repo.create.mock.calls[0][0] as Partial<User>;
    expect(created.fullName).toBe('fresh');
  });

  // --- lifecycle parity with the password path ------------------------------

  it('refuses a suspended account, so Google is not a second way in', async () => {
    repo.findByGoogleId.mockResolvedValue(
      makeUser({ status: UserStatus.SUSPENDED, suspendedReason: 'misuse' }),
    );
    await expect(service.resolveUser(profile())).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses a soft-deleted account', async () => {
    repo.findByGoogleId.mockResolvedValue(makeUser({ deletedAt: new Date() }));
    await expect(service.resolveUser(profile())).rejects.toThrow();
  });

  // --- profile sync ---------------------------------------------------------

  it('never overwrites an avatar the user already has', async () => {
    repo.findByGoogleId.mockResolvedValue(
      makeUser({ id: 'u-9', avatarUrl: 'https://own.example/me.png' }),
    );
    await service.resolveUser(profile());
    const data = repo.update.mock.calls[0][1] as Partial<User>;
    expect(data.avatarUrl).toBeUndefined();
  });

  // --- configuration gate ---------------------------------------------------

  it('reports disabled and refuses to build a URL without credentials', () => {
    const off = build(false);
    expect(off.enabled).toBe(false);
    expect(() => off.buildAuthUrl()).toThrow(ServiceUnavailableException);
  });

  it('requests only the non-sensitive scopes and a fresh state each time', () => {
    const a = service.buildAuthUrl();
    const b = service.buildAuthUrl();
    const url = new URL(a.url);
    expect(url.searchParams.get('scope')).toBe('openid email profile');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe(a.state);
    // A reused state would defeat the CSRF check entirely.
    expect(a.state).not.toBe(b.state);
  });

  // --- handles --------------------------------------------------------------

  it('stores only a hash of the handle, so a leaked store is not a live token', () => {
    const { handle, hash } = GoogleAuthService.newHandle();
    expect(hash).not.toBe(handle);
    expect(GoogleAuthService.hashHandle(handle)).toBe(hash);
  });
});
