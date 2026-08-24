// =============================================================================
// اعتبارسنجی Zod — Products
// لایه: 8.1
// =============================================================================
import { z } from 'zod';
import { slugRegex } from './collection.schema';

export const applicationTypeEnum = z.enum([
  'floor',
  'wall',
  'floor_and_wall',
  'facade',
  'pool_and_wet_areas',
  'outdoor_landscape',
]);

export const productSchema = z.object({
  series_id: z.string().uuid('سری معتبر انتخاب کنید'),
  surface_id: z.string().uuid().nullable().optional(),
  finish_id: z.string().uuid().nullable().optional(),
  name_fa: z.string().trim().min(2).max(150),
  name_en: z.string().trim().min(2).max(150),
  slug: z.string().trim().toLowerCase().regex(slugRegex),
  sku_prefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,30}$/, 'کد محصول فقط حروف بزرگ انگلیسی، عدد و خط تیره دارد'),
  description: z.string().trim().max(4000).nullable().optional(),
  application_type: applicationTypeEnum.default('floor_and_wall'),
  color_family: z.string().trim().max(100).nullable().optional(),
  design_pattern: z.string().trim().max(100).nullable().optional(),
  cover_image_url: z.string().trim().url().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productUpdateSchema = productSchema.partial().extend({
  id: z.string().uuid(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
