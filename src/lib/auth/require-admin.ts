import { createServerSupabaseClient } from '../supabase/server'

export type RequiredAdmin = {
  userId: string
  email: string | null
  fullName: string
  role: 'super_admin' | 'catalog_manager' | 'sales_manager' | 'content_manager' | 'viewer'
}

export class AdminAccessError extends Error {
  constructor(public readonly reason: 'authentication_required' | 'admin_required') {
    super(reason)
    this.name = 'AdminAccessError'
  }
}

/**
 * Trusted-runtime guard. Identity is verified with auth.getUser(), never getSession() alone.
 * The admin role is read from the RLS-protected admin_profiles table, not user metadata/JWT claims.
 */
export async function requireAdmin(accessToken?: string): Promise<RequiredAdmin> {
  if (!accessToken) throw new AdminAccessError('authentication_required')
  const client = createServerSupabaseClient(accessToken)
  const { data: { user }, error: userError } = await client.auth.getUser(accessToken)
  if (userError || !user) throw new AdminAccessError('authentication_required')

  const { data: profile, error: profileError } = await client.from('admin_profiles')
    .select('full_name,role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (profileError || !profile) throw new AdminAccessError('admin_required')

  return { userId: user.id, email: user.email ?? null, fullName: profile.full_name, role: profile.role }
}
