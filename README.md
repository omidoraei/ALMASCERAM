# Kara Ceram Catalog

کاتالوگ هوشمند B2B/B2C کاشی و سرامیک با استعلام قیمت، پنل ادمین و Supabase.

## Canonical Architecture

این repository فقط یک runtime دارد:

```text
index.html → src/main.tsx → src/App.tsx
```

- Build: Vite + React + TypeScript strict
- Data/Auth/Storage: Supabase
- Deployment: Vercel SPA
- Routing: client-side path registry + catch-all rewrite
- Next.js در runtime، build و deploy این repository استفاده نمی‌شود.
- هیچ `src/app`، `next.config.*`، `next-env.d.ts` یا Next middleware وجود ندارد.

## Auth

- Customer و Admin فقط با Supabase Magic Link وارد می‌شوند.
- Password Auth و OTP کدی وجود ندارد.
- Flow مرورگر PKCE است.
- Callback مشترک در `/auth/callback`، session را exchange و مقصد را تعیین می‌کند.
- Admin فقط با رکورد فعال در `admin_profiles` وارد پنل می‌شود.
- Guard کلاینت دفاع UX است؛ RLS مرز امنیتی نهایی است.

## SPA Deep Links

`vercel.json` دارای fallback سراسری به `index.html` است. بنابراین refresh مسیرهای `/admin/**`، `/account/**`، `/products/**`، `/collections/**` و `/auth/callback` باید SPA را بارگذاری کند. فایل‌های build واقعی توسط filesystem/CDN استقرار سرو می‌شوند.

## Canonical Migrations

فقط سری `20250201*` داخل `supabase/migrations/` مجاز است. جزئیات در `docs/migrations.md` آمده است.

```bash
supabase db reset
```

این دستور برای اجرای محلی به Supabase CLI و Docker نیاز دارد.

## Service Role

`SUPABASE_SERVICE_ROLE_KEY` فقط در `scripts/_supabase-admin.ts` مجاز است. هیچ فایل `src/**` نباید آن را import یا قرائت کند.

## Commands

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Security Verification

```bash
grep -R "signInWithPassword" -n src
grep -R "SUPABASE_SERVICE_ROLE_KEY" -n src
grep -R "_supabase-admin\|supabase/admin" -n src
find supabase/migrations -maxdepth 1 -type f -printf '%f\n' | cut -c1-8 | sort -u
find . -path './node_modules' -prune -o \( -name 'next.config.*' -o -name 'next-env.d.ts' -o -path './src/app/*' -o -name 'middleware.ts' \) -type f -print
```

خروجی سه grep اول و جستجوی Next artifact باید خالی باشد؛ Migration namespace باید فقط `20250201` باشد.
