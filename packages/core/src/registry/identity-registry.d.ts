/**
 * iQ-auth Multi-ID Registry
 *
 * Manages multiple identity types for users (device, biometric, social, wallet, government)
 */
import { Identity, IIdentityRegistry, IStorageAdapter } from '../types';
export declare class IdentityRegistry implements IIdentityRegistry {
    private storage;
    private readonly storagePrefix;
    constructor(storage?: IStorageAdapter);
    register(identity: Omit<Identity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Identity>;
    get(id: string): Promise<Identity | null>;
    findByUser(userId: string): Promise<Identity[]>;
    update(id: string, data: Partial<Identity>): Promise<Identity>;
    delete(id: string): Promise<boolean>;
    /**
     * Verify an identity with proof
     */
    verifyIdentity(id: string, _proof: Record<string, unknown>): Promise<{
        verified: boolean;
        error?: string;
    }>;
    /**
     * Deactivate an identity (soft delete)
     */
    deactivate(id: string, reason: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Find identities by type
     */
    findByType(userId: string, type: string): Promise<Identity[]>;
    /**
     * Find identity by provider
     */
    findByProvider(userId: string, provider: string): Promise<Identity | null>;
    /**
     * Check if user has verified identity of a specific type
     */
    hasVerifiedIdentity(userId: string, type: string): Promise<boolean>;
    private generateId;
}
//# sourceMappingURL=identity-registry.d.ts.map