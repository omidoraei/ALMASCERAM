import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required')

const client = createClient(url, key, { auth: { persistSession: false } })
const startedAt = Date.now()
const { error } = await client.from('collections').select('id', { count: 'exact', head: true })
if (error) {
  console.error(JSON.stringify({ ok: false, latencyMs: Date.now() - startedAt, error: error.message }))
  process.exit(1)
}
console.log(JSON.stringify({ ok: true, latencyMs: Date.now() - startedAt, checkedAt: new Date().toISOString() }))
