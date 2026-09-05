/**
 * HTML escaping for any future inline rendering. The current UI never sets
 * `dangerouslySetInnerHTML` — React already escapes by default — but this
 * utility is the safe building block if a future component ever needs to
 * render a string as HTML (e.g. sanitized Markdown).
 */
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'`=/]/g, (char) => ESCAPE_MAP[char] ?? char)
}

/**
 * Strips all HTML tags. Use when displaying user-supplied plain text where any
 * HTML-like content should be removed entirely.
 */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}
