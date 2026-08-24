// =============================================================================
// Supabase Admin Client (Service Role) — فقط سمت سرور!
// لایه: 7 (زیرساخت) — این کلاینت RLS را دور می‌زند (Bypass RLS).
// این فایل هرگز نباید import 'client' شود و باید فقط در
// Server Actions حساس (مثل مدیریت OTP در pending_inquiries یا audit_logs) فراخوانی شود.
// هرگز آن را در مرورگر کلاینت expose نکنید (Least Privilege).
// =============================================================================
import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.types';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'متغیرهای SUPABASE_SERVICE_ROLE_KEY یا NEXT_PUBLIC_SUPABASE_URL تنظیم نشده‌اند.'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
