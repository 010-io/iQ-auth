/**
 * iQ-auth In-Memory Storage Adapter
 *
 * Simple in-memory storage for development and testing
 */
import { IStorageAdapter } from '../types';
export declare class InMemoryStorage implements IStorageAdapter {
    private store;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    /**
     * Clear all entries (useful for testing)
     */
    clear(): void;
    /**
     * Get number of entries
     */
    size(): number;
}
//# sourceMappingURL=in-memory.d.ts.map