import { supabase } from '../supabase/client'

export type ClientAdminProfile = {
  userId: string
  role: 'super_admin' | 'catalog_manager' | 'sales_manager' | 'content_manager' | 'viewer'
  fullName: string
}

/** Defense-in-depth UX guard. RLS remains the authoritative security boundary. */
export async function requireAdminClient(requiredRole?: 'super_admin') {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('ابتدا از طریق Magic Link وارد شوید')
  const { data: profile, error } = await supabase.from('admin_profiles').select('full_name,role,is_active').eq('user_id', user.id).eq('is_active', true).maybeSingle()
  if (error || !profile) throw new Error('حساب شما دسترسی مدیریت فعال ندارد')
  if (requiredRole && profile.role !== requiredRole) throw new Error('این عملیات فقط برای مدیر ارشد مجاز است')
  return { client: supabase, profile: { userId: user.id, role: profile.role, fullName: profile.full_name } as ClientAdminProfile }
}
