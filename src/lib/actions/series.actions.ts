'use server';

// =============================================================================
// Server Actions — Series CRUD
// لایه: 8.2
// =============================================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { seriesSchema, seriesUpdateSchema } from '@/lib/validations/series.schema';
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

export async function createSeriesAction(formData: unknown): Promise<ActionResult> {
  const parsed = seriesSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز — فقط ادمین' };

  const { data, error } = await supabase
    .from('series')
    .insert({ ...parsed.data, created_by: user!.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'series.create', entityType: 'series', entityId: data.id });

  revalidatePath('/admin/series');
  revalidatePath('/collections');
  return { success: true, data };
}

export async function updateSeriesAction(formData: unknown): Promise<ActionResult> {
  const parsed = seriesUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { id, ...rest } = parsed.data;
  const { data, error } = await supabase.from('series').update(rest).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'series.update', entityType: 'series', entityId: id });

  revalidatePath('/admin/series');
  revalidatePath('/collections');
  return { success: true, data };
}

export async function deleteSeriesAction(id: string): Promise<ActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { error } = await supabase.from('series').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'series.delete', entityType: 'series', entityId: id, level: 'warning' });

  revalidatePath('/admin/series');
  return { success: true };
}
