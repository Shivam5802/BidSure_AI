export type UserRole = 'PROCUREMENT_OFFICER' | 'ADMIN' | 'BIDDER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresIn: number;
}
