import { supabase } from '../supabase/client'
import { catalogIdSchema } from '../validation/catalog'
import { pageQuerySchema, taxonomyInputSchema, taxonomyKindSchema, taxonomyUpdateSchema, type TaxonomyInput, type TaxonomyKind } from '../validation/admin-entities'
import { requireAdminClient } from '../auth/require-admin-client'

function client() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

function safeError(error: { code?: string; message: string }): never {
  if (error.code === '23505') throw new Error('نام یا اسلاگ تکراری است')
  if (error.code === '23503') throw new Error('این مورد در کاتالوگ استفاده شده و قابل حذف فیزیکی نیست')
  if (error.code === '42501' || error.message.includes('row-level security')) throw new Error('مجوز این عملیات را ندارید')
  throw new Error('عملیات طبقه‌بندی انجام نشد')
}

const table = (kind: TaxonomyKind) => taxonomyKindSchema.parse(kind)
const row = (kind: TaxonomyKind, value: TaxonomyInput) => ({
  name: value.name,
  slug: value.slug,
  description: value.description,
  ...(kind === 'spaces' ? { icon: value.icon } : {}),
  is_active: value.isActive,
  sort_order: value.sortOrder,
})

export async function listTaxonomies(kind: TaxonomyKind, input: { page?: number; pageSize?: number; search?: string } = {}) {
  const target = table(kind)
  const query = pageQuerySchema.parse(input)
  const from = (query.page - 1) * query.pageSize
  const to = from + query.pageSize - 1
  let request = client().from(target).select('*', { count: 'exact' }).order('sort_order').order('created_at', { ascending: false }).range(from, to)
  if (query.search) request = request.or(`name.ilike.%${query.search}%,slug.ilike.%${query.search}%`)
  const { data, count, error } = await request
  if (error) safeError(error)
  return { rows: data, total: count ?? 0, page: query.page, pageSize: query.pageSize }
}

export async function createTaxonomy(kind: TaxonomyKind, input: TaxonomyInput) {
  const target = table(kind)
  const value = taxonomyInputSchema.parse(input)
  const { client: adminClient } = await requireAdminClient()
  const { data, error } = await adminClient.from(target).insert(row(target, value) as never).select().single()
  if (error) safeError(error)
  return data
}

export async function updateTaxonomy(kind: TaxonomyKind, id: string, input: Partial<TaxonomyInput>) {
  const target = table(kind)
  const itemId = catalogIdSchema.parse(id)
  const value = taxonomyUpdateSchema.parse(input)
  const { client: adminClient } = await requireAdminClient()
  const { data, error } = await adminClient.from(target).update(row(target, value as TaxonomyInput) as never).eq('id', itemId).select().single()
  if (error) safeError(error)
  return data
}

export const softDeleteTaxonomy = (kind: TaxonomyKind, id: string) => updateTaxonomy(kind, id, { isActive: false })
export const restoreTaxonomy = (kind: TaxonomyKind, id: string) => updateTaxonomy(kind, id, { isActive: true })

export async function hardDeleteTaxonomy(kind: TaxonomyKind, id: string) {
  const { client: adminClient } = await requireAdminClient('super_admin')
  const { error } = await adminClient.from(table(kind)).delete().eq('id', catalogIdSchema.parse(id))
  if (error) safeError(error)
  return { success: true as const }
}
