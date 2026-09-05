import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { getInitialTheme, useTheme } from '../../hooks/useTheme'

/**
 * We rely on the in-memory localStorage stub installed by `src/test/setup.ts`.
 * That stub is shared across tests, so we manipulate it through `globalThis.localStorage`
 * (which is the same object exposed as `window.localStorage`).
 */
const storage = globalThis.localStorage as Storage

beforeEach(() => {
  storage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('data-theme')
})

describe('useTheme', () => {
  it('starts with the stored theme when localStorage has a value', () => {
    storage.setItem('almasceram-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('falls back to the system preference when nothing is stored', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true, // system says dark
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('falls back to light by default', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('toggle() flips the theme and persists it', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
    expect(storage.getItem('almasceram-theme')).toBe('dark')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('light')
    expect(storage.getItem('almasceram-theme')).toBe('light')
  })

  it('setTheme() updates the state directly', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(result.current.theme).toBe('dark')
    expect(storage.getItem('almasceram-theme')).toBe('dark')
  })

  it('applies data-theme to <html> when the state changes', () => {
    const { result } = renderHook(() => useTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})

describe('getInitialTheme', () => {
  it('returns "light" when nothing is stored and the system is light', () => {
    expect(getInitialTheme()).toBe('light')
  })
  it('returns "dark" when localStorage is "dark"', () => {
    storage.setItem('almasceram-theme', 'dark')
    expect(getInitialTheme()).toBe('dark')
  })
})
