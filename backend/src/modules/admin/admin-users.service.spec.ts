import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessLevel, Role, User, UserStatus } from '@prisma/client';
import { AdminUsersService } from './admin-users.service';
import { UsersRepository } from '../users/users.repository';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const admin: AuthUser = {
  id: 'admin-1',
  email: 'a@x.com',
  role: 'ADMIN',
  accessLevel: 'TRANSACTION',
};

function makeUser(over: Partial<User> = {}): User {
  return {
    id: 'u-1',
    email: 'u@x.com',
    passwordHash: 'x',
    fullName: 'Target User',
    role: Role.DEVELOPER,
    accessLevel: AccessLevel.REGISTERED,
    country: 'AE',
    avatarUrl: null,
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

describe('AdminUsersService', () => {
  let repo: {
    findById: jest.Mock;
    update: jest.Mock;
    countOtherActiveAdmins: jest.Mock;
  };
  let service: AdminUsersService;

  beforeEach(() => {
    repo = {
      findById: jest.fn().mockResolvedValue(makeUser()),
      update: jest.fn().mockImplementation((id: string, data: Partial<User>) =>
        Promise.resolve(makeUser({ id, ...data })),
      ),
      countOtherActiveAdmins: jest.fn().mockResolvedValue(1),
    };
    const audit = { record: jest.fn() } as unknown as AuditService;
    service = new AdminUsersService(repo as unknown as UsersRepository, audit);
  });

  // --- self-protection -----------------------------------------------------

  it('refuses to let an admin suspend their own account', async () => {
    await expect(service.suspend(admin, admin.id, 'because')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('refuses to let an admin change their own role', async () => {
    await expect(service.setRole(admin, admin.id, Role.OWNER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('refuses to let an admin delete their own account', async () => {
    await expect(service.softDelete(admin, admin.id, 'because')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  // --- last-admin protection ----------------------------------------------

  it('refuses to demote the last remaining admin', async () => {
    repo.findById.mockResolvedValue(makeUser({ id: 'other-admin', role: Role.ADMIN }));
    repo.countOtherActiveAdmins.mockResolvedValue(0);
    await expect(service.setRole(admin, 'other-admin', Role.OWNER)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('refuses to suspend the last remaining admin', async () => {
    repo.findById.mockResolvedValue(makeUser({ id: 'other-admin', role: Role.ADMIN }));
    repo.countOtherActiveAdmins.mockResolvedValue(0);
    await expect(service.suspend(admin, 'other-admin', 'because')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('allows demoting an admin while another active admin remains', async () => {
    repo.findById.mockResolvedValue(makeUser({ id: 'other-admin', role: Role.ADMIN }));
    repo.countOtherActiveAdmins.mockResolvedValue(2);
    const r = await service.setRole(admin, 'other-admin', Role.OWNER);
    expect(r.role).toBe(Role.OWNER);
  });

  // --- session revocation --------------------------------------------------

  it('revokes existing sessions when suspending', async () => {
    await service.suspend(admin, 'u-1', 'misuse');
    expect(repo.update).toHaveBeenCalledWith(
      'u-1',
      expect.objectContaining({
        status: UserStatus.SUSPENDED,
        tokenVersion: { increment: 1 },
      }),
    );
  });

  it('revokes sessions on a forced sign-out without suspending', async () => {
    await service.forceSignOut(admin, 'u-1');
    expect(repo.update).toHaveBeenCalledWith('u-1', { tokenVersion: { increment: 1 } });
  });

  it('keeps the row on delete so the audit trail still resolves its author', async () => {
    await service.softDelete(admin, 'u-1', 'spam account');
    const [, data] = repo.update.mock.calls[0] as [string, Partial<User>];
    expect(data.deletedAt).toBeInstanceOf(Date);
    expect(data.status).toBe(UserStatus.SUSPENDED);
  });

  // --- state guards --------------------------------------------------------

  it('rejects suspending an already-suspended account', async () => {
    repo.findById.mockResolvedValue(makeUser({ status: UserStatus.SUSPENDED }));
    await expect(service.suspend(admin, 'u-1', 'again')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects reinstating an account that is not suspended', async () => {
    await expect(service.reinstate(admin, 'u-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('treats a soft-deleted user as absent', async () => {
    repo.findById.mockResolvedValue(makeUser({ deletedAt: new Date() }));
    await expect(service.get('u-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('never returns a password hash', async () => {
    const r = await service.get('u-1');
    expect(r).not.toHaveProperty('passwordHash');
  });
});
