// Simple in-memory rate limiter.
// Works within a single serverless instance (warm function).
// For multi-instance production scale, replace with Upstash Redis.

interface RateLimitEntry {
  count: number
  reset: number
}

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count }
}

export function getIp(request: Request): string {
  return (
    (request.headers as Headers).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  )
}
