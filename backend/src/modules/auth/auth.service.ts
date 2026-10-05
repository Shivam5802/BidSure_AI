import crypto from 'node:crypto';
import { AuthUser, TokenPayload, UserRole } from './auth.types.js';
import { userRepository, verifyPassword, hashPassword } from './user.repository.js';
import { AuditService } from '../../services/audit/audit.service.js';
import { AuditEventType } from '@prisma/client';
import { applicationRepository } from '../applications/application.repository.js';
import { env } from '../../config/env.js';

const DEFAULT_SECRET = env.JWT_SECRET;

const revokedTokenStore = new Map<string, number>();

function pruneExpiredRevokedTokens(): void {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of revokedTokenStore.entries()) {
    if (exp < now) revokedTokenStore.delete(token);
  }
}

export class AuthService {
  private secret: string;
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

    if (revokedTokenStore.has(token)) {
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
      void this.auditService.log(AuditEventType.LOGIN_FAILURE, {
        actor: normalizedEmail,
        metadata: { reason: 'Invalid credentials' },
      });

      const err = new Error('Invalid email or password');
      (err as any).statusCode = 401;
      throw err;
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

  async login(
    email: string,
    password?: string
  ): Promise<{ token: string; user: AuthUser; expiresIn: number }> {
    return this.authenticateUser(email, password);
  }

  /**
   * Revoke token and record logout audit event
   */
  async logout(token?: string, userId?: string): Promise<void> {
    if (token) {
      // Extract expiry from token payload to bound revocation TTL
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8'));
          const exp = payload.exp as number | undefined;
          revokedTokenStore.set(token, exp ?? Math.floor(Date.now() / 1000) + 3600 * 8);
        }
      } catch {
        revokedTokenStore.set(token, Math.floor(Date.now() / 1000) + 3600 * 8);
      }
      // Prune already-expired tokens to prevent unbounded growth
      pruneExpiredRevokedTokens();
    }
    void this.auditService.log(AuditEventType.LOGOUT, {
      actor: userId || 'unknown_user',
    });
  }

  /**
   * Check if token is invalidated
   */
  isRevoked(token: string): boolean {
    return revokedTokenStore.has(token);
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
      companyType: data.companyType || '',
      gstin: data.gstin || '',
      pan: data.pan || '',
      registeredAddress: data.registeredAddress || '',
      contactEmail: normalizedEmail,
      contactPhone: data.phone?.trim() || '',
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
      SUPER_ADMIN: {
        id: 'usr_superadmin_01',
        name: 'Super Admin',
        email: (env.SUPER_ADMIN_EMAIL || '').toLowerCase(),
        role: 'SUPER_ADMIN',
      },
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
