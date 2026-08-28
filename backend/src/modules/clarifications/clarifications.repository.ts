import { Injectable } from '@nestjs/common';
import { Prisma, Clarification, Addendum, SwissChallenge } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const askerSelect = {
  askedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.ClarificationInclude;

export type ClarificationWithAsker = Prisma.ClarificationGetPayload<{ include: typeof askerSelect }>;

@Injectable()
export class ClarificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getTender(id: string) {
    return this.prisma.tender.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        authorityId: true,
        stage: true,
        opportunityId: true,
        clarificationDeadline: true,
        submissionDeadline: true,
      },
    });
  }

  // ---- clarifications ----
  createQuestion(data: Prisma.ClarificationCreateInput): Promise<ClarificationWithAsker> {
    return this.prisma.clarification.create({ data, include: askerSelect });
  }

  findQuestion(id: string): Promise<ClarificationWithAsker | null> {
    return this.prisma.clarification.findUnique({ where: { id }, include: askerSelect });
  }

  listQuestions(tenderId: string): Promise<ClarificationWithAsker[]> {
    return this.prisma.clarification.findMany({
      where: { tenderId },
      include: askerSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  updateQuestion(id: string, data: Prisma.ClarificationUpdateInput): Promise<ClarificationWithAsker> {
    return this.prisma.clarification.update({ where: { id }, data, include: askerSelect });
  }

  // ---- addenda ----
  async nextAddendumNumber(tenderId: string): Promise<number> {
    const last = await this.prisma.addendum.aggregate({
      where: { tenderId },
      _max: { number: true },
    });
    return (last._max.number ?? 0) + 1;
  }

  createAddendum(data: Prisma.AddendumCreateInput): Promise<Addendum> {
    return this.prisma.addendum.create({ data });
  }

  listAddenda(tenderId: string): Promise<Addendum[]> {
    return this.prisma.addendum.findMany({ where: { tenderId }, orderBy: { number: 'asc' } });
  }

  updateTenderDeadline(tenderId: string, submissionDeadline: Date) {
    return this.prisma.tender.update({ where: { id: tenderId }, data: { submissionDeadline } });
  }

  // ---- swiss challenge ----
  findChallenge(tenderId: string): Promise<SwissChallenge | null> {
    return this.prisma.swissChallenge.findUnique({ where: { tenderId } });
  }

  createChallenge(data: Prisma.SwissChallengeCreateInput): Promise<SwissChallenge> {
    return this.prisma.swissChallenge.create({ data });
  }

  updateChallenge(id: string, data: Prisma.SwissChallengeUpdateInput): Promise<SwissChallenge> {
    return this.prisma.swissChallenge.update({ where: { id }, data });
  }

  userExists(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true } });
  }
}
