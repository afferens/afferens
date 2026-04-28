import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Upstash Redis — works across all serverless instances.
// Falls back to in-memory if env vars aren't set (local dev / cold start before config).
let upstash: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  upstash = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'afferens',
  })
}

// In-memory fallback (single instance only — not reliable across serverless replicas)
interface Entry { count: number; reset: number }
const store = new Map<string, Entry>()

function inMemoryCheck(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now >= entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean }> {
  if (upstash) {
    const { success } = await upstash.limit(key)
    return { allowed: success }
  }
  return { allowed: inMemoryCheck(key, maxRequests, windowMs) }
}

export function getIp(request: Request): string {
  return (
    (request.headers as Headers).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  )
}
