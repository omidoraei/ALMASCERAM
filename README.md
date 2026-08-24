# پلتفرم نمایش محصولات کاشی و سرامیک

کاتالوگ هوشمند B2B/B2C برای نمایش دقیق فنی محصولات کاشی و سرامیک همراه با
سیستم استعلام قیمت (بدون قیمت‌گذاری عمومی، بدون سبد خرید/پرداخت).

## Tech Stack
Next.js 15 (App Router) · React 18 · TypeScript Strict · Tailwind CSS v4 ·
shadcn/ui + Radix UI · Phosphor Icons · Supabase (PostgreSQL + Auth) · Zod ·
Zustand · React Hook Form

## راه‌اندازی محلی

```bash
npm install
cp .env.local.example .env.local   # سپس مقادیر واقعی Supabase را وارد کنید
npm run dev
```

### اتصال به Supabase واقعی
1. یک پروژه جدید در [supabase.com](https://supabase.com) بسازید.
2. تمام فایل‌های `supabase/migrations/*.sql` را به ترتیب timestamp با
   `supabase db push` یا از طریق SQL Editor اجرا کنید.
3. مقادیر `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` را در `.env.local` قرار دهید.
4. `npm run health-check` را اجرا کنید تا از وجود تمام جداول مطمئن شوید.
5. `npm run seed` را برای وارد کردن داده نمونه اجرا کنید.
6. یک کاربر ادمین در Supabase Auth بسازید و ردیف متناظر را در جدول
   `admin_profiles` (با `role = 'super_admin'`) ثبت کنید.

> **توجه:** تا زمانی که Supabase پیکربندی نشده باشد، سایت به‌صورت خودکار از
> داده‌های نمایشی (`src/lib/data/mock-catalog.ts`) استفاده می‌کند تا امکان
> پیش‌نمایش کامل رابط کاربری بدون بک‌اند واقعی وجود داشته باشد.

## ساختار پوشه‌ها

```
src/
  app/
    (public)/       صفحات عمومی: خانه، کالکشن‌ها، محصولات، جستجو، استعلام، حساب کاربری
    (admin)/admin/  پنل مدیریت (ورود + Guard کامل — UI کامل در مرحله بعد)
  components/
    ui/             کامپوننت‌های پایه (shadcn-style)
    layout/         Header, Footer
    public/         کارت‌ها، سبد استعلام، انتخاب‌گر سایز
    admin/          فرم ورود ادمین
  lib/
    supabase/       کلاینت‌های server/client/admin + پیکربندی
    actions/        Server Actions (CRUD کامل + Inquiry/Auth)
    services/       Service Layer با Fallback به داده نمایشی
    validations/    اسکیمای Zod
    utils/          توابع کمکی (فرمت اعداد فارسی، اسلاگ و ...)
    data/           داده نمایشی برای دمو بدون بک‌اند
  store/            Zustand (فقط سبد استعلام)
supabase/migrations/  تمام Migrationهای SQL (Single Source of Truth دیتابیس)
scripts/              seed.ts و health-check.ts
docs/architecture/    مستندسازی معماری ۱۲ لایه، ERD، RLS، HARNESS/FINN-Loop
```

## مستندات معماری
پیش از هرگونه تغییر، فایل‌های داخل `docs/architecture/` را مطالعه کنید:
- `00-overview.md` — چشم‌انداز و اصول حاکم
- `01-layers.md` — وضعیت هر یک از ۱۲ لایه معماری
- `02-database-erd.md` — نقشه دیتابیس و روابط
- `03-rls-policies.md` — جدول کامل سیاست‌های RLS
- `04-harness-finn-loop.md` — متدولوژی توسعه
- `05-roadmap.md` — نقشه راه مراحل بعدی

## اسکریپت‌ها

| دستور | توضیح |
|---|---|
| `npm run dev` | اجرای سرور توسعه |
| `npm run build` | ساخت نسخه تولید |
| `npm run typecheck` | بررسی TypeScript بدون emit |
| `npm run seed` | وارد کردن داده نمونه به Supabase |
| `npm run health-check` | بررسی سلامت اتصال و وجود تمام جداول |

## وضعیت فعلی توسعه
مراحل صفر تا ۲ (زیرساخت، دیتابیس، Server Actions) تکمیل شده است. طبق
دستور کارفرما، پیاده‌سازی کامل رابط کاربری پنل مدیریت (لایه ۹) در انتظار
تأیید نهایی است.
