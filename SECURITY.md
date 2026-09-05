# Security Policy

## Overview

ALMASCERAM follows **defense in depth** across the stack:

1. **Transport** — HTTPS-only via Vercel + HSTS preload-eligible headers.
2. **Browser** — Strict Content-Security-Policy, no third-party scripts, no `dangerouslySetInnerHTML`.
3. **Auth** — Supabase Magic Link with PKCE; no passwords stored or transmitted.
4. **Authorization** — Role check (`admin_profiles.is_active`) before any admin mutation; RLS is the authoritative boundary in PostgreSQL.
5. **Validation** — All inputs parsed by Zod schemas; storage paths validated against an allow-list regex.
6. **Audit** — `audit_logs` is append-only and inaccessible to the admin client.
7. **Service-role** — Used only in `scripts/_supabase-admin.ts`; the Vite browser bundle never sees it.

## Reporting a Vulnerability

If you discover a security issue, **please do not open a public GitHub issue.** Email us instead at:

> **security@almasceram.ir**

We will acknowledge within 48 hours and aim to ship a fix within 7 days for critical issues.

## Security Headers

Production headers (set in `vercel.json`, mirrored in `public/_headers`):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Content-Security-Policy` | see `index.html` |

## Supabase RLS

Every table has RLS enabled. The canonical matrix lives in `docs/rls-matrix.md`. The browser uses only the `anon` key for unauthenticated reads and a session-bound `authenticated` client for writes; `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side scripts.

## Magic Link Flow

1. Customer enters email → schema-validated → `signInWithOtp` called.
2. Supabase emails a one-time link to `/auth/callback?code=…&next=…`.
3. The callback validates the `next` parameter against `safeRedirectPath` to block open-redirect.
4. The `code` is exchanged via PKCE; the resulting session is required for any subsequent inquiry submission.
5. Rate limit: a 60-second client-side cooldown between requests.

## Dependencies

We use `npm audit` and Vercel's automated supply-chain checks. Run `npm audit --omit=dev` before each release to verify no critical CVEs.

## Local Development

- `.env.local` is git-ignored. Use `.env.local.example` as a template.
- Never commit a real `SUPABASE_SERVICE_ROLE_KEY`; the build pipeline does not require it for the browser bundle.
- The Vite dev server respects the same-origin policy in `index.html`; you may need to disable CSP temporarily via a comment for ad-hoc debugging.

## Acknowledgements

We thank the security research community for responsible disclosure. Reporters of valid, previously-unknown issues will be credited (unless anonymity is preferred) once a fix is shipped.
