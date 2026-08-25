import { createClient } from '@supabase/supabase-js'

/** Least-privilege rule: service-role client is restricted to scripts and trusted server runtimes. */
export function createAdminSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Supabase admin environment is not configured')
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
}
