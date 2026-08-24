// =============================================================================
// اعتبارسنجی Zod — Collections
// لایه: 8.1 (Validation Layer)
// =============================================================================
import { z } from 'zod';

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const collectionSchema = z.object({
  name_fa: z.string().trim().min(2, 'نام فارسی باید حداقل ۲ کاراکتر باشد').max(150),
  name_en: z.string().trim().min(2, 'نام انگلیسی باید حداقل ۲ کاراکتر باشد').max(150),
  slug: z.string().trim().toLowerCase().regex(slugRegex, 'slug فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد'),
  description: z.string().trim().max(2000).nullable().optional(),
  cover_image_url: z.string().trim().url('آدرس تصویر معتبر نیست').nullable().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export const collectionUpdateSchema = collectionSchema.partial().extend({
  id: z.string().uuid('شناسه نامعتبر'),
});

export type CollectionUpdateInput = z.infer<typeof collectionUpdateSchema>;
