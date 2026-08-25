import { z } from 'zod'

export const inquirySchema = z.object({
  customerType: z.enum(['individual', 'business']),
  fullName: z.string().trim().min(3, 'نام و نام خانوادگی را کامل وارد کنید').max(80),
  email: z.email('ایمیل معتبر وارد کنید'),
  phone: z.string().trim().regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود'),
  company: z.string().trim().max(100).optional(),
  projectCity: z.string().trim().min(2, 'شهر پروژه را وارد کنید').max(60),
  notes: z.string().trim().max(500).optional(),
})

export type InquiryFormValues = z.infer<typeof inquirySchema>
