import { createClient } from '@supabase/supabase-js'

/** Server-only factory. Never import this module into a browser entry. */
export function createServerSupabaseClient(accessToken?: string) {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase server environment is not configured')

  return createClient(url, anonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
