'use server';

// =============================================================================
// Server Actions — احراز هویت (ادمین با Email/Password — مشتری با Email OTP)
// لایه: 8.2
// =============================================================================
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { adminLoginSchema, customerOtpRequestSchema, customerOtpVerifySchema } from '@/lib/validations/auth.schema';
import { logAudit } from '@/lib/services/audit.service';
import type { ActionResult } from './collections.actions';

export async function adminLoginAction(formData: unknown): Promise<ActionResult> {
  const parsed = adminLoginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'ایمیل یا رمز عبور نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await logAudit({ action: 'admin.login_failed', entityType: 'admin', level: 'warning', metadata: { email: parsed.data.email } });
    return { success: false, error: 'ایمیل یا رمز عبور اشتباه است' };
  }

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!adminProfile || !adminProfile.is_active) {
    await supabase.auth.signOut();
    return { success: false, error: 'شما دسترسی پنل مدیریت را ندارید' };
  }

  await logAudit({ actorId: data.user.id, actorRole: 'admin', action: 'admin.login_success', entityType: 'admin' });

  revalidatePath('/admin');
  return { success: true };
}

export async function adminLogoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function customerRequestOtpAction(formData: unknown): Promise<ActionResult> {
  const parsed = customerOtpRequestSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'ایمیل نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true, data: { role: 'customer' } },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function customerVerifyOtpAction(formData: unknown): Promise<ActionResult> {
  const parsed = customerOtpVerifySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'کد تأیید نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: 'email',
  });

  if (error || !data.user) return { success: false, error: 'کد تأیید نادرست است' };

  revalidatePath('/account');
  return { success: true };
}

export async function customerLogoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
