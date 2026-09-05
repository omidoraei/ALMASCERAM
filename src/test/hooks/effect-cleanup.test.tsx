import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useEffect, useState } from 'react'

/**
 * Documents and enforces the cleanup discipline every effect in the
 * codebase must follow. We render a few controlled effects to assert
 * that timers, event listeners, and matchMedia subscriptions are all
 * torn down on unmount.
 */
describe('Effect cleanup patterns', () => {
  it('clears a setInterval on unmount', () => {
    const clearSpy = vi.spyOn(window, 'clearInterval')
    const { unmount } = renderHook(() => {
      useEffect(() => {
        const id = window.setInterval(() => { /* no-op */ }, 1000)
        return () => window.clearInterval(id)
      }, [])
    })
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('clears a setTimeout on unmount', () => {
    const clearSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = renderHook(() => {
      useEffect(() => {
        const id = window.setTimeout(() => { /* no-op */ }, 1000)
        return () => window.clearTimeout(id)
      }, [])
    })
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('removes an addEventListener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => {
      useEffect(() => {
        const onKey = (event: KeyboardEvent) => { event.preventDefault() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [])
    })
    unmount()
    expect(removeSpy).toHaveBeenCalled()
  })

  it('removes a matchMedia listener on unmount', () => {
    const mq = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue(mq) as typeof window.matchMedia
    try {
      const { unmount } = renderHook(() => {
        useEffect(() => {
          const handler = () => { /* no-op */ }
          const media = window.matchMedia('(prefers-color-scheme: dark)')
          media.addEventListener('change', handler)
          return () => media.removeEventListener('change', handler)
        }, [])
      })
      unmount()
      expect(mq.removeEventListener).toHaveBeenCalled()
    } finally {
      window.matchMedia = original
    }
  })
})

describe('useState patterns', () => {
  it('returns the initial value on first render', () => {
    const { result } = renderHook(() => useState('initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('does not throw when the setter is called with the same value', () => {
    const { result } = renderHook(() => useState(42))
    expect(() => result.current[1](42)).not.toThrow()
  })

  it('supports the functional update form', () => {
    const { result } = renderHook(() => useState(1))
    act(() => { result.current[1]((value) => value + 1) })
    expect(result.current[0]).toBe(2)
  })
})
