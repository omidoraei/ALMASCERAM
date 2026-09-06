# Production Deployment Checklist

این سند گام‌های ضروری پیش از لانچ پروژه ALMASCERAM را فهرست می‌کند. هر آیتم باید قبل از فعال‌سازی دامنه production تکمیل و تأیید شود.

## 1. Environment Variables (Vercel / Netlify / Cloudflare)

تنظیم کنید (Production scope):

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Production Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Production anon key (safe with RLS) |
| `VITE_SITE_URL` | yes | Canonical site URL e.g. `https://almasceram.ir` |
| `SUPABASE_URL` | yes (scripts) | Same as VITE_SUPABASE_URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (scripts only) | Admin client — never expose to client |
| `SUPABASE_AUTH_REDIRECT_URL` | recommended | Magic link callback origin (defaults to VITE_SITE_URL) |

بعد از تنظیم، build و verify کنید:

```bash
npm run build
npm run typecheck
```

## 2. Supabase Production Project

### 2.1 Authentication
- [ ] **Magic Link** را در `Auth > Providers > Email` فعال کنید.
- [ ] غیرفعال کنید: Password, Social providers (فقط magic link نیاز است).
- [ ] Site URL = `https://almasceram.ir`
- [ ] Additional Redirect URLs: `https://almasceram.ir/auth/callback`
- [ ] Email templates را به‌صورت سفارشی و fa-IR تنظیم کنید.
- [ ] Rate limiting: Auth > Rate Limits → magic link = 5/hour per email (matches 60s cooldown + UX buffer).
- [ ] OTP expiry = 3600s (matches 30min client-side window with buffer).

### 2.2 Database
- [ ] تمام migrationهای `20250201*.sql` را به ترتیب در SQL Editor اجرا کنید.
- [ ] RLS policies را از طریق `docs/rls-matrix.md` تأیید کنید.
- [ ] Deny-by-default برای جداول بدون policy.
- [ ] Realtime را فقط برای جداول مورد نیاز فعال کنید (اگر استفاده می‌شود).

### 2.3 Storage
- [ ] Bucket های مورد نیاز (مثل `product-images`, `inquiry-attachments`) ایجاد شوند.
- [ ] Storage policies در `docs/storage-policy.md` اعمال شوند.
- [ ] Max file size = 5MB per file, allowed MIME = `image/jpeg, image/png, image/webp`.

### 2.4 Backups
- [ ] Daily automated backup فعال باشد (Pro plan یا بالاتر).
- [ ] Point-in-time recovery (PITR) فعال باشد.

## 3. Domain & DNS

- [ ] دامنه `almasceram.ir` به hosting متصل (A/CNAME).
- [ ] SSL/TLS certificate (Let's Encrypt یا hosting-managed) فعال و auto-renew.
- [ ] `www` → apex redirect یا بالعکس.
- [ ] HSTS preload submission (پس از 30 روز عملکرد بدون مشکل).

## 4. Security Headers

`vercel.json` و `public/_headers` باید در production اعمال شوند. تأیید:

- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] CSP meta در `index.html` (script-src 'self', connect-src supabase)

## 5. SEO

- [ ] Google Search Console: دامنه verified، sitemap = `https://almasceram.ir/sitemap.xml` submit.
- [ ] Bing Webmaster Tools: sitemap submit.
- [ ] Yandex Webmaster: دامنه اضافه شود (بازار هدف).
- [ ] Open Graph Preview: [https://www.opengraph.xyz/](https://www.opengraph.xyz/) با `/og-image.svg` verify.
- [ ] Twitter Card Validator.
- [ ] Schema.org validator: [https://validator.schema.org/](https://validator.schema.org/) روی صفحه اصلی.
- [ ] URL های `sameAs` (Instagram, LinkedIn) در `src/lib/seo/jsonld.ts` با handle های واقعی برند تأیید و جایگزین شود.
- [ ] قبل از لانچ، محتوای صفحه اصلی فارسی، `lang="fa"` و `dir="rtl"` صحیح داشته باشد.

## 6. Analytics & Monitoring

طبق سیاست پروژه، **هیچ third-party tracking مجاز نیست**. گزینه‌های privacy-friendly:

- [ ] Plausible یا Umami self-hosted (اختیاری، اختیار self-host شده)
- [ ] Uptime monitoring: UptimeRobot / BetterStack برای `/` و `/healthz`
- [ ] Error tracking: Sentry self-hosted (اختیاری) — اگر فعال شد، با RLS و CSP سازگار باشد.

## 7. Pre-Launch Smoke Tests

```bash
# در production URL اجرا شود
curl -I https://almasceram.ir                      # 200, HSTS
curl -I https://almasceram.ir/robots.txt            # 200
curl -I https://almasceram.ir/sitemap.xml           # 200
curl -I https://almasceram.ir/og-image.svg          # 200
curl -I https://almasceram.ir/favicon.svg           # 200
```

سپس به‌صورت دستی:

- [ ] Magic link sign-in با email واقعی (با admin@almasceram.ir)
- [ ] ثبت inquiry از صفحه اصلی → ایمیل admin دریافت شود
- [ ] Admin login → لیست inquiries قابل مشاهده باشد
- [ ] تغییر status inquiry از admin
- [ ] تغییر theme (light/dark) persisted در localStorage
- [ ] Cache invalidation بعد از admin update

## 8. Post-Launch (24-48h بعد)

- [ ] HSTS preload submission
- [ ] Core Web Vitals را در Search Console بررسی کنید
- [ ] Indexing coverage بررسی (صفحات indexed شده)
- [ ] رفتار cookie/storage را در حالت incognito تست کنید
- [ ] بررسی لاگ‌های Supabase برای خطاهای غیرعادی
