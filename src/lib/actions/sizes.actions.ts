'use server';

// =============================================================================
// Server Actions — Sizes & Technical Data CRUD
// لایه: 8.2
// =============================================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sizeSchema, sizeUpdateSchema, sizeTechnicalDataSchema } from '@/lib/validations/size.schema';
import { logAudit } from '@/lib/services/audit.service';
import type { ActionResult } from './collections.actions';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle();
  return { supabase, user, isAdmin: Boolean(adminProfile?.is_active) };
}

export async function createSizeAction(formData: unknown): Promise<ActionResult> {
  const parsed = sizeSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز — فقط ادمین' };

  const { data, error } = await supabase.from('sizes').insert(parsed.data).select().single();
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'size.create', entityType: 'size', entityId: data.id });

  revalidatePath('/admin/sizes');
  revalidatePath('/products');
  return { success: true, data };
}

export async function updateSizeAction(formData: unknown): Promise<ActionResult> {
  const parsed = sizeUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { id, ...rest } = parsed.data;
  const { data, error } = await supabase.from('sizes').update(rest).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'size.update', entityType: 'size', entityId: id });

  revalidatePath('/admin/sizes');
  return { success: true, data };
}

export async function deleteSizeAction(id: string): Promise<ActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { error } = await supabase.from('sizes').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'size.delete', entityType: 'size', entityId: id, level: 'warning' });

  revalidatePath('/admin/sizes');
  return { success: true };
}

export async function upsertSizeTechnicalDataAction(formData: unknown): Promise<ActionResult> {
  const parsed = sizeTechnicalDataSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { data, error } = await supabase
    .from('size_technical_data')
    .upsert(parsed.data, { onConflict: 'size_id' })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'size_technical_data.upsert', entityType: 'size', entityId: parsed.data.size_id });

  revalidatePath('/admin/sizes');
  return { success: true, data };
}
