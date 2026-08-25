import { z } from 'zod'
import { supabase } from '../supabase/client'
import { uploadPublicCatalogAsset, deletePublicCatalogAssets } from './storage-actions'
import { catalogIdSchema } from '../validation/catalog'

const mediaInputSchema = z.object({
  sizeId: catalogIdSchema,
  mediaType: z.enum(['image', 'video', 'room_scene', 'texture']),
  title: z.string().trim().max(120).optional(),
  altText: z.string().trim().max(180).optional(),
})

export async function uploadSizeMedia(input: {
  sizeId: string
  mediaType: 'image' | 'video' | 'room_scene' | 'texture'
  title?: string
  altText?: string
  file: File
}) {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  const value = mediaInputSchema.parse(input)
  const asset = await uploadPublicCatalogAsset({
    bucket: 'catalog-media',
    folder: `sizes/${value.sizeId}/media`,
    file: input.file,
  })

  const { data, error } = await supabase.from('size_media').insert({
    size_id: value.sizeId,
    media_type: value.mediaType,
    storage_path: asset.path,
    title: value.title || null,
    alt_text: value.altText || null,
  } as never).select().single()

  if (error) {
    await deletePublicCatalogAssets({ bucket: 'catalog-media', paths: [asset.path] }).catch(() => undefined)
    throw new Error(error.message.includes('row-level security') ? 'مجوز ثبت رسانه را ندارید' : 'ثبت اطلاعات رسانه انجام نشد')
  }
  return { metadata: data, ...asset }
}

export async function uploadSizePdf(input: { sizeId: string; title: string; languageCode: string; file: File }) {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  const value = z.object({ sizeId: catalogIdSchema, title: z.string().trim().min(2).max(120), languageCode: z.string().regex(/^[a-z]{2}$/) }).parse(input)
  const asset = await uploadPublicCatalogAsset({ bucket: 'catalog-documents', folder: `sizes/${value.sizeId}`, file: input.file })
  const { data, error } = await supabase.from('size_pdf_catalog').insert({ size_id: value.sizeId, title: value.title, language_code: value.languageCode, storage_path: asset.path, file_size_bytes: input.file.size } as never).select().single()
  if (error) {
    await deletePublicCatalogAssets({ bucket: 'catalog-documents', paths: [asset.path] }).catch(() => undefined)
    throw new Error('ثبت کاتالوگ PDF انجام نشد')
  }
  return { metadata: data, ...asset }
}
