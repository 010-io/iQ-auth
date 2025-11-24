/**
 * IdentityRegistry Unit Tests
 */

import { IdentityRegistry } from '../identity-registry';
import { InMemoryStorage } from '../../storage/in-memory';

describe('IdentityRegistry', () => {
  let registry: IdentityRegistry;
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
    registry = new IdentityRegistry(storage);
  });

  afterEach(() => {
    storage.clear();
  });

  describe('register', () => {
    it('should register a new identity', async () => {
      const identity = await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: { address: '0x123' },
        verified: false,
      });

      expect(identity).toBeDefined();
      expect(identity.id).toBeDefined();
      expect(identity.userId).toBe('user-123');
      expect(identity.type).toBe('wallet');
      expect(identity.provider).toBe('metamask');
      expect(identity.verified).toBe(false);
      expect(identity.createdAt).toBeInstanceOf(Date);
      expect(identity.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different identities', async () => {
      const identity1 = await registry.register({
        type: 'device',
        userId: 'user-123',
        provider: 'mobile',
        data: {},
        verified: true,
      });

      const identity2 = await registry.register({
        type: 'biometric',
        userId: 'user-123',
        provider: 'fingerprint',
        data: {},
        verified: true,
      });

      expect(identity1.id).not.toBe(identity2.id);
    });
  });

  describe('get', () => {
    it('should retrieve an identity by ID', async () => {
      const registered = await registry.register({
        type: 'social',
        userId: 'user-123',
        provider: 'linkedin',
        data: { linkedinId: 'igor' },
        verified: true,
      });

      const retrieved = await registry.get(registered.id);

      expect(retrieved).toEqual(registered);
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await registry.get('non-existent-id');

      expect(retrieved).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return all identities for a user', async () => {
      await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: {},
        verified: true,
      });

      await registry.register({
        type: 'device',
        userId: 'user-123',
        provider: 'mobile',
        data: {},
        verified: true,
      });

      await registry.register({
        type: 'social',
        userId: 'user-456',
        provider: 'linkedin',
        data: {},
        verified: true,
      });

      const identities = await registry.findByUser('user-123');

      expect(identities).toHaveLength(2);
      expect(identities.every(i => i.userId === 'user-123')).toBe(true);
    });

    it('should return empty array for user with no identities', async () => {
      const identities = await registry.findByUser('user-999');

      expect(identities).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update identity properties', async () => {
      const identity = await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: { address: '0x123' },
        verified: false,
      });

      const updated = await registry.update(identity.id, {
        verified: true,
        data: { address: '0xABC' },
      });

      expect(updated.verified).toBe(true);
      expect(updated.data.address).toBe('0xABC');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        identity.updatedAt.getTime()
      );
    });

    it('should not allow ID or createdAt changes', async () => {
      const identity = await registry.register({
        type: 'device',
        userId: 'user-123',
        provider: 'mobile',
        data: {},
        verified: true,
      });

      const originalId = identity.id;
      const originalCreatedAt = identity.createdAt;

      const updated = await registry.update(identity.id, {
        id: 'new-id' as any,
        createdAt: new Date('2020-01-01') as any,
      });

      expect(updated.id).toBe(originalId);
      expect(updated.createdAt).toEqual(originalCreatedAt);
    });

    it('should throw error for non-existent identity', async () => {
      await expect(
        registry.update('non-existent', { verified: true })
      ).rejects.toThrow('Identity non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete an identity', async () => {
      const identity = await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: {},
        verified: true,
      });

      const deleted = await registry.delete(identity.id);

      expect(deleted).toBe(true);

      const retrieved = await registry.get(identity.id);
      expect(retrieved).toBeNull();
    });

    it('should update user index after deletion', async () => {
      await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: {},
        verified: true,
      });

      const identity2 = await registry.register({
        type: 'device',
        userId: 'user-123',
        provider: 'mobile',
        data: {},
        verified: true,
      });

      await registry.delete(identity2.id);

      const identities = await registry.findByUser('user-123');
      expect(identities).toHaveLength(1);
      expect(identities[0].type).toBe('wallet');
    });

    it('should return false for non-existent identity', async () => {
      const deleted = await registry.delete('non-existent');

      expect(deleted).toBe(false);
    });
  });

  describe('verifyIdentity', () => {
    it('should verify an identity', async () => {
      const identity = await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: { address: '0x123' },
        verified: false,
      });

      const result = await registry.verifyIdentity(identity.id, {
        signature: 'proof',
      });

      expect(result.verified).toBe(true);
      expect(result.error).toBeUndefined();

      const updated = await registry.get(identity.id);
      expect(updated?.verified).toBe(true);
    });

    it('should return error for non-existent identity', async () => {
      const result = await registry.verifyIdentity('non-existent', {});

      expect(result.verified).toBe(false);
      expect(result.error).toBe('Identity not found');
    });
  });

  describe('deactivate', () => {
    it('should deactivate an identity', async () => {
      const identity = await registry.register({
        type: 'device',
        userId: 'user-123',
        provider: 'mobile',
        data: {},
        verified: true,
      });

      const result = await registry.deactivate(identity.id, 'User request');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      const updated = await registry.get(identity.id);
      expect(updated?.verified).toBe(false);
      expect(updated?.data.deactivated).toBe(true);
      expect(updated?.data.deactivationReason).toBe('User request');
    });

    it('should return error for non-existent identity', async () => {
      const result = await registry.deactivate('non-existent', 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Identity not found');
    });
  });

  describe('findByType', () => {
    it('should return all identities of a specific type', async () => {
      await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: {},
        verified: true,
      });

      await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'solana',
        data: {},
        verified: true,
      });

      await registry.register({
        type: 'device',
        userId: 'user-123',
        provider: 'mobile',
        data: {},
        verified: true,
      });

      const wallets = await registry.findByType('user-123', 'wallet');

      expect(wallets).toHaveLength(2);
      expect(wallets.every(i => i.type === 'wallet')).toBe(true);
    });
  });

  describe('findByProvider', () => {
    it('should return identity by provider', async () => {
      await registry.register({
        type: 'social',
        userId: 'user-123',
        provider: 'linkedin',
        data: {},
        verified: true,
      });

      await registry.register({
        type: 'social',
        userId: 'user-123',
        provider: 'github',
        data: {},
        verified: true,
      });

      const linkedin = await registry.findByProvider('user-123', 'linkedin');

      expect(linkedin).toBeDefined();
      expect(linkedin?.provider).toBe('linkedin');
    });

    it('should return null for non-existent provider', async () => {
      const result = await registry.findByProvider('user-123', 'twitter');

      expect(result).toBeNull();
    });
  });

  describe('hasVerifiedIdentity', () => {
    it('should return true if user has verified identity of type', async () => {
      await registry.register({
        type: 'biometric',
        userId: 'user-123',
        provider: 'fingerprint',
        data: {},
        verified: true,
      });

      const has = await registry.hasVerifiedIdentity('user-123', 'biometric');

      expect(has).toBe(true);
    });

    it('should return false if identity is not verified', async () => {
      await registry.register({
        type: 'wallet',
        userId: 'user-123',
        provider: 'metamask',
        data: {},
        verified: false,
      });

      const has = await registry.hasVerifiedIdentity('user-123', 'wallet');

      expect(has).toBe(false);
    });

    it('should return false if user has no identity of type', async () => {
      const has = await registry.hasVerifiedIdentity('user-123', 'government');

      expect(has).toBe(false);
    });
  });
});
