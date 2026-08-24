// =============================================================================
// اعتبارسنجی Zod — Sizes & Technical Data
// لایه: 8.1
// =============================================================================
import { z } from 'zod';

export const sizeSchema = z.object({
  product_id: z.string().uuid('محصول معتبر انتخاب کنید'),
  size_label: z.string().trim().min(2).max(30),
  width_mm: z.number().positive('عرض باید مثبت باشد'),
  height_mm: z.number().positive('طول باید مثبت باشد'),
  thickness_mm: z.number().positive('ضخامت باید مثبت باشد'),
  is_rectified: z.boolean().default(true),
  packaging_pieces_per_box: z.number().int().positive(),
  packaging_boxes_per_pallet: z.number().int().positive(),
  packaging_m2_per_box: z.number().positive(),
  packaging_weight_per_box_kg: z.number().positive(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type SizeInput = z.infer<typeof sizeSchema>;

export const sizeUpdateSchema = sizeSchema.partial().extend({
  id: z.string().uuid(),
});

export type SizeUpdateInput = z.infer<typeof sizeUpdateSchema>;

export const sizeTechnicalDataSchema = z.object({
  size_id: z.string().uuid(),
  pei_rating: z.number().int().min(0).max(5).nullable().optional(),
  water_absorption_percent: z.number().min(0).max(100).nullable().optional(),
  breaking_strength_n: z.number().positive().nullable().optional(),
  mohs_hardness: z.number().min(0).max(10).nullable().optional(),
  slip_resistance_r_rating: z.string().trim().max(10).nullable().optional(),
  frost_resistant: z.boolean().default(false),
  chemical_resistance: z.string().trim().max(500).nullable().optional(),
  standard_reference: z.string().trim().max(100).default('ISO 13006'),
});

export type SizeTechnicalDataInput = z.infer<typeof sizeTechnicalDataSchema>;
