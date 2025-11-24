/**
 * Email/Password Authentication Provider
 * 
 * Fallback authentication method using email and password
 */

import {
  IAuthProvider,
  AuthResult,
  VerifyResult,
} from '../types';
import { createHash, randomBytes } from 'crypto';

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface EmailPasswordConfig {
  passwordMinLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  saltRounds?: number;
}

export class EmailPasswordProvider implements IAuthProvider {
  readonly name = 'email-password';
  readonly type = 'password';

  private config: EmailPasswordConfig;
  private users: Map<
    string,
    {
      email: string;
      passwordHash: string;
      salt: string;
      userId: string;
    }
  > = new Map();

  constructor(config: EmailPasswordConfig = {}) {
    this.config = {
      passwordMinLength: config.passwordMinLength || 8,
      requireUppercase: config.requireUppercase ?? true,
      requireLowercase: config.requireLowercase ?? true,
      requireNumbers: config.requireNumbers ?? true,
      requireSpecialChars: config.requireSpecialChars ?? false,
      saltRounds: config.saltRounds || 10,
    };
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Validate email
    if (!this.isValidEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check if user already exists
    if (this.users.has(email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }

    // Validate password
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    // Hash password
    const salt = this.generateSalt();
    const passwordHash = this.hashPassword(password, salt);

    // Store user
    this.users.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      passwordHash,
      salt,
      userId,
    });

    return { success: true };
  }

  /**
   * Authenticate user
   */
  async authenticate(credentials: unknown): Promise<AuthResult> {
    const creds = credentials as EmailPasswordCredentials;

    if (!creds.email || !creds.password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    const user = this.users.get(creds.email.toLowerCase());

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    const passwordHash = this.hashPassword(creds.password, user.salt);

    if (passwordHash !== user.passwordHash) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Generate session token
    const token = this.generateToken(user.userId);

    return {
      success: true,
      token,
      userId: user.userId,
      metadata: {
        email: user.email,
        authMethod: 'email-password',
      },
    };
  }

  /**
   * Verify token
   */
  async verify(token: string): Promise<VerifyResult> {
    try {
      // Simple token format: userId:timestamp:signature
      const parts = token.split(':');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [userId, timestamp, signature] = parts;

      // Verify signature
      const expectedSignature = this.signToken(userId, timestamp);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid token signature' };
      }

      // Check expiration (24 hours)
      const tokenTime = parseInt(timestamp, 10);
      const now = Date.now();
      const expiresAt = new Date(tokenTime + 24 * 60 * 60 * 1000);

      if (now > expiresAt.getTime()) {
        return { valid: false, error: 'Token expired' };
      }

      return {
        valid: true,
        userId,
        expiresAt,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Token verification failed',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.users.get(email.toLowerCase());

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify old password
    const oldPasswordHash = this.hashPassword(oldPassword, user.salt);
    if (oldPasswordHash !== user.passwordHash) {
      return { success: false, error: 'Invalid current password' };
    }

    // Validate new password
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    // Update password
    const newSalt = this.generateSalt();
    const newPasswordHash = this.hashPassword(newPassword, newSalt);

    this.users.set(email.toLowerCase(), {
      ...user,
      passwordHash: newPasswordHash,
      salt: newSalt,
    });

    return { success: true };
  }

  /**
   * Delete user
   */
  async deleteUser(email: string): Promise<boolean> {
    return this.users.delete(email.toLowerCase());
  }

  // Private helper methods

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(
    password: string
  ): { valid: boolean; error?: string } {
    if (password.length < (this.config.passwordMinLength || 8)) {
      return {
        valid: false,
        error: `Password must be at least ${this.config.passwordMinLength} characters`,
      };
    }

    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one uppercase letter',
      };
    }

    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one lowercase letter',
      };
    }

    if (this.config.requireNumbers && !/[0-9]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one number',
      };
    }

    if (
      this.config.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        valid: false,
        error: 'Password must contain at least one special character',
      };
    }

    return { valid: true };
  }

  private generateSalt(): string {
    return randomBytes(16).toString('hex');
  }

  private hashPassword(password: string, salt: string): string {
    return createHash('sha256')
      .update(password + salt)
      .digest('hex');
  }

  private generateToken(userId: string): string {
    const timestamp = Date.now().toString();
    const signature = this.signToken(userId, timestamp);
    return `${userId}:${timestamp}:${signature}`;
  }

  private signToken(userId: string, timestamp: string): string {
    const secret = process.env.JWT_SECRET || 'change-this-in-production';
    return createHash('sha256')
      .update(`${userId}:${timestamp}:${secret}`)
      .digest('hex');
  }
}
