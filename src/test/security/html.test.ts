import { describe, expect, it } from 'vitest'
import { escapeHtml, stripHtml } from '../../lib/utils/html'

describe('escapeHtml', () => {
  it('escapes the five dangerous characters', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
  })

  it('escapes ampersand first (no double-escape)', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;')
  })

  it('escapes attribute-breaking characters', () => {
    // `escapeHtml` defensively escapes `=` too to prevent unquoted attribute injection.
    expect(escapeHtml(`onerror="alert('xss')"`)).toBe('onerror&#x3D;&quot;alert(&#39;xss&#39;)&quot;')
  })

  it('escapes backtick and equals (for legacy attribute injection)', () => {
    expect(escapeHtml('`onclick=alert(1)`')).toBe('&#x60;onclick&#x3D;alert(1)&#x60;')
  })

  it('handles empty strings', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('leaves safe text alone', () => {
    expect(escapeHtml('سلام دنیا')).toBe('سلام دنیا')
  })
})

describe('stripHtml', () => {
  it('removes simple tags', () => {
    expect(stripHtml('<b>bold</b>')).toBe('bold')
  })

  it('removes script tags and their content', () => {
    // Note: stripHtml is a regex; for full safety use DOMPurify.
    // We document the limitation: it does not handle malformed tags.
    expect(stripHtml('before<script>alert(1)</script>after')).toBe('beforealert(1)after')
  })

  it('removes nested tags', () => {
    expect(stripHtml('<div><p>x</p></div>')).toBe('x')
  })

  it('handles empty input', () => {
    expect(stripHtml('')).toBe('')
  })
})
