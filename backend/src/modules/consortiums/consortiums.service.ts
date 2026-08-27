import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConsortiumStatus, MemberStatus, Prisma } from '@prisma/client';
import { ConsortiumsRepository } from './consortiums.repository';
import { serializeConsortium } from './consortium.serializer';
import { CreateConsortiumDto, InviteMemberDto, UpdateMemberDto } from './dto/consortium.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ConsortiumsService {
  constructor(private readonly repo: ConsortiumsRepository) {}

  async create(user: AuthUser, dto: CreateConsortiumDto) {
    const data: Prisma.ConsortiumCreateInput = {
      name: dto.name,
      description: dto.description,
      lead: { connect: { id: user.id } },
      ...(dto.opportunityId ? { opportunity: { connect: { id: dto.opportunityId } } } : {}),
      // The lead joins as an accepted member automatically.
      members: {
        create: { userId: user.id, role: 'lead-investor', status: MemberStatus.ACCEPTED },
      },
    };
    const created = await this.repo.create(data);
    return this.getOne(user, created.id);
  }

  async listMine(user: AuthUser) {
    const items = await this.repo.findForUser(user.id);
    return items.map((c) => serializeConsortium(c, user.id));
  }

  async getOne(user: AuthUser, id: string) {
    const c = await this.repo.findDetail(id);
    if (!c) throw new NotFoundException('Consortium not found');
    const isMember = c.leadId === user.id || c.members.some((m) => m.userId === user.id && m.status !== 'REMOVED');
    if (!isMember && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not part of this consortium');
    }
    return serializeConsortium(c, user.id);
  }

  async invite(user: AuthUser, consortiumId: string, dto: InviteMemberDto) {
    const c = await this.mustLead(user, consortiumId);
    if (c.status === ConsortiumStatus.DISBANDED) throw new BadRequestException('Consortium is disbanded');

    const invitee = await this.repo.findUserByEmail(dto.email);
    if (!invitee) throw new NotFoundException('No registered user with that email');

    const existing = await this.repo.findMembership(consortiumId, invitee.id);
    if (existing && existing.status !== MemberStatus.REMOVED) {
      throw new ConflictException('That user is already in the consortium');
    }

    await this.repo.addMember({
      consortium: { connect: { id: consortiumId } },
      user: { connect: { id: invitee.id } },
      role: dto.role,
      equityPct: dto.equityPct,
      status: MemberStatus.INVITED,
      invitedById: user.id,
    });
    return this.getOne(user, consortiumId);
  }

  async updateMember(user: AuthUser, consortiumId: string, memberId: string, dto: UpdateMemberDto) {
    await this.mustLead(user, consortiumId);
    const member = await this.repo.findMember(memberId);
    if (!member || member.consortiumId !== consortiumId) throw new NotFoundException('Member not found');
    await this.repo.updateMember(memberId, { role: dto.role, equityPct: dto.equityPct });
    return this.getOne(user, consortiumId);
  }

  async removeMember(user: AuthUser, consortiumId: string, memberId: string) {
    const c = await this.mustLead(user, consortiumId);
    const member = await this.repo.findMember(memberId);
    if (!member || member.consortiumId !== consortiumId) throw new NotFoundException('Member not found');
    if (member.userId === c.leadId) throw new BadRequestException('The lead cannot be removed');
    await this.repo.updateMember(memberId, { status: MemberStatus.REMOVED });
    return this.getOne(user, consortiumId);
  }

  /** The invited user accepts or declines their membership. */
  async respond(user: AuthUser, memberId: string, accept: boolean) {
    const member = await this.repo.findMember(memberId);
    if (!member) throw new NotFoundException('Invitation not found');
    if (member.userId !== user.id) throw new ForbiddenException('This invitation is not yours');
    if (member.status !== MemberStatus.INVITED) throw new BadRequestException('Invitation already answered');
    await this.repo.updateMember(memberId, {
      status: accept ? MemberStatus.ACCEPTED : MemberStatus.DECLINED,
    });
    return this.getOne(user, member.consortiumId);
  }

  async disband(user: AuthUser, id: string) {
    await this.mustLead(user, id);
    await this.repo.updateConsortium(id, { status: ConsortiumStatus.DISBANDED });
    return this.getOne(user, id);
  }

  private async mustLead(user: AuthUser, consortiumId: string) {
    const c = await this.repo.findDetail(consortiumId);
    if (!c) throw new NotFoundException('Consortium not found');
    if (c.leadId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only the consortium lead can do this');
    }
    return c;
  }
}
