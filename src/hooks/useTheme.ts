/**
 * Theme provider for the dark-mode toggle.
 *
 * - Reads the saved preference (localStorage key `almasceram-theme`).
 * - Falls back to the user's `prefers-color-scheme` media query.
 * - Applies the choice by setting `<html data-theme="...">` before the React
 *   tree hydrates, so users never see a "flash of unstyled theme" (FOUT).
 *
 * The inline init script lives in `index.html`; this module exposes the
 * `useTheme` hook for the React side and a `getInitialTheme()` helper for
 * tests.
 */
import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'almasceram-theme'

function detectInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* localStorage might be unavailable in private mode */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getInitialTheme(): Theme {
  return detectInitialTheme()
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => detectInitialTheme())

  // Apply on mount + whenever the state changes.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Follow the OS preference when the user hasn't explicitly chosen.
  useEffect(() => {
    let stored: string | null = null
    try { stored = window.localStorage.getItem(STORAGE_KEY) } catch { /* noop */ }
    if (stored === 'light' || stored === 'dark') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event: MediaQueryListEvent) => setTheme(event.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      return next
    })
  }, [])

  // Public setTheme: same as React's setter, but also persists the choice.
  const setTheme = useCallback((next: Theme) => {
    persistTheme(next)
    setThemeState(next)
  }, [])

  return { theme, toggle, setTheme }
}

function persistTheme(theme: Theme) {
  try { window.localStorage.setItem(STORAGE_KEY, theme) } catch { /* private mode */ }
}
