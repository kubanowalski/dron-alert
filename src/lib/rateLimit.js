/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider using Redis
 */

class RateLimiter {
    constructor() {
        this.requests = new Map();
        // Clean up old entries every 15 minutes
        setInterval(() => this.cleanup(), 15 * 60 * 1000);
    }

    /**
     * Check if request should be rate limited
     * @param {string} identifier - IP address or user ID
     * @param {number} limit - Max requests allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {Object} { success: boolean, remaining: number, resetTime: number }
     */
    check(identifier, limit, windowMs) {
        const now = Date.now();
        const key = `${identifier}`;

        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }

        const requestLog = this.requests.get(key);

        // Remove requests outside the current window
        const validRequests = requestLog.filter(timestamp => now - timestamp < windowMs);
        this.requests.set(key, validRequests);

        if (validRequests.length >= limit) {
            const oldestRequest = validRequests[0];
            const resetTime = oldestRequest + windowMs;

            return {
                success: false,
                remaining: 0,
                resetTime: Math.ceil((resetTime - now) / 1000), // seconds until reset
            };
        }

        // Add current request
        validRequests.push(now);
        this.requests.set(key, validRequests);

        return {
            success: true,
            remaining: limit - validRequests.length,
            resetTime: Math.ceil(windowMs / 1000),
        };
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour

        for (const [key, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(t => now - t < maxAge);
            if (validTimestamps.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validTimestamps);
            }
        }
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Get client identifier (IP address)
 */
export function getClientIdentifier(request) {
    // Try to get real IP from various headers (for proxies/load balancers)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback to connection IP (not always available in serverless)
    return 'unknown-ip';
}

/**
 * Rate limit middleware for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export function rateLimitAuth(request) {
    const identifier = getClientIdentifier(request);
    return rateLimiter.check(identifier, 5, 15 * 60 * 1000); // 5 req / 15min
}

/**
 * Rate limit middleware for registration
 * Limits: 3 requests per hour per IP
 */
export function rateLimitRegister(request) {
    const identifier = getClientIdentifier(request);
    return rateLimiter.check(identifier, 3, 60 * 60 * 1000); // 3 req / hour
}

/**
 * Rate limit middleware for API endpoints
 * Limits: 100 requests per hour per IP
 */
export function rateLimitAPI(request) {
    const identifier = getClientIdentifier(request);
    return rateLimiter.check(identifier, 100, 60 * 60 * 1000); // 100 req / hour
}

/**
 * Rate limit middleware for user-specific actions (when authenticated)
 * Limits: 60 requests per hour per user
 */
export function rateLimitUser(userId) {
    const identifier = `user:${userId}`;
    return rateLimiter.check(identifier, 60, 60 * 60 * 1000); // 60 req / hour
}
