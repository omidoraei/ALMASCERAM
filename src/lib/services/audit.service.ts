// =============================================================================
// Service Layer — Audit Logging (غیرقابل‌تغییر)
// لایه: 8.2 — ثبت رخداد امنیتی/عملیاتی. این سرویس هرگز نباید جریان اصلی
// را متوقف کند (Fail-Open برای لاگینگ، نه برای تراکنش اصلی).
// =============================================================================
import type { AuditLogLevel } from '@/lib/types/database.types';

interface AuditLogInput {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  level?: AuditLogLevel;
  metadata?: Record<string, unknown>;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // در محیط دمو/بدون پیکربندی، فقط در کنسول ثبت می‌شود
      console.info('[audit]', input.action, input.entityType, input.entityId ?? '');
      return;
    }
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: input.actorId ?? null,
      actor_role: input.actorRole ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      level: input.level ?? 'info',
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    // لاگ‌گیری هرگز نباید جریان اصلی کاربر را مختل کند
    console.error('audit-log-failed', err);
  }
}
