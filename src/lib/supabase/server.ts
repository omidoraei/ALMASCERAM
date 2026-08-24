// =============================================================================
// Supabase Server Client — برای استفاده در Server Components / Server Actions
// لایه: 7 (زیرساخت) — از کلید anon استفاده می‌کند و تحت نظارت RLS است.
// هرگز این کلاینت را برای عملیاتی که نیاز به دور‌زدن RLS دارند استفاده نکنید.
// =============================================================================
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // در Server Component (نه Server Action) قابل تنظیم نیست — میدلوور session refresh خود را مدیریت می‌کند
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // رجوع به یادداشت بالا
          }
        },
      },
    }
  );
}

/** آیا متغیرهای محیطی Supabase تنظیم شده‌اند؟ (برای fallback به داده نمایشی در حالت دمو) */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-ref')
  );
}
