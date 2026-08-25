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
  const { error } = await client().auth.signInWithOtp({
    email: value.email,
    options: { shouldCreateUser: value.shouldCreateUser, emailRedirectTo: redirect.toString() },
  })
  if (error) throw new Error('ارسال Magic Link انجام نشد؛ کمی بعد دوباره تلاش کنید')
  return { email: value.email, cooldownSeconds: 60 }
}

export async function exchangeMagicLinkSession(code?: string | null) {
  const auth = client().auth
  if (code) {
    const existing = await auth.getSession()
    if (!existing.data.session) {
      const { error } = await auth.exchangeCodeForSession(code)
      if (error) throw new Error('Magic Link نامعتبر یا منقضی شده است')
    }
  }
  const { data: { session }, error } = await auth.getSession()
  if (error || !session) throw new Error('نشست احرازشده ایجاد نشد')
  return session
}

export async function getActiveAdminProfile(userId: string) {
  const id = z.uuid().parse(userId)
  const { data, error } = await client().from('admin_profiles').select('full_name,role,is_active').eq('user_id', id).eq('is_active', true).maybeSingle()
  if (error) throw new Error('بررسی دسترسی مدیریت انجام نشد')
  return data
}
