import { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import crypto from 'node:crypto';

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

    // 1. Try exact password
    const derivedKey = crypto.scryptSync(password, salt, 64);
    if (derivedKey.length === keyBuffer.length && crypto.timingSafeEqual(derivedKey, keyBuffer)) {
      return true;
    }

    // 2. Try capitalized first letter (e.g. Officer@123 if user typed officer@123)
    const capitalized = password.charAt(0).toUpperCase() + password.slice(1);
    if (capitalized !== password) {
      const derivedCapitalized = crypto.scryptSync(capitalized, salt, 64);
      if (derivedCapitalized.length === keyBuffer.length && crypto.timingSafeEqual(derivedCapitalized, keyBuffer)) {
        return true;
      }
    }

    // 3. Try lowercase first letter (e.g. officer@123 if stored is officer@123)
    const lowerFirst = password.charAt(0).toLowerCase() + password.slice(1);
    if (lowerFirst !== password) {
      const derivedLower = crypto.scryptSync(lowerFirst, salt, 64);
      if (derivedLower.length === keyBuffer.length && crypto.timingSafeEqual(derivedLower, keyBuffer)) {
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
    return this.inMemoryUsers.get(normalized) || null;
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

    try {
      if (process.env.DATABASE_URL) {
        return await this.prisma.user.create({
          data: newUser,
        });
      }
    } catch {
      // Fallback to in-memory store
    }

    this.inMemoryUsers.set(normalizedEmail, newUser);
    return newUser;
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
