import { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return derivedKey.length === keyBuffer.length && crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  getSuperAdminUser(): User {
    const superAdminEmail = (env.SUPER_ADMIN_EMAIL || '').toLowerCase();
    const superAdminPassword = env.SUPER_ADMIN_PASSWORD || '';
    return {
      id: 'usr_superadmin_01',
      name: 'Super Admin (Root)',
      email: superAdminEmail,
      passwordHash: hashPassword(superAdminPassword),
      role: 'SUPER_ADMIN' as UserRole,
      status: 'ACTIVE' as UserStatus,
      department: 'System Governance',
      designation: 'Root Super Administrator',
      phone: '+91 11 2345 6789',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      lastLoginAt: null,
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = this.normalizeEmail(email);
    const superAdminEmail = (env.SUPER_ADMIN_EMAIL || '').toLowerCase();

    // Super Admin Level-0 Root identity from environment
    if (normalized === superAdminEmail) {
      return this.getSuperAdminUser();
    }

    // Direct Database Query only
    return await this.prisma.user.findUnique({
      where: { email: normalized },
    });
  }

  async findById(id: string): Promise<User | null> {
    if (id === 'usr_superadmin_01') {
      return this.getSuperAdminUser();
    }

    // Direct Database Query only
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    status?: UserStatus;
    department?: string | null;
    designation?: string | null;
    phone?: string | null;
  }): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase();
    return await this.prisma.user.create({
      data: {
        id: `usr_${crypto.randomUUID()}`,
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || ('PROCUREMENT_OFFICER' as UserRole),
        status: data.status || ('ACTIVE' as UserStatus),
        department: data.department || null,
        designation: data.designation || null,
        phone: data.phone || null,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    if (id === 'usr_superadmin_01') {
      return;
    }
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async listOfficers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { role: 'PROCUREMENT_OFFICER' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOfficerStatus(id: string, status: UserStatus): Promise<User | null> {
    return this.updateUserStatus(id, status);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User | null> {
    return await this.prisma.user.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }

  async updateUserRole(id: string, role: UserRole): Promise<User | null> {
    return await this.prisma.user.update({
      where: { id },
      data: { role, updatedAt: new Date() },
    });
  }

  async updateOfficerProfile(
    id: string,
    data: { name?: string; department?: string; designation?: string; phone?: string }
  ): Promise<User | null> {
    return await this.prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async listUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async clear(): Promise<void> {
  }
}

export const userRepository = new UserRepository();
