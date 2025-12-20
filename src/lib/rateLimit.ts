import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// In-memory store for rate limiting
// For production, use Redis or a similar distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > 60 * 60 * 1000) { // 1 hour
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
}

// Default configurations for different routes
export const rateLimitConfigs = {
  login: { windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts. Please try again in 15 minutes.' },
  register: { windowMs: 60 * 60 * 1000, max: 3, message: 'Too many registration attempts. Please try again later.' },
  forgotPassword: { windowMs: 60 * 60 * 1000, max: 3, message: 'Too many password reset requests. Please try again later.' },
  api: { windowMs: 60 * 1000, max: 100, message: 'Too many requests. Please slow down.' },
  strict: { windowMs: 60 * 1000, max: 10, message: 'Rate limit exceeded. Please wait a moment.' },
};

export function getClientIp(request: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

export function rateLimit(
  request: Request,
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.api
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = `${identifier}:${getClientIp(request)}`;

  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First request
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { success: true, remaining: config.max - 1, reset: now + config.windowMs };
  }

  // Check if window has expired
  if (now - entry.firstRequest > config.windowMs) {
    // Reset the window
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { success: true, remaining: config.max - 1, reset: now + config.windowMs };
  }

  // Increment count
  entry.count++;

  if (entry.count > config.max) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      reset: entry.firstRequest + config.windowMs,
    };
  }

  return {
    success: true,
    remaining: config.max - entry.count,
    reset: entry.firstRequest + config.windowMs,
  };
}

export function createRateLimitResponse(
  config: RateLimitConfig = rateLimitConfigs.api,
  reset: number
): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: config.message || 'Rate limit exceeded',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}

// Helper to apply rate limiting to a route
export function withRateLimit(
  request: Request,
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.api
): NextResponse | null {
  const result = rateLimit(request, identifier, config);

  if (!result.success) {
    return createRateLimitResponse(config, result.reset);
  }

  return null; // Proceed with the request
}
