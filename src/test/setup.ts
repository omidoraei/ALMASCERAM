/**
 * Test setup for Vitest. Installs an in-memory localStorage/sessionStorage stub
 * before any module is imported, so Zustand's `persist` middleware (which
 * captures `globalThis.localStorage` at module load) sees the stub.
 */
const { vi, beforeAll, beforeEach, afterEach } = await import('vitest')

class MemoryStorage implements Storage {
  private map = new Map<string, string>()
  get length(): number { return this.map.size }
  clear(): void { this.map.clear() }
  getItem(key: string): string | null { return this.map.get(key) ?? null }
  key(index: number): string | null { return [...this.map.keys()][index] ?? null }
  removeItem(key: string): void { this.map.delete(key) }
  setItem(key: string, value: string): void { this.map.set(key, value) }
}

const memoryStorage = new MemoryStorage()
const memorySession = new MemoryStorage()

// Replace the globals BEFORE any application module is imported. This works
// because Vitest evaluates this setup file before the test files (and their
// imports) are executed.
;(globalThis as { localStorage?: Storage }).localStorage = memoryStorage
;(globalThis as { sessionStorage?: Storage }).sessionStorage = memorySession
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { configurable: true, get: () => memoryStorage })
  Object.defineProperty(window, 'sessionStorage', { configurable: true, get: () => memorySession })
}

await import('@testing-library/jest-dom/vitest')
const { cleanup } = await import('@testing-library/react')

beforeEach(() => {
  memoryStorage.clear()
  memorySession.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeAll(() => {
  // Intentionally empty — global stubs are already installed above.
})
