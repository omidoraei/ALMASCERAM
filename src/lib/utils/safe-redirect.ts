/**
 * URL safety helpers.
 *
 * `next` and `redirect` parameters are common in auth flows. If we naively
 * call `window.location.href = userInput`, an attacker can craft a link to
 * `https://almasceram.ir/auth/callback?next=//evil.com` and bounce the user
 * to a phishing page after a successful login. The helpers below restrict
 * redirects to same-origin paths that start with a single `/` and contain
 * only safe characters.
 */

const ALLOWED_PATH = /^\/(?!\/)[A-Za-z0-9/_\-?&=%.#]*$/

/**
 * Returns `path` if it is a same-origin relative path, otherwise returns the
 * supplied fallback. Use this before any `window.location.assign` with a
 * user-controlled value.
 */
export function safeRedirectPath(path: string | null | undefined, fallback: string = '/'): string {
  if (typeof path !== 'string') return fallback
  // Decode in case the attacker double-encodes
  let candidate = path
  try {
    candidate = decodeURIComponent(path)
  } catch {
    return fallback
  }
  if (!ALLOWED_PATH.test(candidate)) return fallback
  return candidate
}

/**
 * Returns `true` if the URL is a same-origin path (starts with `/` and not `//`).
 * Use for `target=` attributes and inline navigation.
 */
export function isSameOriginPath(value: string): boolean {
  return ALLOWED_PATH.test(value)
}
