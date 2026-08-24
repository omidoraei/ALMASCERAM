// =============================================================================
// Supabase Browser Client — برای استفاده در Client Components
// لایه: 7 (زیرساخت) — فقط کلید anon (با RLS محدود) افشا می‌شود.
// =============================================================================
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database.types';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}
