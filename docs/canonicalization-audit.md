# ممیزی Canonical Architecture و Auth

## نتیجه شواهد فایل‌سیستم

- `package.json` فقط اسکریپت‌های Vite دارد.
- تنها entry مرورگر `src/main.tsx` و `src/App.tsx` است.
- هیچ پوشه `app/` یا `pages/`، هیچ `next.config.*` و هیچ Next build script در workspace وجود ندارد.
- Migrationها فقط یک namespace ترتیبی `20250201000100` تا `20250201001000` دارند.
- هیچ Migration با پیشوند `20240601` در workspace وجود ندارد.

بنابراین در این snapshot معماری یا Migration موازی قابل حذف وجود نداشت و هیچ فایل فرضی حذف نشد. این ممیزی مانع حذف اشتباه تاریخچه دیتابیس می‌شود.

## Canonical Auth پس از اصلاح

1. Customer و Admin هر دو از Supabase Magic Link استفاده می‌کنند.
2. Flow مرورگر `pkce` است و callback کد را با session مبادله می‌کند.
3. Admin Magic Link دارای `shouldCreateUser=false` است؛ سپس `admin_profiles.is_active` بررسی می‌شود.
4. Customer context و basket تا callback فقط در localStorage باقی می‌مانند.
5. ایمیل session باید دقیقاً با ایمیل context محلی برابر باشد.
6. context بیش از ۳۰ دقیقه منقضی است.
7. پس از session معتبر، فقط یک RPC اتمیک استعلام را می‌سازد.
8. basket و context تنها بعد از UUID موفق پاک می‌شوند.

## حذف Dual Environment Contract

- Browser فقط `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` می‌خواند.
- Trusted runtime فقط `SUPABASE_URL` و `SUPABASE_ANON_KEY` می‌خواند.
- alias و env prefix مربوط به `NEXT_PUBLIC_` حذف شد.
- service-role همچنان فقط در script/admin runtime تعریف می‌شود.

## Routeهای Auth

- Customer callback: `/auth/callback`
- Admin Magic Link redirect: `/admin`
- هر دو مسیر توسط rewrite استقرار به entry برنامه هدایت می‌شوند.