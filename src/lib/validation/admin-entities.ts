import { z } from 'zod'
import { catalogIdSchema, catalogSlugSchema } from './catalog'

export const taxonomyKindSchema = z.enum(['surface', 'finishes', 'spaces'])
export type TaxonomyKind = z.infer<typeof taxonomyKindSchema>

export const taxonomyInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: catalogSlugSchema,
  description: z.string().trim().max(2000).nullable().optional(),
  icon: z.string().trim().max(80).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})
export const taxonomyUpdateSchema = taxonomyInputSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  'حداقل یک فیلد برای ویرایش لازم است',
)
export type TaxonomyInput = z.input<typeof taxonomyInputSchema>

export const pageQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(20),
  search: z.string().trim().max(100).default(''),
})

export const seoEntitySchema = z.enum(['collection', 'series', 'product'])
export type SeoEntity = z.infer<typeof seoEntitySchema>
export const seoInputSchema = z.object({
  entityId: catalogIdSchema,
  metaTitle: z.string().trim().min(10).max(70),
  metaDescription: z.string().trim().min(50).max(170),
  canonicalUrl: z.url().nullable().optional(),
  focusKeyword: z.string().trim().max(100).nullable().optional(),
  ogTitle: z.string().trim().max(100).nullable().optional(),
  ogDescription: z.string().trim().max(250).nullable().optional(),
  ogImagePath: z.string().trim().max(500).nullable().optional(),
  robotsNoindex: z.boolean().default(false),
  robotsNofollow: z.boolean().default(false),
  jsonLd: z.record(z.string(), z.unknown()).default({}),
})
export type SeoInput = z.input<typeof seoInputSchema>
