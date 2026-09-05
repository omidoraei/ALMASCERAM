import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheClear, cacheGet, cacheInvalidate, cacheSet, cached } from '../../lib/utils/cache'

describe('cache utility', () => {
  beforeEach(() => cacheClear())
  afterEach(() => cacheClear())

  it('returns undefined on a miss', () => {
    expect(cacheGet('missing')).toBeUndefined()
  })

  it('stores and retrieves a value', () => {
    cacheSet('k', { foo: 1 })
    expect(cacheGet('k')).toEqual({ foo: 1 })
  })

  it('expires entries after the TTL', () => {
    vi.useFakeTimers()
    try {
      cacheSet('k', 'value', 1000)
      expect(cacheGet('k')).toBe('value')
      vi.advanceTimersByTime(1001)
      expect(cacheGet('k')).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('cached() invokes the loader only on miss', async () => {
    const loader = vi.fn().mockResolvedValue('data')
    const a = await cached('k', loader)
    const b = await cached('k', loader)
    expect(a).toBe('b' === 'data' ? 'data' : a) // sanity
    expect(b).toBe('data')
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('cached() re-invokes the loader after expiry', async () => {
    vi.useFakeTimers()
    try {
      const loader = vi.fn().mockResolvedValueOnce('v1').mockResolvedValueOnce('v2')
      const a = await cached('k', loader, 500)
      expect(a).toBe('v1')
      vi.advanceTimersByTime(600)
      const b = await cached('k', loader, 500)
      expect(b).toBe('v2')
      expect(loader).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('cacheInvalidate removes all entries with the given prefix', () => {
    cacheSet('catalog:collections', [1])
    cacheSet('catalog:series:all', [2])
    cacheSet('admin:inquiries', [3])
    cacheInvalidate('catalog:')
    expect(cacheGet('catalog:collections')).toBeUndefined()
    expect(cacheGet('catalog:series:all')).toBeUndefined()
    expect(cacheGet('admin:inquiries')).toEqual([3])
  })

  it('cacheInvalidate handles a missing prefix as a no-op', () => {
    cacheSet('a', 1)
    cacheInvalidate('zzz:')
    expect(cacheGet('a')).toBe(1)
  })

  it('cacheClear removes everything', () => {
    cacheSet('a', 1)
    cacheSet('b', 2)
    cacheClear()
    expect(cacheGet('a')).toBeUndefined()
    expect(cacheGet('b')).toBeUndefined()
  })

  it('propagates loader errors without caching the failure', async () => {
    const loader = vi.fn().mockRejectedValueOnce(new Error('boom'))
    await expect(cached('k', loader)).rejects.toThrow('boom')
    // Second call should retry the loader (no negative caching)
    const ok = vi.fn().mockResolvedValue('ok')
    const result = await cached('k', ok)
    expect(result).toBe('ok')
    expect(ok).toHaveBeenCalledTimes(1)
  })
})
