import { z } from 'zod'

export const catalogIdSchema = z.uuid('شناسه معتبر نیست')
export const catalogSlugSchema = z.string().trim().min(2).max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'اسلاگ فقط شامل حروف انگلیسی کوچک، عدد و خط تیره است')
const optionalDescription = z.string().trim().max(5000).nullable().optional()
const optionalStoragePath = z.string().trim().min(3).max(500).nullable().optional()
const optionalPublishedAt = z.string().datetime({ offset: true }).nullable().optional()
const sortOrder = z.number().int().min(0).max(1_000_000).optional()
const nonEmptyUpdate = <T extends z.ZodRawShape>(shape: T) => z.object(shape).partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  'حداقل یک فیلد برای ویرایش لازم است',
)

const collectionShape = {
  name: z.string().trim().min(2).max(120),
  slug: catalogSlugSchema,
  description: optionalDescription,
  coverImagePath: optionalStoragePath,
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder,
  publishedAt: optionalPublishedAt,
}
export const createCollectionSchema = z.object({ ...collectionShape, name: collectionShape.name, slug: collectionShape.slug })
export const updateCollectionSchema = nonEmptyUpdate(collectionShape)
export type CreateCollectionInput = z.input<typeof createCollectionSchema>
export type UpdateCollectionInput = z.input<typeof updateCollectionSchema>

const seriesShape = {
  collectionId: catalogIdSchema,
  name: z.string().trim().min(2).max(120),
  slug: catalogSlugSchema,
  description: optionalDescription,
  coverImagePath: optionalStoragePath,
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder,
  publishedAt: optionalPublishedAt,
}
export const createSeriesSchema = z.object({ ...seriesShape, collectionId: seriesShape.collectionId, name: seriesShape.name, slug: seriesShape.slug })
export const updateSeriesSchema = nonEmptyUpdate(seriesShape)
export type CreateSeriesInput = z.input<typeof createSeriesSchema>
export type UpdateSeriesInput = z.input<typeof updateSeriesSchema>

const productShape = {
  seriesId: catalogIdSchema,
  surfaceId: catalogIdSchema.nullable().optional(),
  finishId: catalogIdSchema.nullable().optional(),
  name: z.string().trim().min(2).max(140),
  slug: catalogSlugSchema,
  sku: z.string().trim().min(2).max(60),
  description: optionalDescription,
  colorName: z.string().trim().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder,
  publishedAt: optionalPublishedAt,
}
export const createProductSchema = z.object({ ...productShape, seriesId: productShape.seriesId, name: productShape.name, slug: productShape.slug, sku: productShape.sku })
export const updateProductSchema = nonEmptyUpdate(productShape)
export type CreateProductInput = z.input<typeof createProductSchema>
export type UpdateProductInput = z.input<typeof updateProductSchema>

const sizeShape = {
  productId: catalogIdSchema,
  widthMm: z.number().int().positive().max(5000),
  heightMm: z.number().int().positive().max(5000),
  thicknessMm: z.number().positive().max(100),
  isRectified: z.boolean().optional(),
  piecesPerBox: z.number().int().positive().max(10_000).nullable().optional(),
  sqmPerBox: z.number().positive().max(100_000).nullable().optional(),
  boxWeightKg: z.number().positive().max(100_000).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder,
}
export const createSizeSchema = z.object({ ...sizeShape, productId: sizeShape.productId, widthMm: sizeShape.widthMm, heightMm: sizeShape.heightMm, thicknessMm: sizeShape.thicknessMm })
export const updateSizeSchema = nonEmptyUpdate(sizeShape)
export type CreateSizeInput = z.input<typeof createSizeSchema>
export type UpdateSizeInput = z.input<typeof updateSizeSchema>
