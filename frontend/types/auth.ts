export type UserRole = 'PROCUREMENT_OFFICER' | 'ADMIN' | 'BIDDER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
  expiresIn: number;
}

