import { z } from 'zod'
import { supabase } from '../supabase/client'

export const publicCatalogBucketSchema = z.enum(['catalog-media', 'catalog-documents', 'seo-media'])
export type PublicCatalogBucket = z.infer<typeof publicCatalogBucketSchema>

const safeFolderSchema = z.string().trim().min(1).max(300)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/, 'مسیر پوشه معتبر نیست')
  .refine((value) => !value.includes('..') && !value.includes('//'), 'مسیر پوشه معتبر نیست')

const safeObjectPathSchema = z.string().trim().min(3).max(400)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/, 'مسیر فایل معتبر نیست')
  .refine((value) => !value.includes('..') && !value.includes('//') && !value.endsWith('/'), 'مسیر فایل معتبر نیست')

const uploadInputSchema = z.object({
  bucket: publicCatalogBucketSchema,
  folder: safeFolderSchema,
  upsert: z.boolean().default(false),
})

const deleteInputSchema = z.object({
  bucket: publicCatalogBucketSchema,
  paths: z.array(safeObjectPathSchema).min(1).max(50),
})

const bucketRules: Record<PublicCatalogBucket, { maxBytes: number; mimeTypes: readonly string[] }> = {
  'catalog-media': { maxBytes: 50 * 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4'] },
  'catalog-documents': { maxBytes: 25 * 1024 * 1024, mimeTypes: ['application/pdf'] },
  'seo-media': { maxBytes: 8 * 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] },
}

const extensionByMime: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'application/pdf': 'pdf',
}

function requireClient() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

/**
 * Uploads directly to a public bucket. Storage RLS is the authoritative admin check;
 * no service-role key, signed URL, Server Action runtime, or Edge Function is involved.
 */
export async function uploadPublicCatalogAsset(input: {
  bucket: PublicCatalogBucket
  folder: string
  file: File
  upsert?: boolean
}) {
  const validated = uploadInputSchema.parse({ bucket: input.bucket, folder: input.folder, upsert: input.upsert ?? false })
  const rules = bucketRules[validated.bucket]
  if (!rules.mimeTypes.includes(input.file.type)) throw new Error('نوع فایل برای این bucket مجاز نیست')
  if (input.file.size < 1 || input.file.size > rules.maxBytes) throw new Error('حجم فایل خارج از محدوده مجاز است')

  const extension = extensionByMime[input.file.type]
  if (!extension) throw new Error('پسوند امن برای این فایل تعریف نشده است')
  const path = `${validated.folder}/${crypto.randomUUID()}.${extension}`
  const client = requireClient()
  const { error } = await client.storage.from(validated.bucket).upload(path, input.file, {
    cacheControl: '31536000',
    contentType: input.file.type,
    upsert: validated.upsert,
  })
  if (error) throw new Error(error.message.includes('row-level security') ? 'فقط مدیر فعال اجازه بارگذاری فایل دارد' : 'بارگذاری فایل انجام نشد')

  const { data } = client.storage.from(validated.bucket).getPublicUrl(path)
  return { bucket: validated.bucket, path, publicUrl: data.publicUrl }
}

export function getPublicCatalogAssetUrl(bucket: PublicCatalogBucket, path: string) {
  const validatedBucket = publicCatalogBucketSchema.parse(bucket)
  const validatedPath = safeObjectPathSchema.parse(path)
  return requireClient().storage.from(validatedBucket).getPublicUrl(validatedPath).data.publicUrl
}

export async function deletePublicCatalogAssets(input: { bucket: PublicCatalogBucket; paths: string[] }) {
  const validated = deleteInputSchema.parse(input)
  const { data, error } = await requireClient().storage.from(validated.bucket).remove(validated.paths)
  if (error) throw new Error(error.message.includes('row-level security') ? 'فقط مدیر فعال اجازه حذف فایل دارد' : 'حذف فایل انجام نشد')
  return { deleted: data.map((item) => item.name) }
}
