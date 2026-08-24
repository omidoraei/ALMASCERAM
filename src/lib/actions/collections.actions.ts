'use server';

// =============================================================================
// Server Actions — Collections CRUD
// لایه: 8.2 (Server Actions Layer) — امنیت: احرازهویت + نقش در لایه اپلیکیشن
// توسط RLS (is_admin()) در لایه دیتابیس نیز دوباره اعمال می‌شود (Defense in Depth).
// =============================================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { collectionSchema, collectionUpdateSchema } from '@/lib/validations/collection.schema';
import { logAudit } from '@/lib/services/audit.service';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: Boolean(adminProfile?.is_active) };
}

export async function createCollectionAction(formData: unknown): Promise<ActionResult> {
  const parsed = collectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز — فقط ادمین' };

  const { data, error } = await supabase
    .from('collections')
    .insert({ ...parsed.data, created_by: user!.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit({
    actorId: user!.id,
    action: 'collection.create',
    entityType: 'collection',
    entityId: data.id,
    metadata: { slug: data.slug },
  });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true, data };
}

export async function updateCollectionAction(formData: unknown): Promise<ActionResult> {
  const parsed = collectionUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز — فقط ادمین' };

  const { id, ...rest } = parsed.data;
  const { data, error } = await supabase.from('collections').update(rest).eq('id', id).select().single();

  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'collection.update', entityType: 'collection', entityId: id });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true, data };
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز — فقط ادمین' };

  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'collection.delete', entityType: 'collection', entityId: id, level: 'warning' });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}

export async function toggleCollectionActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { error } = await supabase.from('collections').update({ is_active: isActive }).eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'collection.toggle_active', entityType: 'collection', entityId: id, metadata: { isActive } });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}
