import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessLevel, Prisma } from '@prisma/client';
import { DataroomRepository, DocumentWithLatest } from './dataroom.repository';
import { StorageService } from '../storage/storage.service';
import { AccessService } from '../access/access.service';
import { AuditService, AuditAction } from '../access/audit.service';
import { DATAROOM_SECTIONS } from '../../common/reference/dataroom-sections';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/** Ordinal ranking so folder/document minAccessLevel can be compared. */
const LEVEL_RANK: Record<AccessLevel, number> = {
  PUBLIC: 1,
  REGISTERED: 2,
  VERIFIED: 3,
  NDA: 4,
  DUE_DILIGENCE: 5,
  TRANSACTION: 6,
};

@Injectable()
export class DataroomService {
  constructor(
    private readonly repo: DataroomRepository,
    private readonly storage: StorageService,
    private readonly access: AccessService,
    private readonly audit: AuditService,
  ) {}

  /** The viewer's effective access level for an opportunity. */
  private async effectiveLevel(user: AuthUser | undefined, opportunityId: string, ownerId: string) {
    if (!user) return AccessLevel.PUBLIC;
    if (user.role === 'ADMIN' || user.id === ownerId) return AccessLevel.TRANSACTION;
    const granted = await this.access.hasAccess(user.id, opportunityId);
    return granted ? AccessLevel.NDA : AccessLevel.REGISTERED;
  }

  private isOwnerOrAdmin(user: AuthUser | undefined, ownerId: string) {
    return !!user && (user.role === 'ADMIN' || user.id === ownerId);
  }

  private async opportunityOr404(id: string) {
    const meta = await this.repo.getOpportunityMeta(id);
    if (!meta) throw new NotFoundException('Opportunity not found');
    return meta;
  }

  // ---- read ----

  async getDataRoom(opportunityId: string, user?: AuthUser) {
    const opp = await this.opportunityOr404(opportunityId);
    const owner = this.isOwnerOrAdmin(user, opp.ownerId);
    if (opp.status !== 'PUBLISHED' && !owner) throw new NotFoundException('Opportunity not found');

    const level = await this.effectiveLevel(user, opportunityId, opp.ownerId);
    const rank = LEVEL_RANK[level];

    const [folders, documents] = await Promise.all([
      this.repo.listFolders(opportunityId),
      this.repo.listDocuments(opportunityId),
    ]);

    const folderById = new Map(folders.map((f) => [f.id, f]));
    const visibleDocs = documents.filter((d) => {
      const folder = folderById.get(d.folderId);
      const effLevel = d.minAccessLevel ?? folder?.minAccessLevel ?? AccessLevel.NDA;
      return LEVEL_RANK[effLevel] <= rank;
    });

    return {
      initialized: folders.length > 0,
      viewerLevel: level,
      isOwner: owner,
      folders: folders.map((f) => ({
        id: f.id,
        code: f.code,
        name: f.name,
        order: f.order,
        parentId: f.parentId,
        minAccessLevel: f.minAccessLevel,
        accessible: LEVEL_RANK[f.minAccessLevel] <= rank,
      })),
      documents: visibleDocs.map((d) => this.serializeDoc(d)),
    };
  }

  private serializeDoc(d: DocumentWithLatest) {
    const latest = d.versions[0];
    return {
      id: d.id,
      folderId: d.folderId,
      name: d.name,
      minAccessLevel: d.minAccessLevel,
      createdAt: d.createdAt,
      latest: latest
        ? {
            version: latest.version,
            fileName: latest.fileName,
            mimeType: latest.mimeType,
            sizeBytes: latest.sizeBytes,
            createdAt: latest.createdAt,
          }
        : null,
    };
  }

  // ---- owner commands ----

  async initDataRoom(user: AuthUser, opportunityId: string) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can initialize the data room');
    }
    const existing = await this.repo.countFolders(opportunityId);
    if (existing > 0) return { initialized: true, created: 0 };

    const data: Prisma.FolderCreateManyInput[] = DATAROOM_SECTIONS.map((s, i) => ({
      opportunityId,
      code: s.code,
      name: s.name,
      order: i,
      minAccessLevel: s.minAccessLevel,
    }));
    const res = await this.repo.createManyFolders(data);
    return { initialized: true, created: res.count };
  }

  async createFolder(
    user: AuthUser,
    opportunityId: string,
    dto: { name: string; parentId?: string; minAccessLevel?: AccessLevel },
  ) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can add folders');
    }
    const count = await this.repo.countFolders(opportunityId);
    return this.repo.createFolder({
      opportunity: { connect: { id: opportunityId } },
      name: dto.name,
      order: count,
      minAccessLevel: dto.minAccessLevel ?? AccessLevel.NDA,
      ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
    });
  }

  async uploadDocument(
    user: AuthUser,
    opportunityId: string,
    folderId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    minAccessLevel?: AccessLevel,
  ) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can upload documents');
    }
    if (!file) throw new BadRequestException('No file provided');

    const folder = await this.repo.findFolder(folderId);
    if (!folder || folder.opportunityId !== opportunityId) {
      throw new NotFoundException('Folder not found');
    }

    const storageKey = await this.storage.save(file.buffer, opportunityId, file.originalname);
    const document = await this.repo.createDocument({
      opportunity: { connect: { id: opportunityId } },
      folder: { connect: { id: folderId } },
      name: file.originalname,
      minAccessLevel: minAccessLevel ?? null,
      createdById: user.id,
    });
    const version = await this.repo.nextVersionNumber(document.id);
    await this.repo.createVersion({
      document: { connect: { id: document.id } },
      version,
      storageKey,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedById: user.id,
    });

    await this.audit.record({
      actorId: user.id,
      action: AuditAction.DOCUMENT_UPLOADED,
      opportunityId,
      metadata: { documentId: document.id, fileName: file.originalname },
    });

    return this.serializeDoc((await this.repo.findDocument(document.id))!);
  }

  /** Permission-checked, audited download. Returns the stream + file meta. */
  async prepareDownload(user: AuthUser | undefined, documentId: string) {
    const doc = await this.repo.findDocument(documentId);
    if (!doc) throw new NotFoundException('Document not found');

    const opp = await this.opportunityOr404(doc.opportunityId);
    const folder = await this.repo.findFolder(doc.folderId);
    const effLevel = doc.minAccessLevel ?? folder?.minAccessLevel ?? AccessLevel.NDA;

    const level = await this.effectiveLevel(user, doc.opportunityId, opp.ownerId);
    if (LEVEL_RANK[level] < LEVEL_RANK[effLevel]) {
      throw new ForbiddenException('You do not have access to this document');
    }

    const latest = doc.versions[0];
    if (!latest) throw new NotFoundException('Document has no file');

    await this.audit.record({
      actorId: user?.id,
      action: AuditAction.DOCUMENT_DOWNLOADED,
      opportunityId: doc.opportunityId,
      metadata: {
        documentId,
        fileName: latest.fileName,
        // watermark info (shown/stamped later): who accessed what, when
        watermark: `${user?.email ?? 'anonymous'} · ${new Date().toISOString()}`,
      },
    });

    return {
      stream: this.storage.createReadStream(latest.storageKey),
      fileName: latest.fileName,
      mimeType: latest.mimeType,
    };
  }

  async deleteDocument(user: AuthUser, documentId: string) {
    const doc = await this.repo.findDocument(documentId);
    if (!doc) throw new NotFoundException('Document not found');
    const opp = await this.opportunityOr404(doc.opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can delete documents');
    }
    await this.repo.softDeleteDocument(documentId);
    return { id: documentId, deleted: true };
  }
}
