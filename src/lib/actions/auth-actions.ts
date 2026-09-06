import { z } from 'zod'
import { supabase } from '../supabase/client'

const magicLinkSchema = z.object({
  email: z.email('ایمیل معتبر وارد کنید'),
  next: z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_-]*$/, 'مسیر بازگشت معتبر نیست'),
  shouldCreateUser: z.boolean(),
})

function client() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

export async function requestMagicLink(input: z.input<typeof magicLinkSchema>) {
  const value = magicLinkSchema.parse(input)
  const redirect = new URL('/auth/callback', window.location.origin)
  redirect.searchParams.set('next', value.next)
  console.info('[auth] requestMagicLink', { email: value.email, next: value.next, shouldCreateUser: value.shouldCreateUser, redirectTo: redirect.toString() })
  const { data, error } = await client().auth.signInWithOtp({
    email: value.email,
    options: { shouldCreateUser: value.shouldCreateUser, emailRedirectTo: redirect.toString() },
  })
  if (error) {
    console.error('[auth] signInWithOtp failed', { code: (error as { code?: string }).code, status: (error as { status?: number }).status, message: error.message })
    if (error.message.toLowerCase().includes('rate limit')) {
      throw new Error('تعداد درخواست‌ها زیاد است؛ چند دقیقه صبر کنید.')
    }
    if (error.message.toLowerCase().includes('email')) {
      throw new Error('آدرس ایمیل معتبر نیست یا توسط Supabase رد شد.')
    }
    throw new Error(`ارسال Magic Link انجام نشد: ${error.message}`)
  }
  console.info('[auth] signInWithOtp ok', { hasData: Boolean(data) })
  return { email: value.email, cooldownSeconds: 60 }
}

export async function exchangeMagicLinkSession(code?: string | null) {
  const auth = client().auth
  if (code) {
    const existing = await auth.getSession()
    if (!existing.data.session) {
      const { error } = await auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[auth] exchangeCodeForSession failed', { code: (error as { code?: string }).code, message: error.message })
        throw new Error(`Magic Link نامعتبر یا منقضی شده است: ${error.message}`)
      }
    }
  }
  const { data: { session }, error } = await auth.getSession()
  if (error || !session) {
    console.error('[auth] getSession failed', { error: error?.message })
    throw new Error('نشست احرازشده ایجاد نشد؛ دوباره وارد شوید.')
  }
  return session
}

export async function getActiveAdminProfile(userId: string) {
  const id = z.uuid().parse(userId)
  const { data, error } = await client().from('admin_profiles').select('full_name,role,is_active').eq('user_id', id).eq('is_active', true).maybeSingle()
  if (error) throw new Error('بررسی دسترسی مدیریت انجام نشد')
  return data
}
