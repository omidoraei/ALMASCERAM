// =============================================================================
// اعتبارسنجی Zod — Series
// لایه: 8.1
// =============================================================================
import { z } from 'zod';
import { slugRegex } from './collection.schema';

export const seriesSchema = z.object({
  collection_id: z.string().uuid('کالکشن معتبر انتخاب کنید'),
  name_fa: z.string().trim().min(2).max(150),
  name_en: z.string().trim().min(2).max(150),
  slug: z.string().trim().toLowerCase().regex(slugRegex, 'slug نامعتبر است'),
  description: z.string().trim().max(2000).nullable().optional(),
  cover_image_url: z.string().trim().url().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type SeriesInput = z.infer<typeof seriesSchema>;

export const seriesUpdateSchema = seriesSchema.partial().extend({
  id: z.string().uuid(),
});

export type SeriesUpdateInput = z.infer<typeof seriesUpdateSchema>;
