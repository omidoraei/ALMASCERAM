/**
 * Tiny TTL cache for Supabase reads. Admin pages repeatedly call the same list
 * endpoints (collections/series/products) across views; caching the response for
 * a few seconds avoids redundant network round-trips during navigation while
 * still being safe for soft-delete / restore flows (the TTL is intentionally short).
 */

type CacheEntry<T> = { value: T; expiresAt: number }

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (entry.expiresAt < Date.now()) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function cacheSet<T>(key: string, value: T, ttlMs = 15_000): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export async function cached<T>(key: string, loader: () => Promise<T>, ttlMs = 15_000): Promise<T> {
  const hit = cacheGet<T>(key)
  if (hit !== undefined) return hit
  const value = await loader()
  cacheSet(key, value, ttlMs)
  return value
}

/** Invalidate entries whose key starts with the given prefix. Use after mutations. */
export function cacheInvalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

/** Drop everything (call on sign-out or when session changes). */
export function cacheClear(): void {
  store.clear()
}
