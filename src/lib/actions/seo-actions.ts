import { supabase } from '../supabase/client'
import { seoEntitySchema, seoInputSchema, type SeoEntity, type SeoInput } from '../validation/admin-entities'
import { requireAdminClient } from '../auth/require-admin-client'

const config = {
  collection: { table: 'collection_seo', idColumn: 'collection_id' },
  series: { table: 'series_seo', idColumn: 'series_id' },
  product: { table: 'product_seo', idColumn: 'product_id' },
} as const

function client() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

export async function listSeoRecords(entity: SeoEntity) {
  const target = config[seoEntitySchema.parse(entity)]
  const { data, error } = await client().from(target.table).select('*').order('updated_at', { ascending: false })
  if (error) throw new Error('دریافت اطلاعات SEO انجام نشد')
  return data
}

export async function upsertSeoRecord(entity: SeoEntity, input: SeoInput) {
  const target = config[seoEntitySchema.parse(entity)]
  const value = seoInputSchema.parse(input)
  const payload = {
    [target.idColumn]: value.entityId,
    meta_title: value.metaTitle,
    meta_description: value.metaDescription,
    canonical_url: value.canonicalUrl,
    focus_keyword: value.focusKeyword,
    og_title: value.ogTitle,
    og_description: value.ogDescription,
    og_image_path: value.ogImagePath,
    robots_noindex: value.robotsNoindex,
    robots_nofollow: value.robotsNofollow,
    json_ld: value.jsonLd,
  }
  const { client: adminClient } = await requireAdminClient()
  const { data, error } = await adminClient.from(target.table).upsert(payload as never, { onConflict: target.idColumn }).select().single()
  if (error) throw new Error(error.message.includes('row-level security') ? 'مجوز مدیریت SEO را ندارید' : 'ذخیره اطلاعات SEO انجام نشد')
  return data
}
