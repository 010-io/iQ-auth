/**
 * iQ-auth In-Memory Storage Adapter
 * 
 * Simple in-memory storage for development and testing
 */

import { IStorageAdapter } from '../types';

interface StorageEntry<T> {
  value: T;
  expiresAt?: number;
}

export class InMemoryStorage implements IStorageAdapter {
  private store: Map<string, StorageEntry<unknown>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: StorageEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    };

    this.store.set(key, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
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
  clear(): void {
    this.store.clear();
  }

  /**
   * Get number of entries
   */
  size(): number {
    return this.store.size;
  }
}
