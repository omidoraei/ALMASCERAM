import { supabase } from '../supabase/client'
import { requireAdminClient } from '../auth/require-admin-client'
import { cached, cacheInvalidate } from '../utils/cache'
import {
  catalogIdSchema,
  createCollectionSchema,
  createProductSchema,
  createSeriesSchema,
  createSizeSchema,
  updateCollectionSchema,
  updateProductSchema,
  updateSeriesSchema,
  updateSizeSchema,
  type CreateCollectionInput,
  type CreateProductInput,
  type CreateSeriesInput,
  type CreateSizeInput,
  type UpdateCollectionInput,
  type UpdateProductInput,
  type UpdateSeriesInput,
  type UpdateSizeInput,
} from '../validation/catalog'

type CatalogTable = 'collections' | 'series' | 'products' | 'sizes'
type DatabaseError = { code?: string; message: string }

/**
 * Ensures the public Supabase client is available. Use this for read operations
 * (which are safe under RLS without an admin session).
 * @throws Error when Supabase is not configured
 * @internal
 */
function requireClient() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

/**
 * Translates a raw Supabase error into a localized, user-friendly message.
 * Recognizes specific Postgres error codes (23505 = unique violation,
 * 23503 = foreign key violation, 42501 = insufficient privilege).
 *
 * @param error - The error object from a Supabase query
 * @throws Error with a localized message describing the failure
 * @internal
 */
function throwSafeDatabaseError(error: DatabaseError): never {
  if (error.code === '23505') throw new Error('رکوردی با این اسلاگ، کد یا مشخصات یکتا قبلاً ثبت شده است')
  if (error.code === '23503') throw new Error('این عملیات به‌دلیل رابطه فعال با رکوردهای دیگر مجاز نیست')
  if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) throw new Error('دسترسی لازم برای این عملیات را ندارید')
  throw new Error('عملیات کاتالوگ در پایگاه داده انجام نشد')
}

/**
 * Inserts a new row into one of the catalog tables. Requires an active admin
 * session. Invalidates the corresponding cache key on success.
 * @internal
 */
async function insertRow(table: CatalogTable, payload: Record<string, unknown>) {
  const { client } = await requireAdminClient()
  const { data, error } = await client.from(table).insert(payload as never).select().single()
  if (error) throwSafeDatabaseError(error)
  cacheInvalidate(`catalog:${table}:`)
  return data
}

async function updateRow(table: CatalogTable, id: string, payload: Record<string, unknown>) {
  const rowId = catalogIdSchema.parse(id)
  const { client } = await requireAdminClient()
  const { data, error } = await client.from(table).update(payload as never).eq('id', rowId).select().single()
  if (error) throwSafeDatabaseError(error)
  cacheInvalidate(`catalog:${table}:`)
  return data
}

async function deleteRow(table: CatalogTable, id: string) {
  const rowId = catalogIdSchema.parse(id)
  const { client } = await requireAdminClient('super_admin')
  const { error } = await client.from(table).delete().eq('id', rowId)
  if (error) throwSafeDatabaseError(error)
  cacheInvalidate(`catalog:${table}:`)
  return { success: true as const, id: rowId }
}

/**
 * Lists all collections, ordered by sort_order then created_at descending.
 * Results are cached in memory for 15 seconds to avoid redundant network calls
 * during admin navigation.
 *
 * @returns Array of collection rows from the database
 * @throws Error when Supabase is not configured or the query fails
 *
 * @example
 * const collections = await listCollections()
 * // [{ id, name, slug, ... }, ...]
 */
export function listCollections() {
  return cached('catalog:collections', async () => {
    const { data, error } = await requireClient().from('collections').select('*').order('sort_order').order('created_at', { ascending: false })
    if (error) throwSafeDatabaseError(error)
    return data
  })
}

/**
 * Creates a new collection. Validates input against the schema,
 * requires an active admin session.
 *
 * @param input - The collection fields to create
 * @returns The newly inserted collection row
 * @throws ZodError if input is invalid
 * @throws Error if the admin session is missing or the query fails
 *
 * @example
 * const created = await createCollection({
 *   name: 'زمین',
 *   slug: 'zamin',
 *   description: 'بافت‌های طبیعی',
 *   isActive: true,
 *   isPublished: true,
 *   sortOrder: 10
 * })
 */
export async function createCollection(input: CreateCollectionInput) {
  const value = createCollectionSchema.parse(input)
  return insertRow('collections', {
    name: value.name, slug: value.slug, description: value.description,
    cover_image_path: value.coverImagePath, is_active: value.isActive, is_published: value.isPublished,
    sort_order: value.sortOrder, published_at: value.publishedAt,
  })
}

/**
 * Updates an existing collection. At least one field must be provided.
 * Requires an active admin session.
 *
 * @param id - The collection UUID
 * @param input - Partial collection fields to update
 * @returns The updated collection row
 * @throws ZodError if input is invalid or no fields are provided
 * @throws Error if the admin session is missing or the query fails
 */
export async function updateCollection(id: string, input: UpdateCollectionInput) {
  const value = updateCollectionSchema.parse(input)
  return updateRow('collections', id, {
    name: value.name, slug: value.slug, description: value.description,
    cover_image_path: value.coverImagePath, is_active: value.isActive, is_published: value.isPublished,
    sort_order: value.sortOrder, published_at: value.publishedAt,
  })
}

/**
 * Soft-deletes (deactivates) a collection. The row remains in the database
 * and can be restored. Safe under RLS for any admin.
 *
 * @param id - The collection UUID
 * @returns Result of the underlying update
 */
export const deleteCollection = (id: string) => updateRow('collections', id, { is_active: false })

/** Restores a previously soft-deleted collection. */
export const restoreCollection = (id: string) => updateRow('collections', id, { is_active: true })

/**
 * Permanently removes a collection from the database. Requires the
 * `super_admin` role. This action is irreversible.
 *
 * @param id - The collection UUID
 * @returns Confirmation with the deleted ID
 * @throws Error if the caller is not a super_admin or the deletion fails
 */
export const hardDeleteCollection = (id: string) => deleteRow('collections', id)

export function listSeries(collectionId?: string) {
  const key = collectionId ? `catalog:series:${collectionId}` : 'catalog:series:all'
  return cached(key, async () => {
    let query = requireClient().from('series').select('*').order('sort_order').order('created_at', { ascending: false })
    if (collectionId) query = query.eq('collection_id', catalogIdSchema.parse(collectionId))
    const { data, error } = await query
    if (error) throwSafeDatabaseError(error)
    return data
  })
}

export async function createSeries(input: CreateSeriesInput) {
  const value = createSeriesSchema.parse(input)
  return insertRow('series', {
    collection_id: value.collectionId, name: value.name, slug: value.slug,
    description: value.description, cover_image_path: value.coverImagePath,
    is_active: value.isActive, is_published: value.isPublished, sort_order: value.sortOrder, published_at: value.publishedAt,
  })
}

export async function updateSeries(id: string, input: UpdateSeriesInput) {
  const value = updateSeriesSchema.parse(input)
  return updateRow('series', id, {
    collection_id: value.collectionId, name: value.name, slug: value.slug,
    description: value.description, cover_image_path: value.coverImagePath,
    is_active: value.isActive, is_published: value.isPublished, sort_order: value.sortOrder, published_at: value.publishedAt,
  })
}

export const deleteSeries = (id: string) => updateRow('series', id, { is_active: false })
export const restoreSeries = (id: string) => updateRow('series', id, { is_active: true })
export const hardDeleteSeries = (id: string) => deleteRow('series', id)

export function listProducts(seriesId?: string) {
  const key = seriesId ? `catalog:products:${seriesId}` : 'catalog:products:all'
  return cached(key, async () => {
    let query = requireClient().from('products').select('*').order('sort_order').order('created_at', { ascending: false })
    if (seriesId) query = query.eq('series_id', catalogIdSchema.parse(seriesId))
    const { data, error } = await query
    if (error) throwSafeDatabaseError(error)
    return data
  })
}

export async function createProduct(input: CreateProductInput) {
  const value = createProductSchema.parse(input)
  return insertRow('products', {
    series_id: value.seriesId, surface_id: value.surfaceId, finish_id: value.finishId,
    name: value.name, slug: value.slug, sku: value.sku, description: value.description,
    color_name: value.colorName, is_active: value.isActive, is_published: value.isPublished, is_featured: value.isFeatured,
    sort_order: value.sortOrder, published_at: value.publishedAt,
  })
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const value = updateProductSchema.parse(input)
  return updateRow('products', id, {
    series_id: value.seriesId, surface_id: value.surfaceId, finish_id: value.finishId,
    name: value.name, slug: value.slug, sku: value.sku, description: value.description,
    color_name: value.colorName, is_active: value.isActive, is_published: value.isPublished, is_featured: value.isFeatured,
    sort_order: value.sortOrder, published_at: value.publishedAt,
  })
}

export const deleteProduct = (id: string) => updateRow('products', id, { is_active: false })
export const restoreProduct = (id: string) => updateRow('products', id, { is_active: true })
export const hardDeleteProduct = (id: string) => deleteRow('products', id)

export function listSizes(productId?: string) {
  const key = productId ? `catalog:sizes:${productId}` : 'catalog:sizes:all'
  return cached(key, async () => {
    let query = requireClient().from('sizes').select('*').order('sort_order').order('created_at', { ascending: false })
    if (productId) query = query.eq('product_id', catalogIdSchema.parse(productId))
    const { data, error } = await query
    if (error) throwSafeDatabaseError(error)
    return data
  })
}

export async function createSize(input: CreateSizeInput) {
  const value = createSizeSchema.parse(input)
  return insertRow('sizes', {
    product_id: value.productId, width_mm: value.widthMm, height_mm: value.heightMm,
    thickness_mm: value.thicknessMm, is_rectified: value.isRectified,
    pieces_per_box: value.piecesPerBox, sqm_per_box: value.sqmPerBox,
    box_weight_kg: value.boxWeightKg, is_active: value.isActive, sort_order: value.sortOrder,
  })
}

export async function updateSize(id: string, input: UpdateSizeInput) {
  const value = updateSizeSchema.parse(input)
  return updateRow('sizes', id, {
    product_id: value.productId, width_mm: value.widthMm, height_mm: value.heightMm,
    thickness_mm: value.thicknessMm, is_rectified: value.isRectified,
    pieces_per_box: value.piecesPerBox, sqm_per_box: value.sqmPerBox,
    box_weight_kg: value.boxWeightKg, is_active: value.isActive, sort_order: value.sortOrder,
  })
}

export const deleteSize = (id: string) => updateRow('sizes', id, { is_active: false })
export const restoreSize = (id: string) => updateRow('sizes', id, { is_active: true })
export const hardDeleteSize = (id: string) => deleteRow('sizes', id)
