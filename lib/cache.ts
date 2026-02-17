/**
 * Simple In-Memory Cache Utility
 * Used to prevent redundant expensive API/DB calls.
 */

type CacheEntry<T> = {
    data: T;
    expiry: number;
};

class SimpleCache {
    private static instance: SimpleCache;
    private store: Map<string, CacheEntry<any>> = new Map();

    private constructor() { }

    public static getInstance(): SimpleCache {
        if (!SimpleCache.instance) {
            SimpleCache.instance = new SimpleCache();
        }
        return SimpleCache.instance;
    }

    /**
     * Set a value in the cache
     * @param key Unique identifier
     * @param data Data to store
     * @param ttl Time to live in seconds
     */
    set(key: string, data: any, ttl: number = 30) {
        this.store.set(key, {
            data,
            expiry: Date.now() + (ttl * 1000)
        });
    }

    /**
     * Get a value from cache
     * @param key Unique identifier
     * @returns data or null if expired/non-existent
     */
    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.store.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Clear a specific key or everything
     */
    clear(key?: string) {
        if (key) {
            this.store.delete(key);
        } else {
            this.store.clear();
        }
    }
}

export const cache = SimpleCache.getInstance();
