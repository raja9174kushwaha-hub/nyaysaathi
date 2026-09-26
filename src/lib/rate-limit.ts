export interface RateLimitInfo {
  count: number
  lastRequestTime: number
}

// In-memory store for IP rate limiting
// Note: In a production serverless environment (like Vercel), this would reset on cold starts.
// For true production rate limiting across distributed edges, use Redis (e.g., Upstash) or Vercel KV.
const rateLimitStore = new Map<string, RateLimitInfo>()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15 // 15 requests per minute
const MAX_STORE_SIZE = 10_000 // Prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // Cleanup every 5 minutes

// Deterministic cleanup on interval instead of random probability
let lastCleanup = Date.now()

function cleanupStaleEntries(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const windowStart = now - RATE_LIMIT_WINDOW_MS
  rateLimitStore.forEach((value, key) => {
    if (value.lastRequestTime < windowStart) {
      rateLimitStore.delete(key)
    }
  })
}

export function checkRateLimit(ip: string): { success: boolean; limit: number; remaining: number; resetTime: Date } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Deterministic cleanup
  cleanupStaleEntries(now)

  // Safety: if store grows too large, clear it to prevent memory issues
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    rateLimitStore.clear()
  }

  let info = rateLimitStore.get(ip)

  if (!info || info.lastRequestTime < windowStart) {
    // New IP or window expired
    info = { count: 1, lastRequestTime: now }
    rateLimitStore.set(ip, info)
    return {
      success: true,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime: new Date(now + RATE_LIMIT_WINDOW_MS)
    }
  }

  // IP exists in the current window
  if (info.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      success: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      resetTime: new Date(info.lastRequestTime + RATE_LIMIT_WINDOW_MS)
    }
  }

  // Increment count
  info.count += 1
  info.lastRequestTime = now
  rateLimitStore.set(ip, info)

  return {
    success: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - info.count,
    resetTime: new Date(now + RATE_LIMIT_WINDOW_MS)
  }
}

export function getClientIp(req: Request): string {
  // In Next.js App Router, headers can be used to get IP
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback for local development
  return '127.0.0.1'
}

// Exported for testing
export { rateLimitStore, RATE_LIMIT_WINDOW_MS, MAX_REQUESTS_PER_WINDOW, MAX_STORE_SIZE }
