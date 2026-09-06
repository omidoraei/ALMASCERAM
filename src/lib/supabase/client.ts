import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const hasUrl = Boolean(supabaseUrl && supabaseUrl.length > 0)
const hasKey = Boolean(supabaseAnonKey && supabaseAnonKey.length > 0)

if (typeof window !== 'undefined') {
  console.info('[supabase] init', {
    hasUrl,
    hasKey,
    url: hasUrl ? supabaseUrl : '(missing)',
    keyPrefix: hasKey ? `${supabaseAnonKey!.slice(0, 12)}…` : '(missing)',
    origin: window.location.origin,
  })
}

export const supabase = hasUrl && hasKey
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null

export const isSupabaseConfigured = supabase !== null

if (typeof window !== 'undefined' && supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.info('[supabase] auth event', event, { hasSession: Boolean(session), userId: session?.user?.id })
  })
}
