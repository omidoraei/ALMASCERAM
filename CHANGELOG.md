# Changelog

تمام تغییرات قابل توجه پروژه ALMASCERAM در این فایل ثبت می‌شوند. این پروژه از [Semantic Versioning](https://semver.org/) پیروی می‌کند.

## [1.0.0] — Production Ready

### Added
- Public catalog: collections, series, products, technical specs (Persian/RTL)
- B2B inquiry workflow: cart, magic-link authentication, admin notifications
- Admin panel: dashboard, products, collections, series, sizes, inquiries, SEO, users, audit log
- Magic Link authentication (Supabase PKCE) with 60s cooldown
- RLS-enforced Supabase backend with `20250201*` canonical migration series
- Server actions with Zod validation and JSDoc documentation
- Code splitting via `React.lazy` for admin/account/callback routes
- TTL cache utility (`src/lib/utils/cache.ts`) with dashboard 30s, public 15s TTL
- Security: CSP, HSTS, X-Frame-Options, RLS, `safe-redirect`, `escapeHtml`
- SEO: structured data (Organization, WebSite, LocalBusiness, Breadcrumb, Product, Collection, FAQ), dynamic meta tags via `useSEO`, robots.txt, sitemap.xml
- Theme system (light/dark) with FOUC-safe inline script
- Test infrastructure: Vitest (123 tests) + Playwright (E2E)
- Brand assets: favicon.svg, favicon-dark.svg, apple-touch-icon.svg, og-image.svg
- Custom 404 page (`NotFoundPage` component + `public/404.html` fallback)
- Visual breadcrumb component (`src/components/layout/Breadcrumb.tsx`)
- Production deployment checklist (`docs/production-checklist.md`)

### Security
- `SUPABASE_SERVICE_ROLE_KEY` confined to `scripts/_supabase-admin.ts` (Node only)
- HTML sanitization in dynamic content (`src/lib/utils/html.ts`)
- Open-redirect protection (`src/lib/utils/safe-redirect.ts`)
- Security headers in `vercel.json` + `public/_headers` + `index.html` CSP meta
- No third-party tracking (compliant with `no_third_party_tracking` policy)

### Performance
- Bundle size: ~210KB gzipped (react 84KB, forms 30KB, vendor 32KB, app 12KB)
- Image lazy loading with `loading="lazy"` + `decoding="async"`
- Hero image priority with `fetchPriority="high"`

## [Unreleased]

### Planned
- Image sitemap (`scripts/generate-sitemap.ts` extension)
- hreflang support for multilingual expansion
- Lighthouse CI integration
- Optional PWA support
