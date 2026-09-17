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
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    if (derivedKey.length !== keyBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
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
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: null,
        };
        this.inMemoryUsers.set(acc.email.toLowerCase(), user);
      }
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
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
  }): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const newUser: User = {
      id: `usr_${crypto.randomUUID()}`,
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role || ('PROCUREMENT_OFFICER' as UserRole),
      status: data.status || ('ACTIVE' as UserStatus),
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
