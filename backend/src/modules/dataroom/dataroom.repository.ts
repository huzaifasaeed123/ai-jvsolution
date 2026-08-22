import { Injectable } from '@nestjs/common';
import { Prisma, Folder, Document, DocumentVersion } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type DocumentWithLatest = Prisma.DocumentGetPayload<{
  include: { versions: { orderBy: { version: 'desc' }; take: 1 } };
}>;

@Injectable()
export class DataroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---- opportunity meta (read-only, avoids circular dep on Opportunities) ----
  getOpportunityMeta(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true },
    });
  }

  // ---- folders ----
  countFolders(opportunityId: string): Promise<number> {
    return this.prisma.folder.count({ where: { opportunityId } });
  }

  createManyFolders(data: Prisma.FolderCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return this.prisma.folder.createMany({ data });
  }

  createFolder(data: Prisma.FolderCreateInput): Promise<Folder> {
    return this.prisma.folder.create({ data });
  }

  listFolders(opportunityId: string): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: { opportunityId },
      orderBy: [{ order: 'asc' }, { code: 'asc' }],
    });
  }

  findFolder(id: string): Promise<Folder | null> {
    return this.prisma.folder.findUnique({ where: { id } });
  }

  // ---- documents ----
  listDocuments(opportunityId: string): Promise<DocumentWithLatest[]> {
    return this.prisma.document.findMany({
      where: { opportunityId, deletedAt: null },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    });
  }

  findDocument(id: string): Promise<DocumentWithLatest | null> {
    return this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }

  createDocument(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  createVersion(data: Prisma.DocumentVersionCreateInput): Promise<DocumentVersion> {
    return this.prisma.documentVersion.create({ data });
  }

  nextVersionNumber(documentId: string): Promise<number> {
    return this.prisma.documentVersion
      .aggregate({ where: { documentId }, _max: { version: true } })
      .then((r) => (r._max.version ?? 0) + 1);
  }

  softDeleteDocument(id: string): Promise<Document> {
    return this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
