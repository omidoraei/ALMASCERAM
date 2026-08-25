import { z } from 'zod'

export const inquiryBasketItemSchema = z.object({
  sizeId: z.uuid('شناسه سایز معتبر نیست'),
  quantity: z.number().int().min(1).max(100_000),
  requestedSqm: z.number().positive().max(9_999_999_999.99).optional(),
  note: z.string().trim().max(500).optional(),
})

export const createInquiryFromBasketSchema = z.object({
  items: z.array(inquiryBasketItemSchema).min(1, 'سبد استعلام خالی است').max(50, 'حداکثر ۵۰ قلم مجاز است'),
  note: z.string().trim().max(2000).optional(),
}).superRefine(({ items }, context) => {
  const sizeIds = new Set<string>()
  items.forEach((item, index) => {
    if (sizeIds.has(item.sizeId)) {
      context.addIssue({ code: 'custom', path: ['items', index, 'sizeId'], message: 'هر سایز فقط یک‌بار مجاز است' })
    }
    sizeIds.add(item.sizeId)
  })
})

export type CreateInquiryFromBasketInput = z.infer<typeof createInquiryFromBasketSchema>
