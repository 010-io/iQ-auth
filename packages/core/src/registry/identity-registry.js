"use strict";
/**
 * iQ-auth Multi-ID Registry
 *
 * Manages multiple identity types for users (device, biometric, social, wallet, government)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityRegistry = void 0;
const in_memory_1 = require("../storage/in-memory");
class IdentityRegistry {
    storage;
    storagePrefix = 'identity:';
    constructor(storage) {
        this.storage = storage || new in_memory_1.InMemoryStorage();
    }
    async register(identity) {
        const id = this.generateId();
        const now = new Date();
        const newIdentity = {
            ...identity,
            id,
            createdAt: now,
            updatedAt: now,
        };
        await this.storage.set(`${this.storagePrefix}${id}`, newIdentity);
        // Index by userId
        const userIdentities = await this.findByUser(identity.userId);
        await this.storage.set(`${this.storagePrefix}user:${identity.userId}`, [...userIdentities, newIdentity]);
        return newIdentity;
    }
    async get(id) {
        return this.storage.get(`${this.storagePrefix}${id}`);
    }
    async findByUser(userId) {
        const identities = await this.storage.get(`${this.storagePrefix}user:${userId}`);
        return identities || [];
    }
    async update(id, data) {
        const existing = await this.get(id);
        if (!existing) {
            throw new Error(`Identity ${id} not found`);
        }
        const updated = {
            ...existing,
            ...data,
            id: existing.id, // Prevent ID change
            createdAt: existing.createdAt, // Prevent createdAt change
            updatedAt: new Date(),
        };
        await this.storage.set(`${this.storagePrefix}${id}`, updated);
        return updated;
    }
    async delete(id) {
        const identity = await this.get(id);
        if (!identity) {
            return false;
        }
        // Remove from main storage
        await this.storage.delete(`${this.storagePrefix}${id}`);
        // Update user index
        const userIdentities = await this.findByUser(identity.userId);
        const filtered = userIdentities.filter(i => i.id !== id);
        await this.storage.set(`${this.storagePrefix}user:${identity.userId}`, filtered);
        return true;
    }
    /**
     * Verify an identity with proof
     */
    async verifyIdentity(id, _proof // Reserved for future signature verification
    ) {
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
    async deactivate(id, reason) {
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
    async findByType(userId, type) {
        const allIdentities = await this.findByUser(userId);
        return allIdentities.filter(identity => identity.type === type);
    }
    /**
     * Find identity by provider
     */
    async findByProvider(userId, provider) {
        const allIdentities = await this.findByUser(userId);
        const found = allIdentities.find(identity => identity.provider === provider);
        return found || null;
    }
    /**
     * Check if user has verified identity of a specific type
     */
    async hasVerifiedIdentity(userId, type) {
        const identities = await this.findByType(userId, type);
        return identities.some(identity => identity.verified);
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}
exports.IdentityRegistry = IdentityRegistry;
//# sourceMappingURL=identity-registry.js.map