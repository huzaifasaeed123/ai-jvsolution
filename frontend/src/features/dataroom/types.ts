export type AccessLevel =
  | 'PUBLIC'
  | 'REGISTERED'
  | 'VERIFIED'
  | 'NDA'
  | 'DUE_DILIGENCE'
  | 'TRANSACTION';

export interface DataRoomFolder {
  id: string;
  code: string | null;
  name: string;
  order: number;
  parentId: string | null;
  minAccessLevel: AccessLevel;
  accessible: boolean;
}

export interface DataRoomDocument {
  id: string;
  folderId: string;
  name: string;
  minAccessLevel: AccessLevel | null;
  createdAt: string;
  latest: {
    version: number;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  } | null;
}

export interface DataRoom {
  initialized: boolean;
  viewerLevel: AccessLevel;
  isOwner: boolean;
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
}
