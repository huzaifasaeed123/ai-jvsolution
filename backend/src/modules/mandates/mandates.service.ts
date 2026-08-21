import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Mandate } from '@prisma/client';
import { MandatesRepository } from './mandates.repository';
import { serializeMandate } from './mandate.serializer';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { UpdateMandateDto } from './dto/update-mandate.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

function majorToCents(major?: number): bigint | undefined {
  return major === undefined ? undefined : BigInt(Math.round(major * 100));
}

@Injectable()
export class MandatesService {
  constructor(private readonly repo: MandatesRepository) {}

  async create(user: AuthUser, dto: CreateMandateDto) {
    const data: Prisma.MandateCreateInput = {
      title: dto.title,
      owner: { connect: { id: user.id } },
      sectors: dto.sectors ?? [],
      countryCodes: (dto.countryCodes ?? []).map((c) => c.toUpperCase()),
      projectTypes: dto.projectTypes ?? [],
      structures: dto.structures ?? [],
      ownerCategories: dto.ownerCategories ?? [],
      currency: dto.currency?.toUpperCase() ?? 'USD',
      minInvestmentCents: majorToCents(dto.minInvestment),
      maxInvestmentCents: majorToCents(dto.maxInvestment),
      targetIrr: dto.targetIrr,
      riskAppetite: dto.riskAppetite,
      active: dto.active ?? true,
    };
    const created = await this.repo.create(data);
    return serializeMandate(created);
  }

  async update(user: AuthUser, id: string, dto: UpdateMandateDto) {
    const existing = await this.getOwnedOr404(user, id);
    const data: Prisma.MandateUpdateInput = {
      ...dto,
      countryCodes: dto.countryCodes?.map((c) => c.toUpperCase()),
      currency: dto.currency?.toUpperCase(),
      minInvestmentCents: majorToCents(dto.minInvestment),
      maxInvestmentCents: majorToCents(dto.maxInvestment),
    };
    delete (data as Record<string, unknown>).minInvestment;
    delete (data as Record<string, unknown>).maxInvestment;
    const updated = await this.repo.update(existing.id, data);
    return serializeMandate(updated);
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.getOwnedOr404(user, id);
    await this.repo.softDelete(existing.id);
    return { id: existing.id, deleted: true };
  }

  async listMine(user: AuthUser) {
    const items = await this.repo.findByOwner(user.id);
    return items.map(serializeMandate);
  }

  async getOne(user: AuthUser, id: string) {
    const existing = await this.getOwnedOr404(user, id);
    return serializeMandate(existing);
  }

  /** Raw entity (used by the matching endpoint after ownership check). */
  async getOwnedEntity(user: AuthUser, id: string): Promise<Mandate> {
    return this.getOwnedOr404(user, id);
  }

  private async getOwnedOr404(user: AuthUser, id: string): Promise<Mandate> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Mandate not found');
    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this mandate');
    }
    return existing;
  }
}
