export type UserRole = 'PROCUREMENT_OFFICER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
  expiresIn: number;
}
