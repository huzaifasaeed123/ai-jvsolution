import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** All Prisma access for the users domain lives here. */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /** Paged, filtered listing for the admin console. */
  findMany(where: Prisma.UserWhereInput, skip: number, take: number) {
    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  /** Guardrail input: how many active admins remain besides this one. */
  countOtherActiveAdmins(excludeId: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: 'ADMIN',
        status: 'ACTIVE',
        deletedAt: null,
        NOT: { id: excludeId },
      },
    });
  }

  /** Counts by role and by status, for the admin overview. */
  async groupCounts() {
    const [byRole, byStatus, total] = await this.prisma.$transaction([
      this.prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null },
        _count: true,
        orderBy: { role: 'asc' },
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
        orderBy: { status: 'asc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return { byRole, byStatus, total };
  }
}
