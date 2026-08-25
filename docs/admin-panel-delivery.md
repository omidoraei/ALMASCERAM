# تحویل لایه ۹ — Admin Panel

## Route Map

| مسیر | Page Module |
|---|---|
| `/admin` | Dashboard counts + recent inquiries |
| `/admin/taxonomies/surfaces` | Surface CRUD |
| `/admin/taxonomies/finishes` | Finishes CRUD |
| `/admin/taxonomies/spaces` | Spaces CRUD |
| `/admin/catalog/collections` | Collections CRUD |
| `/admin/catalog/series` | Series CRUD |
| `/admin/catalog/products` | Products CRUD |
| `/admin/catalog/sizes` | Sizes CRUD + direct media/PDF upload |
| `/admin/seo/collections` | Collection SEO |
| `/admin/seo/series` | Series SEO |
| `/admin/seo/products` | Product SEO |
| `/admin/inquiries` | Inquiry list, status and item details |
| `/admin/settings` | Security/runtime status |

## فایل‌های Route/Shell/Guard

### اضافه‌شده

- `src/admin/routes.ts` — registry قطعی مسیرها و mapping URL به Page ID
- `src/lib/auth/require-admin.ts` — Guard سمت runtime مورد اعتماد با `auth.getUser()` و `admin_profiles`
- `vercel.json` — rewrite مسیرهای ادمین به entry برنامه

### تغییر‌یافته

- `src/AdminApp.tsx` — Admin Shell، grouped navigation، session guard، dashboard و products
- `src/App.tsx` — تفکیک entry عمومی و ادمین
- `src/lib/auth/route-guard.ts` — استفاده از `requireAdmin()` برای مسیر ادمین

## فایل‌های Page و Component

### اضافه‌شده

- `src/admin/pages/TaxonomyPage.tsx`
- `src/admin/pages/CatalogResourcePage.tsx`
- `src/admin/pages/SeoPage.tsx`
- `src/admin/pages/InquiriesPage.tsx`
- `src/admin/components/UploadWidget.tsx`
- `src/components/ui/dialog.tsx` — primitive سبک shadcn مبتنی بر Radix Dialog
- `src/admin-modules.css`

### قابلیت‌ها

- Table، جستجو و Pagination برای Taxonomy و Catalog
- فرم‌های Create/Edit با React Hook Form
- Zod validation در UI boundary و Action boundary
- Soft Delete/Restore عمومی؛ Hard Delete فقط با نمایش کنترل برای `super_admin`
- Direct-to-Supabase upload و سپس metadata insert
- SEO metadata، Canonical، OG، Robots و JSON-LD
- Inquiry status workflow و نمایش اقلام/سایزهای استعلام
- RTL، Vazirmatn، mobile navigation و accent برنز `#8B7355`

## فایل‌های Action/Validation اضافه‌شده

- `src/lib/actions/taxonomy-actions.ts`
- `src/lib/actions/seo-actions.ts`
- `src/lib/actions/dashboard-actions.ts`
- `src/lib/actions/inquiry-detail-actions.ts`
- `src/lib/actions/size-media-actions.ts`
- `src/lib/validation/admin-entities.ts`

## فایل‌های Action تغییر‌یافته

- `src/lib/actions/catalog-actions.ts` — soft delete/restore + hard delete مجزای Super Admin
- `src/lib/validation/catalog.ts` — افزودن `isActive` به Collection/Series/Product

## تغییر SQL و دلیل

**دلیل:** `collections`، `series` و `products` فاقد `is_active` بودند و Policy قبلی `FOR ALL is_admin()` Hard Delete را به همه نقش‌های ادمین می‌داد.

**Migration پیشنهادی/پیاده‌شده:**

- `supabase/migrations/20250201001000_catalog_soft_delete_and_role_policies.sql`
- افزودن `is_active` و index به سه جدول
- الزام `is_active=true` برای Public Read
- تفکیک SELECT/INSERT/UPDATE/DELETE Policy
- DELETE فیزیکی فقط با `get_admin_role() = 'super_admin'`

## تست‌پلن دستی — ۸ سناریو

1. **Guard ادمین:** بدون session مسیر ادمین را باز کنید؛ Login نمایش داده شود. با حساب authenticated فاقد profile فعال، دسترسی رد و session خارج شود.
2. **Dashboard:** با Admin وارد شوید؛ شمارش Collections/Series/Products/Sizes و سه وضعیت Inquiry با داده DB تطبیق داشته باشد.
3. **Taxonomy CRUD:** یک Surface ایجاد، جستجو، ویرایش و Soft Delete کنید؛ برای anon دیگر دیده نشود و با Restore بازگردد.
4. **Catalog hierarchy:** Collection و Series بسازید، Product را به Series و Size را به Product متصل کنید؛ FK نامعتبر باید با پیام کنترل‌شده رد شود.
5. **Canonical delete:** با `catalog_manager` دکمه حذف نرم `is_active=false` ایجاد کند و Hard Delete در UI دیده نشود؛ با `super_admin` کنترل Hard Delete ظاهر و RLS آن را مجاز کند.
6. **Direct upload:** برای یک Size تصویر و PDF آپلود کنید؛ Network نشان دهد فایل مستقیم به Supabase Storage می‌رود، سپس رکورد `size_media` یا `size_pdf_catalog` ساخته و Public URL بدون Signed URL باز شود.
7. **SEO:** Meta Title/Description نامعتبر را رد کنید؛ رکورد معتبر را Upsert، تصویر OG را مستقیم آپلود و JSON-LD نامعتبر را با خطا متوقف کنید.
8. **Inquiry management:** یک Inquiry را جستجو و باز کنید؛ itemها، محصول و ابعاد نمایش داده شوند، status به `in_review` تغییر کند و Customer امکان UPDATE همان Inquiry را نداشته باشد.
