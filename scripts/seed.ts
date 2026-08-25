import { createScriptAdminClient } from './_supabase-admin'

const client = createScriptAdminClient()

const { data: collection, error: collectionError } = await client.from('collections').upsert({
  name: 'زمین', slug: 'zamin', description: 'پرسلان‌های الهام‌گرفته از بافت طبیعی زمین', is_published: true, sort_order: 10,
}, { onConflict: 'slug' }).select('id').single()
if (collectionError) throw collectionError

const { error: seriesError } = await client.from('series').upsert({
  collection_id: collection.id, name: 'آرنا', slug: 'arena', description: 'سنگ روشن با بافت آرام', is_published: true, sort_order: 10,
}, { onConflict: 'slug' })
if (seriesError) throw seriesError
console.log('Seed completed safely.')
