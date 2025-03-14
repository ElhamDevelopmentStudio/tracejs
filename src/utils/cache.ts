/**
 * Utilities for caching fingerprint data to maintain consistency
 */

// Default cache validity period of 30 days
const DEFAULT_CACHE_VALIDITY = 30 * 24 * 60 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Save data to localStorage with the given key and expiration
 * Note: validityPeriod parameter isn't needed here since it's only used when retrieving
 */
export function saveToCache<T>(key: string, data: T): void {
  try {
    const cacheItem: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Failed to save data to cache (${key}):`, error);
  }
}

/**
 * Retrieve data from localStorage if it exists and is still valid
 * @returns The cached data if valid, null otherwise
 */
export function getFromCache<T>(
  key: string,
  validityPeriod: number = DEFAULT_CACHE_VALIDITY
): T | null {
  try {
    const cachedItem = localStorage.getItem(key);

    if (!cachedItem) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cachedItem);
    const now = Date.now();

    // Check if the cache is still valid
    if (now - timestamp < validityPeriod) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error(`Failed to retrieve data from cache (${key}):`, error);
    return null;
  }
}

/**
 * Generate a consistent key for storing fingerprint data
 * This ensures fingerprints for the same origin remain stable
 */
export function generateCacheKey(prefix: string): string {
  const origin = window.location.origin;

  // Create a simple hash of the origin to avoid potential storage issues
  // with special characters or long origins
  let hash = 0;
  for (let i = 0; i < origin.length; i++) {
    hash = (hash << 5) - hash + origin.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return `tracejs_${prefix}_${hash}`;
}
