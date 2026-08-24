'use server';

// =============================================================================
// Server Actions — سبد استعلام (Persistent Inquiry Cart) + احراز هویت Email OTP
// لایه: 8.2 — جریان اصلی:
//   1) requestInquiryOtpAction: ذخیره سبد موقت (pending_inquiries با service role — چون
//      کاربر هنوز احرازهویت نشده و RLS هیچ دسترسی به این جدول نمی‌دهد) +
//      ارسال OTP واقعی از طریق Supabase Auth (signInWithOtp)
//   2) verifyInquiryOtpAction: تایید کد و تبدیل سبد moqت به استعلام رسمی (inquiries)
//   3) submitAuthenticatedInquiryAction: مشتریان احرازهویت‌شده مستقیماً استعلام می‌فرستند
// =============================================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requestOtpSchema, verifyOtpSchema, submitInquirySchema, inquiryItemSchema } from '@/lib/validations/inquiry.schema';
import { generateInquiryNumberRandom } from '@/lib/utils/slug';
import { logAudit } from '@/lib/services/audit.service';
import { z } from 'zod';
import type { ActionResult } from './collections.actions';

const requestOtpWithCartSchema = requestOtpSchema.extend({
  items: z.array(inquiryItemSchema).min(1, 'سبد استعلام خالی است'),
});

export async function requestInquiryOtpAction(formData: unknown): Promise<ActionResult> {
  const parsed = requestOtpWithCartSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, sessionToken, items } = parsed.data;

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const admin = createAdminClient();
      await admin.from('pending_inquiries').upsert(
        {
          session_token: sessionToken,
          email,
          items,
          otp_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          otp_attempts: 0,
        },
        { onConflict: 'session_token' }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { role: 'customer' } },
    });

    if (error) return { success: false, error: 'ارسال کد تأیید ناموفق بود: ' + error.message };

    await logAudit({ action: 'inquiry.otp_requested', entityType: 'pending_inquiry', metadata: { email } });

    return { success: true };
  } catch (err) {
    return { success: false, error: 'خطای سرور در ارسال کد تأیید. لطفاً Supabase Auth (SMTP) را بررسی کنید.' };
  }
}

export async function verifyInquiryOtpAction(formData: unknown): Promise<ActionResult<{ inquiryNumber: string }>> {
  const parsed = verifyOtpSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'کد تأیید نامعتبر است', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, sessionToken, code } = parsed.data;
  const supabase = await createClient();

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (verifyError || !verifyData.user) {
    return { success: false, error: 'کد تأیید نادرست یا منقضی شده است' };
  }

  const user = verifyData.user;

  try {
    let items: Array<{ productId: string; sizeId: string; quantityBox: number; note?: string }> = [];

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const admin = createAdminClient();
      const { data: pending } = await admin
        .from('pending_inquiries')
        .select('items')
        .eq('session_token', sessionToken)
        .maybeSingle();
      if (pending?.items) items = pending.items as typeof items;
    }

    if (items.length === 0) {
      return { success: false, error: 'سبد استعلام یافت نشد یا منقضی شده است' };
    }

    const { data: customerProfile } = await supabase
      .from('customer_profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .maybeSingle();

    const inquiryNumber = generateInquiryNumberRandom();

    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        inquiry_number: inquiryNumber,
        customer_id: user.id,
        full_name: customerProfile?.full_name ?? email.split('@')[0],
        phone: customerProfile?.phone ?? '',
        email,
        status: 'pending',
      })
      .select()
      .single();

    if (inquiryError) return { success: false, error: inquiryError.message };

    const inquiryItemsPayload = items.map((item) => ({
      inquiry_id: inquiry.id,
      product_id: item.productId,
      size_id: item.sizeId,
      quantity_box: item.quantityBox,
      note: item.note ?? null,
    }));

    const { error: itemsError } = await supabase.from('inquiry_items').insert(inquiryItemsPayload);
    if (itemsError) return { success: false, error: itemsError.message };

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const admin = createAdminClient();
      await admin.from('pending_inquiries').delete().eq('session_token', sessionToken);
    }

    await logAudit({ actorId: user.id, action: 'inquiry.submitted', entityType: 'inquiry', entityId: inquiry.id });

    revalidatePath('/account');
    return { success: true, data: { inquiryNumber } };
  } catch {
    return { success: false, error: 'خطای سرور در ثبت استعلام' };
  }
}

export async function submitAuthenticatedInquiryAction(formData: unknown): Promise<ActionResult<{ inquiryNumber: string }>> {
  const parsed = submitInquirySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'ابتدا وارد حساب شوید' };

  const { fullName, phone, email, companyName, city, message, items } = parsed.data;
  const inquiryNumber = generateInquiryNumberRandom();

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .insert({
      inquiry_number: inquiryNumber,
      customer_id: user.id,
      full_name: fullName,
      phone,
      email,
      company_name: companyName ?? null,
      city: city ?? null,
      message: message ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  const itemsPayload = items.map((item) => ({
    inquiry_id: inquiry.id,
    product_id: item.productId,
    size_id: item.sizeId,
    quantity_box: item.quantityBox,
    note: item.note ?? null,
  }));

  const { error: itemsError } = await supabase.from('inquiry_items').insert(itemsPayload);
  if (itemsError) return { success: false, error: itemsError.message };

  await logAudit({ actorId: user.id, action: 'inquiry.submitted', entityType: 'inquiry', entityId: inquiry.id });

  revalidatePath('/account');
  return { success: true, data: { inquiryNumber } };
}
