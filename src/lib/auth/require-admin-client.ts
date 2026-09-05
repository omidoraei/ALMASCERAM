import { supabase } from '../supabase/client'
import { z } from 'zod'

/**
 * Returns a Supabase client bound to the currently authenticated admin session.
 * Performs a defensive admin check against `admin_profiles` and (optionally) the role.
 *
 * The browser never sees the service-role key; RLS on `admin_profiles` is the
 * authoritative authorization boundary and the Storage policies in turn gate
 * bucket writes. We only need to ensure the active session matches an active
 * admin record before destructive mutations.
 */
export async function requireAdminClient(requiredRole?: 'super_admin' | 'catalog_manager' | 'sales_manager' | 'content_manager' | 'viewer') {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData.session) {
    throw new Error('برای این عملیات ابتدا وارد حساب مدیریت شوید')
  }
  const userId = z.uuid().parse(sessionData.session.user.id)
  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('user_id, role, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()
  if (profileError) throw new Error('بررسی دسترسی مدیریت انجام نشد')
  if (!profile) throw new Error('حساب فعال مدیریتی برای شما ثبت نشده است')
  if (requiredRole && profile.role !== requiredRole && profile.role !== 'super_admin') {
    throw new Error('نقش شما برای این عملیات کافی نیست')
  }
  return { client: supabase, userId, role: profile.role }
}
