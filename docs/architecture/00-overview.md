# مستند معماری — پلتفرم نمایش محصولات کاشی و سرامیک

## ماهیت پروژه
این پروژه یک **کاتالوگ محصول تخصصی B2B/B2C** است — نه فروشگاه آنلاین. هیچ
قیمت‌گذاری عمومی، سبد خرید نهایی یا درگاه پرداخت در این سیستم وجود ندارد.

هدف اصلی:
1. نمایش دقیق فنی محصولات کاشی/سرامیک (تمرکز ویژه بر جزئیات سایز)
2. تبدیل بازدیدکننده به لید باکیفیت از طریق **سیستم استعلام قیمت**
3. سبد استعلام پایدار (Persistent Inquiry) که بین چند محصول/سایز جمع می‌شود
4. احراز هویت Email OTP قبل از نهایی‌سازی استعلام

## Tech Stack
| لایه | فناوری |
|---|---|
| Frontend | Next.js 15+ (App Router) / React 18 / TypeScript Strict |
| UI | Tailwind CSS v4 + shadcn/ui + Radix UI + Phosphor Icons |
| Backend | Supabase (PostgreSQL + Auth + Storage) — بدون ORM |
| Validation | Zod (تمام ورودی‌ها) |
| State | Server Components (اصلی) + Zustand (فقط کلاینت) |
| Deployment | Vercel + Supabase Cloud |

## اصول حاکم
- **Security by Design**: هر جدول دارای RLS، هر Server Action دارای بررسی
  نقش دوباره (Defense in Depth) صرف‌نظر از RLS.
- **Least Privilege**: کلید `service_role` هرگز به کلاینت نشت نمی‌کند و فقط
  در Server Actions حساس (OTP، Audit) استفاده می‌شود.
- **SEO فنی قوی**: ISR (`revalidate`) روی صفحات کاتالوگ + SSR روی صفحات
  حساس به session (حساب کاربری) + جداول اختصاصی SEO (`*_seo`) + `sitemap.ts`
  و `robots.ts`.
- **TypeScript Strict**: `strict: true`, `noUncheckedIndexedAccess: true`.
- **snake_case در دیتابیس / camelCase در کد** طبق قرارداد پروژه.

برای جزئیات هر لایه به فایل‌های دیگر در همین پوشه مراجعه کنید.
