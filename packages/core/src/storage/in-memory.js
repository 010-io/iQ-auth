"use strict";
/**
 * iQ-auth In-Memory Storage Adapter
 *
 * Simple in-memory storage for development and testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStorage = void 0;
class InMemoryStorage {
    store = new Map();
    async get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }
        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttl) {
        const entry = {
            value,
            expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
        };
        this.store.set(key, entry);
    }
    async delete(key) {
        return this.store.delete(key);
    }
    async exists(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return false;
        }
        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Clear all entries (useful for testing)
     */
    clear() {
        this.store.clear();
    }
    /**
     * Get number of entries
     */
    size() {
        return this.store.size;
    }
}
exports.InMemoryStorage = InMemoryStorage;
//# sourceMappingURL=in-memory.js.map