/**
 * iQ-auth Multi-ID Registry
 * 
 * Manages multiple identity types for users (device, biometric, social, wallet, government)
 */

import { Identity, IIdentityRegistry, IStorageAdapter } from '../types';
import { InMemoryStorage } from '../storage/in-memory';

export class IdentityRegistry implements IIdentityRegistry {
  private storage: IStorageAdapter;
  private readonly storagePrefix = 'identity:';

  constructor(storage?: IStorageAdapter) {
    this.storage = storage || new InMemoryStorage();
  }

  async register(
    identity: Omit<Identity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Identity> {
    const id = this.generateId();
    const now = new Date();

    const newIdentity: Identity = {
      ...identity,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.set(
      `${this.storagePrefix}${id}`,
      newIdentity
    );

    // Index by userId
    const userIdentities = await this.findByUser(identity.userId);
    await this.storage.set(
      `${this.storagePrefix}user:${identity.userId}`,
      [...userIdentities, newIdentity]
    );

    return newIdentity;
  }

  async get(id: string): Promise<Identity | null> {
    return this.storage.get<Identity>(`${this.storagePrefix}${id}`);
  }

  async findByUser(userId: string): Promise<Identity[]> {
    const identities = await this.storage.get<Identity[]>(
      `${this.storagePrefix}user:${userId}`
    );
    return identities || [];
  }

  async update(id: string, data: Partial<Identity>): Promise<Identity> {
    const existing = await this.get(id);

    if (!existing) {
      throw new Error(`Identity ${id} not found`);
    }

    const updated: Identity = {
      ...existing,
      ...data,
      id: existing.id, // Prevent ID change
      createdAt: existing.createdAt, // Prevent createdAt change
      updatedAt: new Date(),
    };

    await this.storage.set(`${this.storagePrefix}${id}`, updated);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const identity = await this.get(id);

    if (!identity) {
      return false;
    }

    // Remove from main storage
    await this.storage.delete(`${this.storagePrefix}${id}`);

    // Update user index
    const userIdentities = await this.findByUser(identity.userId);
    const filtered = userIdentities.filter(i => i.id !== id);
    await this.storage.set(
      `${this.storagePrefix}user:${identity.userId}`,
      filtered
    );

    return true;
  }

  /**
   * Verify an identity with proof
   */
  async verifyIdentity(
    id: string,
    _proof: Record<string, unknown> // Reserved for future signature verification
  ): Promise<{ verified: boolean; error?: string }> {
    const identity = await this.get(id);

    if (!identity) {
      return { verified: false, error: 'Identity not found' };
    }

    // Mark as verified
    await this.update(id, { verified: true });

    return { verified: true };
  }

  /**
   * Deactivate an identity (soft delete)
   */
  async deactivate(
    id: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const identity = await this.get(id);

    if (!identity) {
      return { success: false, error: 'Identity not found' };
    }

    // Mark as deactivated
    await this.update(id, {
      verified: false,
      data: {
        ...identity.data,
        deactivated: true,
        deactivatedAt: new Date().toISOString(),
        deactivationReason: reason,
      },
    });

    return { success: true };
  }

  /**
   * Find identities by type
   */
  async findByType(userId: string, type: string): Promise<Identity[]> {
    const allIdentities = await this.findByUser(userId);
    return allIdentities.filter(identity => identity.type === type);
  }

  /**
   * Find identity by provider
   */
  async findByProvider(
    userId: string,
    provider: string
  ): Promise<Identity | null> {
    const allIdentities = await this.findByUser(userId);
    const found = allIdentities.find(
      identity => identity.provider === provider
    );
    return found || null;
  }

  /**
   * Check if user has verified identity of a specific type
   */
  async hasVerifiedIdentity(
    userId: string,
    type: string
  ): Promise<boolean> {
    const identities = await this.findByType(userId, type);
    return identities.some(identity => identity.verified);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
