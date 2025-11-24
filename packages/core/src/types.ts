/**
 * iQ-auth Core Types
 */

import { AUTH_METHODS, IDENTITY_TYPES } from './constants';

export type AuthMethod = (typeof AUTH_METHODS)[keyof typeof AUTH_METHODS];
export type IdentityType =
  (typeof IDENTITY_TYPES)[keyof typeof IDENTITY_TYPES];

/**
 * Core authentication interfaces
 */

export interface IAuthProvider {
  readonly name: string;
  readonly type: AuthMethod;
  authenticate(credentials: unknown): Promise<AuthResult>;
  verify(token: string): Promise<VerifyResult>;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface VerifyResult {
  valid: boolean;
  userId?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Multi-ID Registry interfaces
 */

export interface Identity {
  id: string;
  type: IdentityType;
  userId: string;
  provider: string;
  data: Record<string, unknown>;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIdentityRegistry {
  register(identity: Omit<Identity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Identity>;
  get(id: string): Promise<Identity | null>;
  findByUser(userId: string): Promise<Identity[]>;
  update(id: string, data: Partial<Identity>): Promise<Identity>;
  delete(id: string): Promise<boolean>;
}

/**
 * Plugin system interfaces
 */

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly type: string;
  initialize(config: Record<string, unknown>): Promise<void>;
  destroy(): Promise<void>;
}

export interface IAuthPlugin extends IPlugin {
  readonly provider: IAuthProvider;
}

/**
 * Storage adapter interfaces
 */

export interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

/**
 * Configuration types
 */

export interface CoreConfig {
  storage?: IStorageAdapter;
  enabledAuthMethods?: AuthMethod[];
  sessionTTL?: number;
  maxLoginAttempts?: number;
  plugins?: IPlugin[];
}
