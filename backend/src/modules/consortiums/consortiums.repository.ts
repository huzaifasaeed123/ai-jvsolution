import { Injectable } from '@nestjs/common';
import { Prisma, Consortium, ConsortiumMember } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const memberUser = {
  user: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.ConsortiumMemberInclude;

const detailInclude = {
  lead: { select: { id: true, fullName: true, email: true } },
  opportunity: { select: { id: true, reference: true, title: true } },
  members: { include: memberUser, orderBy: { createdAt: 'asc' } },
} satisfies Prisma.ConsortiumInclude;

export type ConsortiumDetail = Prisma.ConsortiumGetPayload<{ include: typeof detailInclude }>;
export type MemberWithUser = Prisma.ConsortiumMemberGetPayload<{ include: typeof memberUser }>;

@Injectable()
export class ConsortiumsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
  }

  create(data: Prisma.ConsortiumCreateInput): Promise<Consortium> {
    return this.prisma.consortium.create({ data });
  }

  findDetail(id: string): Promise<ConsortiumDetail | null> {
    return this.prisma.consortium.findUnique({ where: { id }, include: detailInclude });
  }

  /** Consortiums the user leads or is a member of. */
  async findForUser(userId: string): Promise<ConsortiumDetail[]> {
    return this.prisma.consortium.findMany({
      where: { OR: [{ leadId: userId }, { members: { some: { userId, status: { not: 'REMOVED' } } } }] },
      include: detailInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  addMember(data: Prisma.ConsortiumMemberCreateInput): Promise<ConsortiumMember> {
    return this.prisma.consortiumMember.create({ data });
  }

  findMember(id: string): Promise<(ConsortiumMember & { consortium: Consortium }) | null> {
    return this.prisma.consortiumMember.findUnique({ where: { id }, include: { consortium: true } });
  }

  findMembership(consortiumId: string, userId: string): Promise<ConsortiumMember | null> {
    return this.prisma.consortiumMember.findUnique({
      where: { consortiumId_userId: { consortiumId, userId } },
    });
  }

  updateMember(id: string, data: Prisma.ConsortiumMemberUpdateInput): Promise<ConsortiumMember> {
    return this.prisma.consortiumMember.update({ where: { id }, data });
  }

  updateConsortium(id: string, data: Prisma.ConsortiumUpdateInput): Promise<Consortium> {
    return this.prisma.consortium.update({ where: { id }, data });
  }
}
