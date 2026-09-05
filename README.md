# ALMASCERAM Catalog

<div align="center">

**کاتالوگ هوشمند B2B/B2C کاشی و سرامیک پرسلانی با سیستم استعلام قیمت، پنل مدیریت و زیرساخت Supabase**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-123_passing-success?logo=vitest)](./src/test)
[![Build](https://img.shields.io/badge/Build-Vercel-black?logo=vercel)](./vercel.json)

</div>

---

## 📋 فهرست مطالب

1. [نمای کلی پروژه](#1-نمای-کلی-پروژه)
2. [نصب و راه‌اندازی](#2-نصب-و-راه-اندازی)
3. [مستندات API](#3-مستندات-api)
4. [مستندات کد (JSDoc)](#4-مستندات-کد-jsdoc)
5. [نمونه کد استفاده](#5-نمونه-کد-استفاده)
6. [معماری و امنیت](#6-معماری-و-امنیت)
7. [استقرار Production](#7-استقرار-production)
8. [مشارکت](#8-مشارکت)

---

## 1. نمای کلی پروژه

**ALMASCERAM Catalog** یک پلتفرم B2B/B2C تخصصی برای نمایش و فروش محصولات کاشی و سرامیک پرسلانی است. تمرکز اصلی بر **تبدیل بازدیدکننده به سرنخ فروش (Lead)** از طریق سیستم استعلام قیمت چندمحصولی است، نه فروش آنلاین مستقیم.

### ویژگی‌های کلیدی

| دسته | ویژگی |
|---|---|
| 🛍️ **کاتالوگ** | نمایش محصولات با فیلتر دسته، جستجوی بلادرنگ، مشخصات فنی |
| 📋 **استعلام قیمت** | سبد چندمحصولی با ۳ مرحله (سبد → فرم → Magic Link) |
| 🔐 **احراز هویت** | Supabase Magic Link (بدون رمز عبور) با PKCE Flow |
| 🛡️ **پنل مدیریت** | CRUD محصولات، مدیریت استعلام‌ها، SEO، تنظیمات |
| 🎨 **UX** | Dark Mode، RTL کامل، Mobile-first، Touch targets ≥ 44px |
| ♿ **Accessibility** | ARIA labels، focus-visible، reduced-motion، skip-links |
| 🔍 **SEO** | JSON-LD، OpenGraph، Twitter cards، canonical URLs |
| 🧪 **تست** | 123 unit/integration tests + Playwright E2E |

### معماری تکنولوژی

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Vite SPA)                    │
├─────────────────────────────────────────────────────────┤
│  React 19 + TypeScript 5.9 strict                       │
│  ├─ Routing: client-side path registry                 │
│  ├─ State: Zustand (cart) + useState (local)           │
│  ├─ Forms: React Hook Form + Zod validation            │
│  └─ UI: Framer Motion + Phosphor Icons                 │
├─────────────────────────────────────────────────────────┤
│              Supabase (Postgres + Auth + Storage)       │
│  ├─ Auth: Magic Link with PKCE                          │
│  ├─ RLS: Row Level Security (deny-by-default)           │
│  └─ Storage: catalog-media, catalog-documents, seo    │
├─────────────────────────────────────────────────────────┤
│  Deployment: Vercel SPA (catch-all rewrite → index.html)│
└─────────────────────────────────────────────────────────┘
```

---

## 2. نصب و راه‌اندازی

### پیش‌نیازها

| ابزار | نسخه | هدف |
|---|---|---|
| Node.js | ≥ 20.x | Runtime |
| npm | ≥ 10.x | Package manager |
| Supabase CLI | latest | محلی برای migrations |
| Docker | latest | پایگاه داده محلی (اختیاری) |

### مراحل نصب

```bash
# 1. کلون کردن مخزن
git clone https://github.com/almasceram/catalog.git
cd catalog

# 2. نصب وابستگی‌ها
npm install

# 3. ساخت فایل محیطی
cp .env.local.example .env.local
# سپس مقادیر VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY را پر کنید

# 4. اجرای migrations (نیاز به Supabase CLI و Docker)
supabase db reset

# 5. اجرای dev server
npm run dev
# سرور روی http://localhost:5173 در دسترس است
```

### متغیرهای محیطی

```bash
# .env.local

# متغیرهای Vite (مرورگر - ایمن فقط با RLS)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://almasceram.ir

# متغیرهای Server (فقط scripts/)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **هشدار امنیتی:** `SUPABASE_SERVICE_ROLE_KEY` هرگز نباید در client bundle قرار گیرد. Vite فقط متغیرهای با پیشوند `VITE_` را expose می‌کند.

### اسکریپت‌های NPM

```bash
npm run dev            # سرور توسعه (Vite)
npm run build          # TypeScript check + build production
npm run typecheck      # فقط TypeScript validation
npm run lint           # ESLint
npm run preview        # نمایش build production

# تست‌ها
npm test               # 123 unit + integration tests
npm run test:watch     # watch mode
npm run test:ui        # رابط گرافیکی Vitest
npm run test:coverage  # coverage report

# E2E (نیاز به نصب chromium یک‌بار)
npm run e2e:install    # نصب Chromium
npm run e2e            # اجرای Playwright tests

# امنیت
npm run audit:deps     # npm audit
npm run audit:secrets  # بررسی hardcoded secrets در src
```

### راه‌اندازی بدون Supabase (حالت نمایشی)

برای توسعه محلی بدون Supabase، کافی است فایل `.env.local` را خالی بگذارید. برنامه به طور خودکار در حالت **Demo Mode** قرار می‌گیرد و داده‌های نمونه را از `src/data/catalog.ts` بارگذاری می‌کند.

---

## 3. مستندات API

پروژه فاقد REST API سرور است؛ تمام عملیات از طریق **توابع client-side** در `src/lib/actions/` انجام می‌شود که با Supabase PostgREST و Auth API ارتباط برقرار می‌کنند.

### 3.1 Authentication

#### `requestMagicLink(options)`

یک Magic Link برای ورود بدون رمز عبور ارسال می‌کند.

```typescript
import { requestMagicLink } from '@/lib/actions/auth-actions'

interface RequestMagicLinkOptions {
  /** ایمیل کاربر */
  email: string
  /** مسیر بازگشت پس از تأیید (مثلاً '/admin' یا '/account') */
  next: string
  /** آیا کاربر جدید ایجاد شود؟ */
  shouldCreateUser?: boolean
}

interface RequestMagicLinkResult {
  success: boolean
  redirectPath: string
}
```

**مثال:**
```typescript
await requestMagicLink({
  email: 'admin@almasceram.ir',
  next: '/admin',
  shouldCreateUser: false
})
```

#### `exchangeMagicLinkSession(code?)`

کد تأیید را با session معاوضه می‌کند.

```typescript
import { exchangeMagicLinkSession } from '@/lib/actions/auth-actions'

const session = await exchangeMagicLinkSession()
// یا با کد صریح
const session = await exchangeMagicLinkSession('auth-code-from-url')
```

#### `getActiveAdminProfile(userId)`

پروفایل ادمین را از جدول `admin_profiles` بررسی می‌کند.

```typescript
import { getActiveAdminProfile } from '@/lib/actions/auth-actions'

const profile = await getActiveAdminProfile(session.user.id)
// Returns: { fullName, role } | null
```

### 3.2 Catalog (Taxonomy)

#### `listTaxonomies(kind, options?)`

تاکسونومی‌ها را بر اساس نوع دریافت می‌کند.

```typescript
import { listTaxonomies } from '@/lib/actions/taxonomy-actions'

type TaxonomyKind = 'surface' | 'finishes' | 'spaces'

const result = await listTaxonomies('surface', { page: 1, pageSize: 20 })
// { rows: Taxonomy[], total: number }
```

#### `createTaxonomy(kind, input)` / `updateTaxonomy(kind, id, input)` / `softDeleteTaxonomy(kind, id)` / `restoreTaxonomy(kind, id)` / `hardDeleteTaxonomy(kind, id)`

CRUD کامل برای تاکسونومی‌ها. `hardDelete` فقط برای `super_admin` مجاز است.

```typescript
const created = await createTaxonomy('surface', {
  name: 'سنگ',
  slug: 'stone',
  description: 'الهام‌گرفته از سنگ طبیعی',
  isActive: true,
  sortOrder: 10
})
```

### 3.3 Catalog (Products)

#### `listCollections()` / `listSeries(collectionId?)` / `listProducts(seriesId?)` / `listSizes(productId?)`

دریافت سلسله‌مراتبی محصولات. همه با **TTL cache 15s** بهینه‌سازی شده‌اند.

```typescript
import { listCollections, listSeries, listProducts, listSizes } from '@/lib/actions/catalog-actions'

const collections = await listCollections()
const series = await listSeries('collection-uuid')
const products = await listProducts('series-uuid')
const sizes = await listSizes('product-uuid')
```

#### `createCollection(input)` / `updateCollection(id, input)` / `deleteCollection(id)` / `restoreCollection(id)` / `hardDeleteCollection(id)`

```typescript
import { createCollection } from '@/lib/actions/catalog-actions'

const collection = await createCollection({
  name: 'زمین',
  slug: 'zamin',
  description: 'بافت‌های طبیعی',
  isActive: true,
  isPublished: true,
  sortOrder: 10
})
```

#### `createProduct(input)` / `updateProduct(id, input)` / `deleteProduct(id)` / `restoreProduct(id)`

```typescript
import { createProduct } from '@/lib/actions/catalog-actions'

const product = await createProduct({
  seriesId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'آرنا سند',
  slug: 'arena-sand',
  sku: 'KR-0101',
  description: 'پرسلان معماری با الهام از ماسه‌سنگ',
  isPublished: true
})
```

#### `createSeries(input)` / `createSize(input)` / `updateSize(id, input)` / ...

عملیات مشابه برای سری‌ها و سایزها. سایزها شامل ابعاد (mm)، ضخامت، تعداد در بسته، و وزن هستند.

### 3.4 Inquiries (استعلام قیمت)

#### `createInquiryFromBasket(items, note?)`

RPC اتمیک برای ثبت استعلام از سبد. این تابع **SECURITY INVOKER** است و RLS را رعایت می‌کند.

```typescript
import { createInquiryFromBasket } from '@/lib/actions/inquiry-actions'

const result = await createInquiryFromBasket(
  [
    { sizeId: 'size-uuid-1', quantity: 2 },
    { sizeId: 'size-uuid-2', quantity: 1 }
  ],
  'پروژه مسکونی، تهران'
)
// { inquiryId: string, inquiryNumber: number }
```

**محدودیت‌ها:**
- حداکثر ۵۰ قلم در سبد
- سایز تکراری مجاز نیست (duplicate detection)
- کوانتیتی بین ۱ تا ۱۰۰,۰۰۰

#### `getAdminInquiries()` / `updateInquiryStatus(id, status)`

```typescript
import { getAdminInquiries, updateInquiryStatus } from '@/lib/actions/admin-actions'

const inquiries = await getAdminInquiries()
// Array of { id, inquiry_number, status, customer_name, ... }

await updateInquiryStatus('inquiry-uuid', 'quoted')
// status: 'submitted' | 'in_review' | 'quoted' | 'closed' | 'cancelled'
```

#### `getInquiryItems(inquiryId)`

```typescript
import { getInquiryItems } from '@/lib/actions/inquiry-detail-actions'

const items = await getInquiryItems('inquiry-uuid')
// Array of { id, product, sku, size, quantity, requestedSqm }
```

### 3.5 Storage

#### `safeObjectPathSchema`

regex برای اعتبارسنجی مسیرهای Storage:

```typescript
export const safeObjectPathSchema = z.string()
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9/_\-.]{0,199}$/, 'مسیر فایل نامعتبر است')
  .refine((path) => !path.includes('..') && !path.includes('//'), 'مسیر فایل نامعتبر است')
```

#### `uploadCatalogMedia(bucket, path, file, metadata)`

```typescript
import { uploadCatalogMedia } from '@/lib/actions/storage-actions'

const result = await uploadCatalogMedia(
  'catalog-media',
  'collection-1/cover.jpg',
  file,
  { alt: 'تصویر اصلی', mediaType: 'image' }
)
```

### 3.6 Dashboard

#### `getAdminDashboardCounts()`

```typescript
import { getAdminDashboardCounts } from '@/lib/actions/dashboard-actions'

const counts = await getAdminDashboardCounts()
// { collections, series, products, sizes, inquiries: { submitted, inReview, quoted } }
```

با TTL cache 30 ثانیه.

### 3.7 SEO

#### `getSeoRecord(entity, entityId)` / `upsertSeoRecord(entity, entityId, data)`

```typescript
import { getSeoRecord, upsertSeoRecord } from '@/lib/actions/seo-actions'

const seo = await getSeoRecord('product', 'product-uuid')
await upsertSeoRecord('product', 'product-uuid', {
  metaTitle: 'کاشی آرنا سند | ALMASCERAM',
  metaDescription: 'کاشی پرسلان آرنا سند با مشخصات فنی کامل...',
  focusKeyword: 'کاشی پرسلان',
  canonicalUrl: 'https://almasceram.ir/products/arena-sand',
  ogImagePath: 'seo/arena-sand-og.jpg',
  robotsNoindex: false,
  robotsNofollow: false,
  jsonLd: { /* JSON-LD object */ }
})
```

---

## 4. مستندات کد (JSDoc)

تمام توابع پیچیده با JSDoc مستندسازی شده‌اند. نمونه‌هایی از مهم‌ترین‌ها:

### `useSEO(options)` — `src/lib/seo/useSEO.ts`

```typescript
/**
 * Apply SEO metadata for the current view. Title gets a site suffix,
 * missing meta tags are created, and JSON-LD payloads are mounted
 * with a stable key so re-renders replace (not duplicate) blocks.
 *
 * Designed to be called once per route — typically at the top of a
 * page component's render via a `useEffect(..., [])`.
 *
 * @param options - SEO configuration for the current view
 * @param options.title - Page title (without site suffix). The site name is appended automatically.
 * @param options.description - Meta description (150-160 characters recommended).
 * @param options.image - OpenGraph image — must be a public URL or absolute path.
 * @param options.canonicalPath - Canonical URL — must be an absolute path.
 * @param options.noindex - If true, sets `noindex, nofollow` robots meta.
 * @param options.ogType - OpenGraph type, defaults to "website".
 * @param options.jsonLd - Optional JSON-LD structured data — single object or array.
 * @param options.keywords - Optional keywords for the meta tag.
 *
 * @example
 * useSEO({
 *   title: 'محصولات',
 *   description: 'کاتالوگ محصولات پرسلانی...',
 *   canonicalPath: '/products',
 *   jsonLd: [organizationSchema(), websiteSchema()]
 * })
 */
export function useSEO(options: SeoOptions): void
```

### `useInquiryStore()` — `src/store/inquiry-store.ts`

```typescript
/**
 * Zustand store for the shopping cart used in the inquiry flow.
 * Persists to localStorage with key 'almasceram-inquiry' (version 1).
 *
 * @example
 * const { items, addItem, removeItem, setQuantity, clear } = useInquiryStore.getState()
 *
 * // Add a product with a specific size
 * addItem(product, size)
 *
 * // Remove a line by its key (productId:sizeId)
 * removeItem('arena-sand:120-240')
 */
export const useInquiryStore = create<InquiryStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, size) => {
        const key = `${product.id}:${size.id}`
        set((state) => {
          const existing = state.items.find((item) => item.key === key)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key ? { ...item, quantity: item.quantity + 1 } : item
              )
            }
          }
          return { items: [...state.items, { key, productId: product.id, productName: product.name, image: product.image, series: product.series, size, quantity: 1 }] }
        })
      },
      removeItem: (key) => set((state) => ({ items: state.items.filter((item) => item.key !== key) })),
      setQuantity: (key, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),
      clear: () => set({ items: [] })
    }),
    { name: 'almasceram-inquiry', version: 1 }
  )
)
```

### `requireAdminClient(role?)` — `src/lib/auth/require-admin-client.ts`

```typescript
/**
 * Returns a Supabase client bound to the currently authenticated admin session.
 * Performs a defensive admin check against `admin_profiles` and (optionally) the role.
 *
 * The browser never sees the service-role key; RLS on `admin_profiles` is the
 * authoritative authorization boundary and the Storage policies in turn gate
 * bucket writes. We only need to ensure the active session matches an active
 * admin record before destructive mutations.
 *
 * @param requiredRole - Optional specific role required for the operation
 * @returns { client, userId, role } - The client, user UUID, and admin role
 * @throws Error when:
 *   - Supabase is not configured
 *   - No active session
 *   - User has no active admin profile
 *   - Required role doesn't match (and is not super_admin)
 *
 * @example
 * const { client, role } = await requireAdminClient('super_admin')
 * const { data } = await client.from('admin_profiles').delete().eq('id', id)
 */
export async function requireAdminClient(requiredRole?: AdminRole): Promise<{ client: SupabaseClient; userId: string; role: AdminRole }>
```

### `safeRedirectPath(path, fallback?)` — `src/lib/utils/safe-redirect.ts`

```typescript
/**
 * Returns `path` if it is a same-origin relative path, otherwise returns the
 * supplied fallback. Use this before any `window.location.assign` with a
 * user-controlled value to prevent open-redirect attacks.
 *
 * Defends against:
 *   - Protocol-relative URLs (//evil.com)
 *   - Different-host absolute URLs
 *   - javascript: and data: schemes
 *   - Backslash tricks
 *   - Double-encoded payloads
 *   - Malformed percent-encoding
 *
 * @param path - User-supplied path (e.g. from URL params)
 * @param fallback - Fallback path to return if `path` is unsafe
 * @returns Safe same-origin path
 *
 * @example
 * safeRedirectPath('//evil.com')          // '/'
 * safeRedirectPath('javascript:alert(1)') // '/'
 * safeRedirectPath('/admin/products')     // '/admin/products'
 * safeRedirectPath('/%2F%2Fevil.com')     // '/' (decoded then rejected)
 */
export function safeRedirectPath(path: string | null | undefined, fallback?: string): string
```

### `cached<T>(key, loader, ttlMs?)` — `src/lib/utils/cache.ts`

```typescript
/**
 * Tiny TTL cache for Supabase reads. Admin pages repeatedly call the same list
 * endpoints (collections/series/products) across views; caching the response for
 * a few seconds avoids redundant network round-trips during navigation while
 * still being safe for soft-delete / restore flows (the TTL is intentionally short).
 *
 * @typeParam T - Type of the cached value
 * @param key - Unique cache key (e.g. 'catalog:collections')
 * @param loader - Async function that produces the value on cache miss
 * @param ttlMs - Time-to-live in milliseconds (default 15000)
 * @returns The cached or freshly-loaded value
 * @throws Whatever `loader` throws (errors are not cached)
 *
 * @example
 * const data = await cached('catalog:collections', () => listCollectionsFromDB(), 30_000)
 */
export async function cached<T>(key: string, loader: () => Promise<T>, ttlMs?: number): Promise<T>
```

### Validation Schemas — `src/lib/validation/`

```typescript
/**
 * Validation schema for the public inquiry form.
 *
 * Enforces:
 *   - Email: valid format (Zod z.email)
 *   - Phone: 11 digits starting with 09
 *   - Full name: 3-80 characters after trim
 *   - City: 1-80 characters
 *   - Customer type: 'individual' | 'business'
 *   - Notes: optional, max 500 characters
 *
 * @example
 * const result = inquirySchema.parse({
 *   customerType: 'business',
 *   fullName: 'علی رضایی',
 *   email: 'ali@example.com',
 *   phone: '09123456789',
 *   projectCity: 'تهران'
 * })
 */
export const inquirySchema: z.ZodObject<...>
```

### اسناد بیشتر

تمام توابع شامل JSDoc هستند. می‌توانید با TypeScript LSP یا [TypeDoc](https://typedoc.org/) documentation کامل استخراج کنید:

```bash
npx typedoc --out docs/api src/lib
```

---

## 5. نمونه کد استفاده

### 5.1 افزودن محصول به سبد استعلام

```tsx
import { useInquiryStore } from '@/store/inquiry-store'
import { Product, TileSize } from '@/types/catalog'

function AddToCartButton({ product, size }: { product: Product; size: TileSize }) {
  const addItem = useInquiryStore((state) => state.addItem)

  return (
    <button onClick={() => addItem(product, size)}>
      افزودن به سبد استعلام
    </button>
  )
}
```

### 5.2 ارسال فرم استعلام با Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inquirySchema, type InquiryFormValues } from '@/lib/validation/inquiry'

function InquiryForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { customerType: 'business', fullName: '', email: '', phone: '', projectCity: '' }
  })

  const onSubmit = async (values: InquiryFormValues) => {
    // values is type-safe and fully validated
    await createInquiryFromBasket(items, values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('fullName')} />
      {errors.fullName && <span>{errors.fullName.message}</span>}
      <button type="submit" disabled={isSubmitting}>ارسال</button>
    </form>
  )
}
```

### 5.3 استفاده از Supabase با RLS

```typescript
import { supabase } from '@/lib/supabase/client'
import { requireAdminClient } from '@/lib/auth/require-admin-client'

// Public read (RLS allows SELECT for published products)
async function getPublicProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, series:series(*, collection:collections(*))')
    .eq('is_published', true)
    .order('sort_order')
  if (error) throw error
  return data
}

// Admin mutation (requires active session + admin role)
async function deleteProduct(id: string) {
  const { client } = await requireAdminClient('super_admin')
  const { error } = await client.from('products').delete().eq('id', id)
  if (error) throw error
}
```

### 5.4 اضافه کردن SEO Metadata به صفحه جدید

```tsx
import { useSEO } from '@/lib/seo/useSEO'
import { productSchema, breadcrumbSchema } from '@/lib/seo/jsonld'

function ProductPage({ product }: { product: Product }) {
  useSEO({
    title: product.name,
    description: `${product.name} - ${product.description}`,
    canonicalPath: `/products/${product.slug}`,
    image: product.image,
    ogType: 'product',
    jsonLd: [
      productSchema({
        name: product.name,
        description: product.description,
        image: product.image,
        slug: product.slug,
        sku: product.sku,
        category: product.category,
      }),
      breadcrumbSchema([
        { name: 'خانه', url: '/' },
        { name: 'محصولات', url: '/#catalog' },
        { name: product.name, url: `/products/${product.slug}` },
      ]),
    ],
  })

  return <main>...</main>
}
```

### 5.5 استفاده از useTheme

```tsx
import { useTheme } from '@/hooks/useTheme'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label={theme === 'dark' ? 'تغییر به روشن' : 'تغییر به تاریک'}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  )
}
```

### 5.6 ساخت یک Page با PageShell

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDialog, PageShell, SearchToolbar, PaginationFooter } from '@/admin/components/admin-ui'
import { adminProductFormSchema, type AdminProductFormValues } from '@/lib/validation/admin-catalog'

function MyAdminPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<AdminProduct | 'new' | null>(null)

  return (
    <PageShell
      eyebrow="کاتالوگ"
      title="محصولات"
      description="مدیریت محصولات کاتالوگ"
      action={<button onClick={() => setEditor('new')}>محصول جدید</button>}
    >
      <div className="module-table-card">
        <SearchToolbar value={search} onChange={setSearch} count={items.length} />
        <div className="admin-table-wrap">
          <table className="admin-data-table">{/* ... */}</table>
        </div>
        <PaginationFooter page={page} totalPages={5} onPageChange={setPage} />
      </div>
      <FormDialog open={editor !== null} title="ویرایش محصول" onClose={() => setEditor(null)}>
        {/* form */}
      </FormDialog>
    </PageShell>
  )
}
```

### 5.7 تست نمونه

```typescript
import { describe, expect, it } from 'vitest'
import { inquirySchema } from '@/lib/validation/inquiry'

describe('inquirySchema', () => {
  it('accepts valid payload', () => {
    expect(() => inquirySchema.parse({
      customerType: 'business',
      fullName: 'علی رضایی',
      email: 'ali@example.com',
      phone: '09123456789',
      projectCity: 'تهران',
    })).not.toThrow()
  })

  it('rejects invalid phone', () => {
    expect(() => inquirySchema.parse({ /* ... */, phone: '12345' })).toThrow()
  })
})
```

---

## 6. معماری و امنیت

### اصول امنیتی (Defense in Depth)

1. **Transport**: HTTPS-only + HSTS preload-eligible headers (`vercel.json`)
2. **Browser**: Strict CSP، no third-party scripts، no `dangerouslySetInnerHTML`
3. **Authentication**: Supabase Magic Link with PKCE (no passwords)
4. **Authorization**: Role check + RLS (PostgreSQL) as authoritative boundary
5. **Validation**: All inputs parsed by Zod schemas
6. **Audit**: `audit_logs` is append-only and inaccessible to admin client
7. **Service-role**: Used only in `scripts/_supabase-admin.ts`

### RLS Policy Summary

| جدول | Public Read | Owner Read | Admin Read | Admin Write |
|---|---|---|---|---|
| `products` | `is_published = true` | — | ✓ | ✓ |
| `inquiries` | — | `customer_id = auth.uid()` | ✓ | ✓ (status only) |
| `admin_profiles` | — | — | ✓ | super_admin |
| `audit_logs` | — | — | ✓ (read-only) | ✗ (append-only via trigger) |

برای جزئیات بیشتر به `docs/rls-matrix.md` مراجعه کنید.

### HTTP Security Headers (Vercel)

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | (inline in `index.html`) |

### تست‌های امنیتی

```bash
# بررسی نبود password auth
grep -R "signInWithPassword" -n src
# خروجی باید خالی باشد

# بررسی نبود service role key در client
grep -R "SUPABASE_SERVICE_ROLE_KEY" -n src
# خروجی باید خالی باشد
```

برای گزارش آسیب‌پذیری: **security@almasceram.ir** (جزئیات در `SECURITY.md`)

---

## 7. استقرار Production

### Vercel

```bash
# نصب Vercel CLI
npm i -g vercel

# اولین deploy
vercel

# Production deploy
vercel --prod
```

### Environment Variables در Vercel Dashboard

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://almasceram.ir
```

### Build Output

```
dist/
├── index.html                 (2.4 KB)
├── assets/
│   ├── index-*.js             (~38 KB)
│   ├── AdminApp-*.js          (~62 KB)
│   ├── AccountApp-*.js        (~3 KB)
│   ├── MagicLinkCallback-*.js (~4 KB)
│   ├── react-*.js             (84 KB)
│   ├── vendor-*.js            (33 KB)
│   ├── forms-*.js             (31 KB)
│   ├── motion-*.js            (11 KB)
│   └── index-*.css            (15 KB)
├── robots.txt
├── sitemap.xml
├── _headers
└── images/                    (فرض می‌شود در CDN)
```

### Post-Deploy Checklist

- [ ] تنظیم environment variables در Vercel
- [ ] اجرای migrations در Supabase production
- [ ] به‌روزرسانی `VITE_SITE_URL` با دامنه واقعی
- [ ] تأیید `robots.txt` و `sitemap.xml` در دسترس هستند
- [ ] تست Magic Link flow واقعی
- [ ] بررسی Lighthouse score
- [ ] Submit sitemap به Google Search Console

---

## 8. مشارکت

### Workflow

1. Fork کنید
2. Branch بسازید (`git checkout -b feature/your-feature`)
3. Commit کنید (`git commit -m 'feat: add amazing feature'`)
4. Push کنید (`git push origin feature/your-feature`)
5. Pull Request باز کنید

### قوانین Commit

ما از [Conventional Commits](https://www.conventionalcommits.org/) پیروی می‌کنیم:

```
feat(scope): add new feature
fix(scope): bug fix
docs(scope): documentation
style(scope): formatting
refactor(scope): code refactoring
test(scope): add tests
chore(scope): tooling
```

### قبل از PR

```bash
npm run typecheck    # بدون خطا
npm run lint         # بدون خطا
npm test             # 123 تست پاس
npm run build        # build موفق
```

### Code Style

- TypeScript strict mode (بدون `any`)
- ESLint با قوانین پروژه
- JSDoc برای توابع public
- RTL-friendly imports
- CSS Modules یا design tokens (بدون inline magic numbers)

---

## 📄 مجوز

Copyright © 2024 ALMASCERAM. All rights reserved.

---

## 🔗 لینک‌های مرتبط

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React 19 Documentation](https://react.dev/)
- [Zod Documentation](https://zod.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Schema.org](https://schema.org/)

---

<div align="center">

**ساخته‌شده با ❤️ توسط تیم ALMASCERAM**

</div>
