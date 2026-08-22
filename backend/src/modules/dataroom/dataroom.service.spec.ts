import { ForbiddenException } from '@nestjs/common';
import { DataroomService } from './dataroom.service';
import { DataroomRepository } from './dataroom.repository';
import { StorageService } from '../storage/storage.service';
import { AccessService } from '../access/access.service';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { AccessLevel } from '@prisma/client';

const owner: AuthUser = { id: 'own-1', email: 'o@x.com', role: 'OWNER', accessLevel: 'REGISTERED' };
const granted: AuthUser = { id: 'dev-1', email: 'd@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const stranger: AuthUser = { id: 'eve-9', email: 'e@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

function ndaDoc() {
  return {
    id: 'doc-1',
    opportunityId: 'op-1',
    folderId: 'fold-1',
    name: 'deed.pdf',
    minAccessLevel: null,
    createdById: 'own-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    versions: [
      {
        id: 'v1',
        documentId: 'doc-1',
        version: 1,
        storageKey: 'op-1/deed',
        fileName: 'deed.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 10,
        uploadedById: 'own-1',
        createdAt: new Date(),
      },
    ],
  };
}

describe('DataroomService (download permissions)', () => {
  let repo: jest.Mocked<
    Pick<DataroomRepository, 'findDocument' | 'getOpportunityMeta' | 'findFolder'>
  >;
  let access: { hasAccess: jest.Mock };
  let service: DataroomService;

  beforeEach(() => {
    repo = {
      findDocument: jest.fn().mockResolvedValue(ndaDoc()),
      getOpportunityMeta: jest.fn().mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED' }),
      findFolder: jest.fn().mockResolvedValue({ id: 'fold-1', opportunityId: 'op-1', minAccessLevel: AccessLevel.NDA }),
    };
    access = { hasAccess: jest.fn() };
    const storage = { createReadStream: jest.fn().mockReturnValue('STREAM') } as unknown as StorageService;
    const audit = { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService;
    service = new DataroomService(
      repo as unknown as DataroomRepository,
      storage,
      access as unknown as AccessService,
      audit,
    );
  });

  it('lets the owner download regardless of grant', async () => {
    const res = await service.prepareDownload(owner, 'doc-1');
    expect(res.fileName).toBe('deed.pdf');
    expect(access.hasAccess).not.toHaveBeenCalled();
  });

  it('blocks a non-granted user from an NDA document', async () => {
    access.hasAccess.mockResolvedValue(false);
    await expect(service.prepareDownload(stranger, 'doc-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets a granted user download an NDA document', async () => {
    access.hasAccess.mockResolvedValue(true);
    const res = await service.prepareDownload(granted, 'doc-1');
    expect(res.fileName).toBe('deed.pdf');
  });

  it('blocks anonymous users from an NDA document', async () => {
    await expect(service.prepareDownload(undefined, 'doc-1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
