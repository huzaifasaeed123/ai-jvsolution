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
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
