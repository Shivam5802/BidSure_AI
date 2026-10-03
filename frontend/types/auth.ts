
export type UserRole =
  | 'SUPER_ADMIN'          
  | 'ADMIN'                
  | 'PROCUREMENT_OFFICER'  
  | 'BIDDER';              


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
  companyName?: string;   
  avatarUrl?: string;     
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
  expiresIn: number;
}


export function getRoleLabel(role?: UserRole | string | null): string {
  switch (role) {
    case 'SUPER_ADMIN':         return 'Super Administrator (Root)';
    case 'ADMIN':               return 'Administrator';
    case 'PROCUREMENT_OFFICER': return 'Procurement Officer';
    case 'BIDDER':              return 'Bidder / Vendor';
    default:                    return 'User';
  }
}


export function getRoleDashboard(role?: UserRole | string | null): string {
  switch (role) {
    case 'SUPER_ADMIN':         return '/super-admin/dashboard';
    case 'ADMIN':               return '/admin/dashboard';
    case 'BIDDER':              return '/bidder/dashboard';
    case 'PROCUREMENT_OFFICER': return '/dashboard';
    default:                    return '/dashboard';
  }
}

export function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const clean = name.replace(/\s*\(.*?\)\s*/g, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0]! + parts[1][0]!).toUpperCase();
    if (parts.length === 1 && parts[0]!.length >= 2) return parts[0]!.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  }
  if (email) {
    const prefix = email.split('@')[0] || '';
    return prefix.slice(0, 2).toUpperCase();
  }
  return 'US';
}
