export type Role = 'OWNER' | 'DEVELOPER' | 'INVESTOR' | 'GOVERNMENT' | 'ADMIN';

export type AccessLevel =
  | 'PUBLIC'
  | 'REGISTERED'
  | 'VERIFIED'
  | 'NDA'
  | 'DUE_DILIGENCE'
  | 'TRANSACTION';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessLevel: AccessLevel;
  country: string | null;
  avatarUrl: string | null;
  /** False while a Google-created account still has to choose its role. */
  roleConfirmed: boolean;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
