import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract storage interface for quiz data
 * Currently uses in-memory storage, easily replaceable with Redis
 */
class StorageService {
  constructor() {
    // In-memory storage for now - will be replaced with Redis client
    this.storage = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Store quiz session data
   * @param {string} sessionId - Unique session identifier
   * @param {Object} data - Quiz data to store
   * @param {number} ttlSeconds - Time to live in seconds (default 24 hours)
   */
  async setQuizSession(sessionId, data, ttlSeconds = 86400) {
    const key = `quiz:session:${sessionId}`;
    
    // Store data
    this.storage.set(key, {
      ...data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString()
    });

    // Set TTL cleanup
    this._setTTL(key, ttlSeconds);
    
    return true;
  }

  /**
   * Retrieve quiz session data
   * @param {string} sessionId - Session identifier
   */
  async getQuizSession(sessionId) {
    const key = `quiz:session:${sessionId}`;
    const data = this.storage.get(key);
    
    if (!data) return null;
    
    // Check if expired
    if (new Date() > new Date(data.expiresAt)) {
      this.storage.delete(key);
      this._clearTTL(key);
      return null;
    }
    
    return data;
  }

  /**
   * Update quiz progress
   * @param {string} sessionId - Session identifier
   * @param {Object} progressData - Progress update
   */
  async updateQuizProgress(sessionId, progressData) {
    const existing = await this.getQuizSession(sessionId);
    if (!existing) return false;
    
    const updated = {
      ...existing,
      ...progressData,
      updatedAt: new Date().toISOString()
    };
    
    return this.setQuizSession(sessionId, updated);
  }

  /**
   * Delete quiz session
   * @param {string} sessionId - Session identifier
   */
  async deleteQuizSession(sessionId) {
    const key = `quiz:session:${sessionId}`;
    this.storage.delete(key);
    this._clearTTL(key);
    return true;
  }

  /**
   * Store rate limiting data
   * @param {string} identifier - IP or user identifier
   * @param {string} action - Action being rate limited
   * @param {number} count - Current count
   * @param {number} ttlSeconds - TTL in seconds
   */
  async setRateLimit(identifier, action, count, ttlSeconds = 3600) {
    const key = `ratelimit:${action}:${identifier}`;
    this.storage.set(key, { count, createdAt: new Date().toISOString() });
    this._setTTL(key, ttlSeconds);
    return true;
  }

  /**
   * Get rate limiting data
   * @param {string} identifier - IP or user identifier
   * @param {string} action - Action being rate limited
   */
  async getRateLimit(identifier, action) {
    const key = `ratelimit:${action}:${identifier}`;
    return this.storage.get(key) || { count: 0 };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return uuidv4();
  }

  /**
   * Private method to set TTL cleanup
   */
  _setTTL(key, seconds) {
    // Clear existing timer
    this._clearTTL(key);
    
    // Set new timer
    const timer = setTimeout(() => {
      this.storage.delete(key);
      this.ttlTimers.delete(key);
    }, seconds * 1000);
    
    this.ttlTimers.set(key, timer);
  }

  /**
   * Private method to clear TTL timer
   */
  _clearTTL(key) {
    const timer = this.ttlTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.ttlTimers.delete(key);
    }
  }

  /**
   * Clear all rate limit data (for development)
   */
  async clearRateLimits() {
    const keysToDelete = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith('rate:')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.storage.delete(key);
      this._clearTTL(key);
    });
    
    return keysToDelete.length;
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      const testKey = 'health:test';
      await this.storage.set(testKey, { test: true });
      const result = this.storage.get(testKey);
      this.storage.delete(testKey);
      return !!result;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const storageService = new StorageService();

export default storageService;

/**
 * Redis migration helper - when ready to switch to Redis:
 * 
 * 1. Replace constructor with Redis client initialization
 * 2. Replace Map operations with Redis commands:
 *    - this.storage.set() → redis.setex()
 *    - this.storage.get() → redis.get()
 *    - this.storage.delete() → redis.del()
 * 3. Remove manual TTL management (Redis handles this)
 * 4. Update healthCheck to use Redis ping
 * 
 * The interface remains the same, making the switch seamless.
 */
