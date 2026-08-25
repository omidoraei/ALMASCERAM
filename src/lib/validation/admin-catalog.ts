import { z } from 'zod'

export const adminProductFormSchema = z.object({
  name: z.string().trim().min(2, 'نام محصول حداقل ۲ کاراکتر است').max(140),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'اسلاگ فقط حروف انگلیسی کوچک، عدد و خط تیره'),
  sku: z.string().trim().min(2, 'کد محصول الزامی است').max(60),
  seriesId: z.string().min(1, 'سری محصول را انتخاب کنید'),
  description: z.string().trim().max(5000).optional(),
  isPublished: z.boolean(),
})

export type AdminProductFormValues = z.infer<typeof adminProductFormSchema>

export const inquiryAdminStatusSchema = z.enum(['submitted', 'in_review', 'quoted', 'closed', 'cancelled'])
export type InquiryAdminStatus = z.infer<typeof inquiryAdminStatusSchema>
