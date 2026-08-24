// =============================================================================
// اعتبارسنجی Zod — Inquiry Cart & Email OTP
// لایه: 8.1
// =============================================================================
import { z } from 'zod';

export const inquiryItemSchema = z.object({
  productId: z.string().uuid(),
  sizeId: z.string().uuid(),
  quantityBox: z.number().int().positive('تعداد کارتون باید مثبت باشد'),
  note: z.string().trim().max(500).optional(),
});

export type InquiryItemInput = z.infer<typeof inquiryItemSchema>;

export const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('ایمیل معتبر نیست'),
  sessionToken: z.string().uuid(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  sessionToken: z.string().uuid(),
  code: z.string().trim().length(6, 'کد تأیید باید ۶ رقمی باشد'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const submitInquirySchema = z.object({
  sessionToken: z.string().uuid(),
  fullName: z.string().trim().min(3, 'نام و نام‌خانوادگی را کامل وارد کنید').max(150),
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, 'شماره موبایل باید به فرمت 09xxxxxxxxx باشد'),
  email: z.string().trim().toLowerCase().email(),
  companyName: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  message: z.string().trim().max(1000).optional(),
  items: z.array(inquiryItemSchema).min(1, 'سبد استعلام خالی است'),
});

export type SubmitInquiryInput = z.infer<typeof submitInquirySchema>;
