import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessLevel, Prisma, Role, UserStatus } from '@prisma/client';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuditService, AuditAction } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { QueryUsersDto } from './dto/query-users.dto';

/**
 * Platform user administration.
 *
 * Two rules run through every method here:
 *
 *  1. An administrator cannot act on their own account in a way that could
 *     lock them out, and cannot remove the last remaining administrator. A
 *     console that lets its operator delete the only key is a support incident
 *     waiting to happen.
 *  2. Every consequential action is written to the audit trail with the actor,
 *     the target and a reason. Operator powers are accountable, not silent.
 */
@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  async list(query: QueryUsersDto) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.accessLevel) where.accessLevel = query.accessLevel;
    if (query.countryCode) where.country = query.countryCode.toUpperCase();
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const [items, total] = await this.repo.findMany(where, (page - 1) * limit, limit);

    return {
      items: items.map((u) => UsersService.toSafe(u)),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async get(id: string) {
    const user = await this.repo.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return UsersService.toSafe(user);
  }

  async setRole(actor: AuthUser, id: string, role: Role) {
    const user = await this.mutableTarget(actor, id, 'change the role of');
    if (user.role === role) return UsersService.toSafe(user);

    // Demoting an admin must not empty the admin seat.
    if (user.role === Role.ADMIN && role !== Role.ADMIN) {
      await this.assertNotLastAdmin(user.id);
    }

    const updated = await this.repo.update(id, { role });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_ROLE_CHANGED,
      targetUserId: id,
      metadata: { from: user.role, to: role },
    });
    return UsersService.toSafe(updated);
  }

  async setAccessLevel(actor: AuthUser, id: string, accessLevel: AccessLevel) {
    const user = await this.mutableTarget(actor, id, 'change the access level of');
    if (user.accessLevel === accessLevel) return UsersService.toSafe(user);

    const updated = await this.repo.update(id, { accessLevel });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_ACCESS_LEVEL_CHANGED,
      targetUserId: id,
      metadata: { from: user.accessLevel, to: accessLevel },
    });
    return UsersService.toSafe(updated);
  }

  async suspend(actor: AuthUser, id: string, reason: string) {
    const user = await this.mutableTarget(actor, id, 'suspend');
    if (user.status === UserStatus.SUSPENDED) {
      throw new BadRequestException('This account is already suspended');
    }
    if (user.role === Role.ADMIN) await this.assertNotLastAdmin(user.id);

    // Bumping the version revokes tokens already issued, so the suspension
    // bites on the next request rather than when the access token expires.
    const updated = await this.repo.update(id, {
      status: UserStatus.SUSPENDED,
      suspendedAt: new Date(),
      suspendedReason: reason,
      suspendedById: actor.id,
      tokenVersion: { increment: 1 },
    });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_SUSPENDED,
      targetUserId: id,
      metadata: { reason },
    });
    return UsersService.toSafe(updated);
  }

  async reinstate(actor: AuthUser, id: string) {
    const user = await this.repo.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    if (user.status !== UserStatus.SUSPENDED) {
      throw new BadRequestException('This account is not suspended');
    }

    const updated = await this.repo.update(id, {
      status: UserStatus.ACTIVE,
      suspendedAt: null,
      suspendedReason: null,
      suspendedById: null,
    });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_REINSTATED,
      targetUserId: id,
      metadata: { previousReason: user.suspendedReason },
    });
    return UsersService.toSafe(updated);
  }

  /** Invalidate every token issued to this user, without suspending them. */
  async forceSignOut(actor: AuthUser, id: string) {
    const user = await this.repo.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    const updated = await this.repo.update(id, { tokenVersion: { increment: 1 } });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_SIGNED_OUT,
      targetUserId: id,
    });
    return UsersService.toSafe(updated);
  }

  /**
   * Soft delete. The row stays so that opportunities, bids and audit entries
   * keep their author — hard-deleting a user would tear holes in the record of
   * who did what, which is precisely what the audit trail exists to preserve.
   */
  async softDelete(actor: AuthUser, id: string, reason: string) {
    const user = await this.mutableTarget(actor, id, 'delete');
    if (user.role === Role.ADMIN) await this.assertNotLastAdmin(user.id);

    const updated = await this.repo.update(id, {
      deletedAt: new Date(),
      status: UserStatus.SUSPENDED,
      suspendedReason: reason,
      suspendedById: actor.id,
      tokenVersion: { increment: 1 },
    });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_DELETED,
      targetUserId: id,
      metadata: { reason },
    });
    return UsersService.toSafe(updated);
  }

  async overview() {
    return this.repo.groupCounts();
  }

  // ---------------------------------------------------------------- helpers

  /** Load a target the actor is allowed to mutate, or explain why not. */
  private async mutableTarget(actor: AuthUser, id: string, verb: string) {
    if (actor.id === id) {
      throw new ForbiddenException(
        `You cannot ${verb} your own account. Ask another administrator.`,
      );
    }
    const user = await this.repo.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return user;
  }

  private async assertNotLastAdmin(id: string) {
    const others = await this.repo.countOtherActiveAdmins(id);
    if (others === 0) {
      throw new BadRequestException(
        'This is the last active administrator. Promote another account first.',
      );
    }
  }
}
