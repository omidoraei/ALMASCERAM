import { describe, expect, it } from 'vitest'
import { isSameOriginPath, safeRedirectPath } from '../../lib/utils/safe-redirect'

describe('safeRedirectPath — open-redirect prevention', () => {
  it('accepts a plain same-origin path', () => {
    expect(safeRedirectPath('/admin')).toBe('/admin')
    expect(safeRedirectPath('/account/inquiries')).toBe('/account/inquiries')
  })

  it('accepts a path with query string and fragment', () => {
    expect(safeRedirectPath('/admin/inquiries?status=submitted#top')).toBe('/admin/inquiries?status=submitted#top')
  })

  it('rejects a protocol-relative URL (//evil.com)', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/')
    expect(safeRedirectPath('//evil.com/admin')).toBe('/')
  })

  it('rejects an absolute URL with a different host', () => {
    expect(safeRedirectPath('https://evil.com/admin')).toBe('/')
    expect(safeRedirectPath('http://evil.com')).toBe('/')
  })

  it('rejects javascript: and data: schemes', () => {
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(safeRedirectPath('data:text/html,<script>alert(1)</script>')).toBe('/')
  })

  it('rejects a backslash trick (\\evil.com)', () => {
    expect(safeRedirectPath('/\\evil.com')).toBe('/')
    expect(safeRedirectPath('\\\\evil.com')).toBe('/')
  })

  it('rejects paths with whitespace or control characters', () => {
    expect(safeRedirectPath('/admin\u0000')).toBe('/')
    expect(safeRedirectPath('/admin page')).toBe('/')
  })

  it('handles double-encoded input by decoding first', () => {
    // %2F%2Fevil.com decodes to //evil.com
    expect(safeRedirectPath('%2F%2Fevil.com')).toBe('/')
  })

  it('returns the fallback for null, undefined, or empty input', () => {
    expect(safeRedirectPath(null)).toBe('/')
    expect(safeRedirectPath(undefined)).toBe('/')
    expect(safeRedirectPath('')).toBe('/')
  })

  it('returns the fallback for malformed percent-encoding', () => {
    expect(safeRedirectPath('%E0%A4%A')).toBe('/')
  })

  it('uses the supplied fallback when the candidate is unsafe', () => {
    expect(safeRedirectPath('//evil.com', '/account')).toBe('/account')
  })
})

describe('isSameOriginPath', () => {
  it('returns true for safe paths', () => {
    expect(isSameOriginPath('/admin')).toBe(true)
    expect(isSameOriginPath('/account?tab=inquiries')).toBe(true)
  })

  it('returns false for unsafe paths', () => {
    expect(isSameOriginPath('//evil.com')).toBe(false)
    expect(isSameOriginPath('https://evil.com')).toBe(false)
    expect(isSameOriginPath('javascript:alert(1)')).toBe(false)
    expect(isSameOriginPath('')).toBe(false)
    expect(isSameOriginPath('admin')).toBe(false) // must start with /
  })
})
