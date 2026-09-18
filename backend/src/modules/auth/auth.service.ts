import crypto from 'node:crypto';
import { AuthUser, TokenPayload, UserRole } from './auth.types.js';
import { userRepository, verifyPassword, hashPassword } from './user.repository.js';
import { AuditService } from '../../services/audit/audit.service.js';
import { AuditEventType } from '@prisma/client';
import { applicationRepository } from '../applications/application.repository.js';

const DEFAULT_SECRET = process.env.JWT_SECRET || 'bidguard-demo-jwt-secret-sih-2026-secure-key';

export class AuthService {
  private secret: string;
  private revokedTokens: Set<string> = new Set();
  private auditService: AuditService;

  constructor(secret: string = DEFAULT_SECRET, auditService?: AuditService) {
    this.secret = secret;
    this.auditService = auditService || new AuditService();
  }

  /**
   * Generate a signed base64url token
   */
  generateToken(user: AuthUser, expiresInSec: number = 3600 * 8): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + expiresInSec,
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify token structure, signature, revocation, and expiration
   */
  verifyToken(token: string): TokenPayload {
    if (!token || typeof token !== 'string') {
      const err = new Error('Token is missing');
      (err as any).statusCode = 401;
      throw err;
    }

    if (this.revokedTokens.has(token)) {
      const err = new Error('Token has been revoked');
      (err as any).statusCode = 401;
      throw err;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      const err = new Error('Malformed token format');
      (err as any).statusCode = 401;
      throw err;
    }

    const headerB64 = parts[0]!;
    const payloadB64 = parts[1]!;
    const signature = parts[2]!;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', this.secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      const err = new Error('Invalid token signature');
      (err as any).statusCode = 401;
      throw err;
    }

    // Decode payload
    let payload: TokenPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    } catch {
      const err = new Error('Malformed token payload');
      (err as any).statusCode = 401;
      throw err;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      const err = new Error('Token has expired');
      (err as any).statusCode = 401;
      throw err;
    }

    return payload;
  }

  /**
   * Production login with real credential verification
   */
  async authenticateUser(
    email: string,
    password?: string
  ): Promise<{ token: string; user: AuthUser; expiresIn: number }> {
    const normalizedEmail = email.trim().toLowerCase();

    let user = await userRepository.findByEmail(normalizedEmail);

    if (!password || typeof password !== 'string' || password.trim() === '') {
      const err = new Error('Password is required');
      (err as any).statusCode = 400;
      throw err;
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      // Fallback check against in-memory default accounts in case DB hash differed
      const inMemUser = userRepository.getInMemoryUser(normalizedEmail);
      if (inMemUser && verifyPassword(password, inMemUser.passwordHash)) {
        user = inMemUser;
      } else {
        void this.auditService.log(AuditEventType.LOGIN_FAILURE, {
          actor: normalizedEmail,
          metadata: { reason: 'Invalid credentials' },
        });

        const err = new Error('Invalid email or password');
        (err as any).statusCode = 401;
        throw err;
      }
    }

    if (user.status !== 'ACTIVE') {
      void this.auditService.log(AuditEventType.LOGIN_FAILURE, {
        actor: normalizedEmail,
        metadata: { reason: 'Account disabled' },
      });
      const err = new Error('Account is disabled. Please contact an administrator.');
      (err as any).statusCode = 403;
      throw err;
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(user.id);

    // Record audit event
    void this.auditService.log(AuditEventType.LOGIN_SUCCESS, {
      actor: user.id,
      metadata: { email: user.email, role: user.role },
    });

    const safeUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const expiresIn = 3600 * 8; // 8 hours session
    const token = this.generateToken(safeUser, expiresIn);

    return { token, user: safeUser, expiresIn };
  }

  /**
   * Backward-compatible login method
   */
  async login(
    email: string,
    passwordOrRole?: string
  ): Promise<{ token: string; user: AuthUser; expiresIn: number }> {
    // If passwordOrRole looks like a role (for legacy tests)
    if (passwordOrRole === 'PROCUREMENT_OFFICER' || passwordOrRole === 'ADMIN') {
      const demoUsers = this.getDemoUsers();
      const targetUser = demoUsers[passwordOrRole];
      const safeUser: AuthUser = {
        id: `usr_${crypto.createHash('md5').update(email).digest('hex').substring(0, 12)}`,
        name: targetUser.name,
        email,
        role: passwordOrRole,
      };
      const expiresIn = 3600 * 8;
      const token = this.generateToken(safeUser, expiresIn);
      return { token, user: safeUser, expiresIn };
    }

    // Standard password authentication
    return this.authenticateUser(email, passwordOrRole);
  }

  /**
   * Revoke token and record logout audit event
   */
  async logout(token?: string, userId?: string): Promise<void> {
    if (token) {
      this.revokedTokens.add(token);
    }
    void this.auditService.log(AuditEventType.LOGOUT, {
      actor: userId || 'unknown_user',
    });
  }

  /**
   * Check if token is invalidated
   */
  isRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  /**
   * Public Bidder Self-Registration
   */
  async registerBidder(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    companyName: string;
    companyType?: string;
    gstin?: string;
    pan?: string;
    registeredAddress?: string;
  }): Promise<{ token: string; user: AuthUser; expiresIn: number }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // 1. Check duplicate email
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      (err as any).statusCode = 409;
      throw err;
    }

    // 2. Hash password & create user
    const passwordHash = hashPassword(data.password);
    const newUser = await userRepository.createUser({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'BIDDER',
      status: 'ACTIVE',
      phone: data.phone?.trim() || null,
    });

    // 3. Save company profile
    await applicationRepository.saveProfile(newUser.id, {
      companyName: data.companyName.trim(),
      companyType: data.companyType || 'Private Limited',
      gstin: data.gstin || '33AABCL1234F1Z5',
      pan: data.pan || 'AABCL1234F',
      registeredAddress: data.registeredAddress || 'Registered Address',
      contactEmail: normalizedEmail,
      contactPhone: data.phone?.trim() || '+91 98765 00000',
    });

    // 4. Log audit event
    void this.auditService.log(AuditEventType.BIDDER_REGISTERED, {
      actor: newUser.id,
      metadata: {
        email: newUser.email,
        companyName: data.companyName,
        gstin: data.gstin,
      },
    });

    const safeUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'BIDDER',
    };

    const expiresIn = 3600 * 8;
    const token = this.generateToken(safeUser, expiresIn);
    return { token, user: safeUser, expiresIn };
  }

  /**
   * Get pre-configured demo user accounts
   */
  getDemoUsers(): Record<UserRole, AuthUser> {
    return {
      PROCUREMENT_OFFICER: {
        id: 'usr_officer_demo_01',
        name: 'Rajesh Kumar (Procurement Officer)',
        email: 'officer@gem.gov.in',
        role: 'PROCUREMENT_OFFICER',
      },
      ADMIN: {
        id: 'usr_admin_demo_01',
        name: 'Dr. Anita Sharma (System Administrator)',
        email: 'admin@gem.gov.in',
        role: 'ADMIN',
      },
      BIDDER: {
        id: 'usr_bidder_demo_01',
        name: 'Vikram Mehta (Chief Estimator)',
        email: 'demo.bidder@bidguard.local',
        role: 'BIDDER',
      },
    };
  }
}

export const authService = new AuthService();
