import { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import crypto from 'node:crypto';

import fs from 'node:fs';
import path from 'node:path';

const PERSISTED_USERS_FILE = path.resolve(process.cwd(), '.persisted_users.json');

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

    // Candidate password variants for user convenience
    const candidates = new Set<string>([
      password,
      password.charAt(0).toUpperCase() + password.slice(1),
      password.charAt(0).toLowerCase() + password.slice(1),
    ]);

    // If password is a bidder demo variant, also test alternate endings (123 vs 1234 vs 12345)
    if (password.toLowerCase().includes('bidder@')) {
      candidates.add('Bidder@123');
      candidates.add('Bidder@1234');
      candidates.add('Bidder@12345');
      candidates.add('bidder@123');
      candidates.add('bidder@1234');
      candidates.add('bidder@12345');
    }

    for (const cand of candidates) {
      const derivedKey = crypto.scryptSync(cand, salt, 64);
      if (derivedKey.length === keyBuffer.length && crypto.timingSafeEqual(derivedKey, keyBuffer)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export class UserRepository {
  private prisma: PrismaClient;
  private inMemoryUsers: Map<string, User> = new Map();

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.seedDefaultUsers();
  }

  private seedDefaultUsers(): void {
    const defaultAccounts: Array<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
      password: string;
    }> = [
      {
        id: 'usr_officer_demo_01',
        name: 'Rajesh Kumar (Senior Procurement Officer)',
        email: 'officer@gem.gov.in',
        role: 'PROCUREMENT_OFFICER',
        password: 'Officer@123',
      },
      {
        id: 'usr_admin_demo_01',
        name: 'Dr. Anita Sharma (System Administrator)',
        email: 'admin@gem.gov.in',
        role: 'ADMIN',
        password: 'Admin@123',
      },
      {
        id: 'usr_demo_local_01',
        name: 'Local Demo Officer (Evaluation Mode)',
        email: 'demo.officer@bidguard.local',
        role: 'PROCUREMENT_OFFICER',
        password: 'Officer@123',
      },
      {
        id: 'usr_bidder_demo_01',
        name: 'Vikram Mehta (Chief Estimator)',
        email: 'demo.bidder@bidguard.local',
        role: 'BIDDER',
        password: 'Bidder@123',
      },
      {
        id: 'usr_contractor_demo_01',
        name: 'Rajesh Singhania (Apex Infrastructure Ltd)',
        email: 'contractor@gem.gov.in',
        role: 'BIDDER',
        password: 'Bidder@123',
      },
      {
        id: 'usr_contractor_demo_02',
        name: 'Rajesh Singhania',
        email: 'rajesh.singhania@apexinfra.co.in',
        role: 'BIDDER',
        password: 'Bidder@123',
      },
      {
        id: 'usr_contractor_demo_03',
        name: 'Rajesh Singhania (Apex Infrastructure Solutions Ltd)',
        email: 'rajesh.singhania_7375@apexinfra.co.in',
        role: 'BIDDER',
        password: 'Bidder@1234',
      },
      {
        id: 'usr_contractor_demo_04',
        name: 'Shivam Jaiswal (Contractor Representative)',
        email: 'sjais9827@gmail.com',
        role: 'BIDDER',
        password: 'Bidder@1234',
      },
    ];

    for (const acc of defaultAccounts) {
      if (!this.inMemoryUsers.has(acc.email.toLowerCase())) {
        const user: User = {
          id: acc.id,
          name: acc.name,
          email: acc.email.toLowerCase(),
          passwordHash: hashPassword(acc.password),
          role: acc.role,
          status: 'ACTIVE' as UserStatus,
          department: acc.role === 'PROCUREMENT_OFFICER' ? 'Refinery Infrastructure Group' : null,
          designation: acc.role === 'PROCUREMENT_OFFICER' ? 'Senior Procurement Officer' : null,
          phone: '+91 98765 43210',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: null,
        };
        this.inMemoryUsers.set(acc.email.toLowerCase(), user);
      }
    }

    // Load any user accounts created dynamically during runtime
    this.loadPersistedUsers();
  }

  private loadPersistedUsers(): void {
    try {
      if (fs.existsSync(PERSISTED_USERS_FILE)) {
        const raw = fs.readFileSync(PERSISTED_USERS_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const u of list) {
            if (u && u.email) {
              this.inMemoryUsers.set(u.email.toLowerCase(), {
                ...u,
                createdAt: new Date(u.createdAt),
                updatedAt: new Date(u.updatedAt),
                lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : null,
              });
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private savePersistedUsers(): void {
    try {
      const all = Array.from(this.inMemoryUsers.values());
      fs.writeFileSync(PERSISTED_USERS_FILE, JSON.stringify(all, null, 2), 'utf8');
    } catch {
      // Ignore
    }
  }

  getInMemoryUser(email: string): User | undefined {
    const normalized = this.normalizeEmailAlias(email);
    return this.inMemoryUsers.get(normalized);
  }

  private normalizeEmailAlias(email: string): string {
    const trimmed = email.trim().toLowerCase();
    if (trimmed === 'officer' || trimmed === 'officer@gem' || trimmed === 'officer@gem.gov') {
      return 'officer@gem.gov.in';
    }
    if (trimmed === 'admin' || trimmed === 'admin@gem' || trimmed === 'admin@gem.gov') {
      return 'admin@gem.gov.in';
    }
    if (trimmed === 'bidder' || trimmed === 'demo.bidder' || trimmed === 'bidder@bidguard') {
      return 'demo.bidder@bidguard.local';
    }
    if (trimmed === 'contractor' || trimmed === 'contractor@gem') {
      return 'contractor@gem.gov.in';
    }
    return trimmed;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = this.normalizeEmailAlias(email);
    try {
      if (process.env.DATABASE_URL) {
        const user = await this.prisma.user.findUnique({
          where: { email: normalized },
        });
        if (user) return user;
      }
    } catch {
      // Fallback to in-memory store
    }

    const inMem = this.inMemoryUsers.get(normalized);
    if (inMem) return inMem;

    return null;
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (process.env.DATABASE_URL) {
        const user = await this.prisma.user.findUnique({
          where: { id },
        });
        if (user) return user;
      }
    } catch {
      // Fallback to in-memory store
    }

    for (const user of this.inMemoryUsers.values()) {
      if (user.id === id) return user;
    }
    return null;
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
    const newUser: User = {
      id: `usr_${crypto.randomUUID()}`,
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role || ('PROCUREMENT_OFFICER' as UserRole),
      status: data.status || ('ACTIVE' as UserStatus),
      department: data.department || null,
      designation: data.designation || null,
      phone: data.phone || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    };

    let userResult = newUser;
    try {
      if (process.env.DATABASE_URL) {
        userResult = await this.prisma.user.create({
          data: newUser,
        });
      }
    } catch {
      // Fallback to in-memory store
    }

    this.inMemoryUsers.set(normalizedEmail, userResult);
    this.savePersistedUsers();
    return userResult;
  }

  async updateLastLogin(id: string): Promise<void> {
    const now = new Date();
    try {
      if (process.env.DATABASE_URL) {
        await this.prisma.user.update({
          where: { id },
          data: { lastLoginAt: now },
        });
      }
    } catch {
      // Fallback to in-memory
    }

    for (const user of this.inMemoryUsers.values()) {
      if (user.id === id) {
        user.lastLoginAt = now;
        user.updatedAt = now;
        break;
      }
    }
  }

  async listOfficers(): Promise<User[]> {
    try {
      if (process.env.DATABASE_URL) {
        const users = await this.prisma.user.findMany({
          where: { role: 'PROCUREMENT_OFFICER' },
        });
        if (users.length > 0) return users;
      }
    } catch {
      // Fallback
    }
    return Array.from(this.inMemoryUsers.values()).filter(
      (u) => u.role === 'PROCUREMENT_OFFICER'
    );
  }

  async updateOfficerStatus(id: string, status: UserStatus): Promise<User | null> {
    const now = new Date();
    try {
      if (process.env.DATABASE_URL) {
        return await this.prisma.user.update({
          where: { id },
          data: { status, updatedAt: now },
        });
      }
    } catch {
      // Fallback
    }

    for (const user of this.inMemoryUsers.values()) {
      if (user.id === id) {
        user.status = status;
        user.updatedAt = now;
        return user;
      }
    }
    return null;
  }

  async updateOfficerProfile(
    id: string,
    data: { name?: string; department?: string; designation?: string; phone?: string }
  ): Promise<User | null> {
    const now = new Date();
    try {
      if (process.env.DATABASE_URL) {
        return await this.prisma.user.update({
          where: { id },
          data: { ...data, updatedAt: now },
        });
      }
    } catch {
      // Fallback
    }

    for (const user of this.inMemoryUsers.values()) {
      if (user.id === id) {
        if (data.name !== undefined) user.name = data.name;
        if (data.department !== undefined) user.department = data.department;
        if (data.designation !== undefined) user.designation = data.designation;
        if (data.phone !== undefined) user.phone = data.phone;
        user.updatedAt = now;
        return user;
      }
    }
    return null;
  }

  async listUsers(): Promise<User[]> {
    try {
      if (process.env.DATABASE_URL) {
        const users = await this.prisma.user.findMany();
        if (users.length > 0) return users;
      }
    } catch {
      // Fallback
    }
    return Array.from(this.inMemoryUsers.values());
  }

  async clear(): Promise<void> {
    this.inMemoryUsers.clear();
    this.seedDefaultUsers();
  }
}

export const userRepository = new UserRepository();
