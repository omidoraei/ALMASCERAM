'use server';

// =============================================================================
// Server Actions — Products CRUD
// لایه: 8.2
// =============================================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { productSchema, productUpdateSchema } from '@/lib/validations/product.schema';
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

export async function createProductAction(formData: unknown): Promise<ActionResult> {
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز — فقط ادمین' };

  const { data, error } = await supabase
    .from('products')
    .insert({ ...parsed.data, created_by: user!.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'product.create', entityType: 'product', entityId: data.id });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true, data };
}

export async function updateProductAction(formData: unknown): Promise<ActionResult> {
  const parsed = productUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'داده‌های ورودی نامعتبر', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { id, ...rest } = parsed.data;
  const { data, error } = await supabase.from('products').update(rest).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'product.update', entityType: 'product', entityId: id });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true, data };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return { success: false, error: 'دسترسی غیرمجاز' };

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAudit({ actorId: user!.id, action: 'product.delete', entityType: 'product', entityId: id, level: 'warning' });

  revalidatePath('/admin/products');
  return { success: true };
}

export async function incrementProductViewCountAction(productId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc('increment', { row_id: productId }).then(
      () => {},
      () => {}
    );
  } catch {
    // غیربحران — شمارش بازدید حیاتی نیست
  }
}
