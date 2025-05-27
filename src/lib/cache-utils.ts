// Simple in-memory cache utility to reduce API calls and handle rate limiting

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 60 * 1000; // 1 minute default TTL

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns Cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // Check if item has expired
    const now = Date.now();
    if (now - item.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.data as T;
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if an item exists in the cache and is not expired
   * @param key Cache key
   * @returns True if item exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    // Check if item has expired
    const now = Date.now();
    if (now - item.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const apiCache = new ApiCache();
