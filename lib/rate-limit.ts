import redis from './redis';

// Use the centralized Redis client instead of creating a separate instance

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  reset?: number;
}

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const bucketKey = `rl:${key}:${Math.floor(now / windowSeconds)}`;

    const pipeline = redis.pipeline();
    pipeline.incr(bucketKey);
    pipeline.expire(bucketKey, windowSeconds);

    const results = await pipeline.exec();
    if (!results) return { allowed: false };

    const count = Number(results[0]?.[1] || 0);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      reset: (Math.floor(now / windowSeconds) + 1) * windowSeconds
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true }; // Fail open for availability
  }
}

export async function ensureIdempotent(id: string, ttlSeconds = 60): Promise<boolean> {
  try {
    const key = `idem:${id}`;

    // Use SETNX to set the key only if it doesn't exist
    const result = await redis.setnx(key, '1');

    if (result === 1) {
      // Key was set successfully (didn't exist before)
      // Now set the expiration
      await redis.expire(key, ttlSeconds);
      return true;
    }

    // Key already existed, not idempotent
    return false;
  } catch (error) {
    console.error('Idempotency check error:', error);
    return true; // Fail open for availability
  }
}
