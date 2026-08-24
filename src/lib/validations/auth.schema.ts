// =============================================================================
// اعتبارسنجی Zod — احراز هویت (Admin & Customer)
// لایه: 8.1
// =============================================================================
import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('ایمیل معتبر نیست'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const customerOtpRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email('ایمیل معتبر نیست'),
});

export type CustomerOtpRequestInput = z.infer<typeof customerOtpRequestSchema>;

export const customerOtpVerifySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6, 'کد تأیید باید ۶ رقمی باشد'),
});

export type CustomerOtpVerifyInput = z.infer<typeof customerOtpVerifySchema>;
