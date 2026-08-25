# Evidence Snapshot — Canonical Vite SPA

## 1. Runtime Entrypoint

```text
index.html
  └─ <script type="module" src="/src/main.tsx">
      └─ src/main.tsx
          └─ import App from './App.tsx'
              └─ src/App.tsx
```

`src/App.tsx` مسیرهای callback، account، admin و public را به Viewهای SPA متناظر dispatch می‌کند.

## 2. Next Artifact Audit

موارد زیر در runtime وجود ندارند:

- `next.config.*`
- `next-env.d.ts`
- `src/app/**`
- `src/middleware.ts`
- Next build scripts

فرمان بازتولید:

```bash
find . -path './node_modules' -prune -o \
  \( -name 'next.config.*' -o -name 'next-env.d.ts' -o \
  -path './src/app/*' -o -name 'middleware.ts' \) \
  -type f -print
```

خروجی مورد انتظار: خالی.

## 3. SPA Fallback

فایل `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/:path*", "destination": "/index.html" }
  ]
}
```

این fallback تمام deep-linkهای فاقد فایل فیزیکی را به SPA می‌فرستد. assets واقعی توسط filesystem/CDN استقرار resolve می‌شوند.

## 4. Auth Evidence

- `src/lib/actions/auth-actions.ts`: Magic Link عمومی و exchange کد PKCE
- `src/AdminApp.tsx`: Admin Magic Link با `shouldCreateUser=false` و cooldown
- `src/AccountApp.tsx`: Customer Magic Link با `shouldCreateUser=true` و cooldown
- `src/MagicLinkCallback.tsx`: callback مشترک، تشخیص admin/customer/inquiry
- `src/lib/actions/inquiry-actions.ts`: context محلی و RPC اتمیک استعلام

```bash
grep -R "signInWithPassword" -n src
grep -R "signInWithOtp" -n src
```

خروجی اول باید خالی و خروجی دوم باید جریان‌های Magic Link را نشان دهد.

## 5. Admin Guard Coverage

Helper: `src/lib/auth/require-admin-client.ts`

Actionهای دارای دفاع اضافه:

- `src/lib/actions/catalog-actions.ts`
- `src/lib/actions/taxonomy-actions.ts`
- `src/lib/actions/seo-actions.ts`
- `src/lib/actions/admin-actions.ts`
- `src/lib/actions/storage-actions.ts`

Hard Delete در Catalog/Taxonomy علاوه بر RLS، `super_admin` را در helper الزام می‌کند.

## 6. Service Role Safety

تنها محل مجاز:

- `scripts/_supabase-admin.ts`

محل قدیمی حذف شده است:

- `src/lib/supabase/admin.ts`

```bash
grep -R "SUPABASE_SERVICE_ROLE_KEY" -n src scripts
grep -R "_supabase-admin\|supabase/admin" -n src
```

نتیجه مورد انتظار: کلید فقط در script helper و import کلاینتی خالی.

## 7. Canonical Migration Inventory

- `20250201000100_extensions_and_enums.sql`
- `20250201000200_catalog_tables.sql`
- `20250201000300_identity_inquiry_audit_seo.sql`
- `20250201000400_functions_and_triggers.sql`
- `20250201000500_rls_policies.sql`
- `20250201000600_create_inquiry_from_basket_rpc.sql`
- `20250201000700_finalize_inquiry_rls.sql`
- `20250201000800_public_storage_buckets.sql`
- `20250201000900_finalize_customer_profile_trigger.sql`
- `20250201001000_catalog_soft_delete_and_role_policies.sql`

Namespace یکتا: `20250201`. هیچ فایل `20240601*` در repository وجود ندارد.

```bash
find supabase/migrations -maxdepth 1 -type f -printf '%f\n' | sort
find supabase/migrations -maxdepth 1 -type f -printf '%f\n' | cut -c1-8 | sort -u
supabase db reset
```

`supabase db reset` نیازمند Supabase CLI و Docker محلی است.

## 8. Quality Gates

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

Deep-linkهای بررسی دستی:

- `/admin`
- `/admin/login`
- `/account`
- `/products/some-slug`
- `/collections/some-slug`
- `/auth/callback?code=invalid-test-code`

در تمام موارد SPA باید load شود؛ callback نامعتبر باید UI خطای کنترل‌شده نمایش دهد، نه 404.
