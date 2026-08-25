import { createServerSupabaseClient } from '../supabase/server'
import { AdminAccessError, requireAdmin } from './require-admin'

export type RouteDecision =
  | { allowed: true }
  | { allowed: false; redirectTo: '/login'; reason: 'authentication_required' | 'admin_required' }

/**
 * Pure authorization policy for deployment middleware/adapters.
 * `/account` requires a valid Supabase identity; `/admin` additionally requires an active admin profile.
 * The function never accepts a role claim from client-controlled metadata.
 */
export async function authorizeProtectedPath(pathname: string, accessToken?: string): Promise<RouteDecision> {
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAccountPath = pathname === '/account' || pathname.startsWith('/account/')
  if (!isAdminPath && !isAccountPath) return { allowed: true }
  if (!accessToken) return { allowed: false, redirectTo: '/login', reason: 'authentication_required' }

  if (isAdminPath) {
    try {
      await requireAdmin(accessToken)
      return { allowed: true }
    } catch (error) {
      const reason = error instanceof AdminAccessError ? error.reason : 'admin_required'
      return { allowed: false, redirectTo: '/login', reason }
    }
  }

  const client = createServerSupabaseClient(accessToken)
  const { data: { user }, error: userError } = await client.auth.getUser(accessToken)
  if (userError || !user) return { allowed: false, redirectTo: '/login', reason: 'authentication_required' }
  return { allowed: true }
}
