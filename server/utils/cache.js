/**
 * Simple in-memory cache for frequently accessed data
 * Helps reduce database load for homepage data like featured products and hot categories
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any} Cached data or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set cached data with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 5 minutes)
   */
  set(key, data, ttlSeconds = 300) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });

    // Set auto-cleanup timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);
    
    this.timers.set(key, timer);
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Invalidate cache by pattern (prefix)
   * @param {string} prefix - Key prefix to match
   */
  invalidateByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }
  }
}

// Singleton instance
const cache = new SimpleCache();

// Cache keys
const CACHE_KEYS = {
  FEATURED_PRODUCTS: 'featured_products',
  HOT_CATEGORIES: 'hot_categories',
  FEATURED_CATEGORIES: 'featured_categories',
  ADMIN_DASHBOARD_OVERVIEW: 'admin_dashboard_overview',
  ADMIN_STATS_COUNTS: 'admin_stats_counts',
  DASHBOARD_OVERVIEW: 'dashboard_overview_',
  PRODUCTS_LIST: 'products_list_',
  CATEGORIES_LIST: 'categories_list',
  BRANDS_LIST: 'brands_list',
};

// Cache TTL in seconds
const CACHE_TTL = {
  FEATURED_PRODUCTS: 300,   // 5 minutes
  HOT_CATEGORIES: 300,       // 5 minutes
  FEATURED_CATEGORIES: 300,  // 5 minutes
  ADMIN_DASHBOARD_OVERVIEW: 60, // 1 minute (admin needs fresher data)
  ADMIN_STATS_COUNTS: 60,    // 1 minute
  DASHBOARD_OVERVIEW: 120,   // 2 minutes
  PRODUCTS_LIST: 180,        // 3 minutes
  CATEGORIES_LIST: 300,      // 5 minutes
  BRANDS_LIST: 300,          // 5 minutes
};

module.exports = {
  cache,
  CACHE_KEYS,
  CACHE_TTL
};
