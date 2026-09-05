import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle, EnvelopeSimple, WarningCircle } from '@phosphor-icons/react'
import { completeMagicLinkInquiry, hasPendingMagicInquiry } from './lib/actions/inquiry-actions'
import { exchangeMagicLinkSession, getActiveAdminProfile } from './lib/actions/auth-actions'
import { isSupabaseConfigured, supabase } from './lib/supabase/client'
import { useInquiryStore } from './store/inquiry-store'
import { isSameOriginPath, safeRedirectPath } from './lib/utils/safe-redirect'
import { useSEO } from './lib/seo/useSEO'

type CallbackState =
  | { status: 'working'; message: string }
  | { status: 'success'; trackingCode: string }
  | { status: 'error'; message: string }

export default function MagicLinkCallback() {
  useSEO({
    title: 'تأیید لینک ورود',
    description: 'در حال تأیید Magic Link و تکمیل استعلام.',
    noindex: true,
    canonicalPath: '/auth/callback',
  })
  const [state, setState] = useState<CallbackState>({ status: 'working', message: 'در حال تأیید لینک و ثبت استعلام...' })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const complete = async () => {
      try {
        if (!isSupabaseConfigured) {
          await new Promise<void>((resolve) => {
            const id = window.setTimeout(resolve, 850)
            signal.addEventListener('abort', () => window.clearTimeout(id))
          })
          if (signal.aborted) return
          useInquiryStore.getState().clear()
          setState({ status: 'success', trackingCode: 'DEMO-۸۲۱۶' })
          return
        }
        const search = new URLSearchParams(window.location.search)
        const code = search.get('code')
        // Validate the `next` parameter to prevent open-redirect attacks.
        const rawNext = search.get('next')
        const next = isSameOriginPath(rawNext ?? '') ? rawNext : null
        const session = await exchangeMagicLinkSession(code)
        if (signal.aborted) return
        window.history.replaceState({}, '', '/auth/callback')
        if (hasPendingMagicInquiry()) {
          const result = await completeMagicLinkInquiry()
          if (signal.aborted) return
          setState({ status: 'success', trackingCode: result.inquiryId.split('-')[0].toUpperCase() })
          return
        }
        const admin = await getActiveAdminProfile(session.user.id)
        if (signal.aborted) return
        if (next?.startsWith('/admin') && !admin) {
          await supabase?.auth.signOut()
          window.location.replace('/admin?unauthorized=1')
          return
        }
        // Only allow redirects to `/account/*` paths from the next param.
        const destination = admin
          ? '/admin'
          : next?.startsWith('/account')
            ? safeRedirectPath(next, '/account')
            : '/account'
        window.location.replace(destination)
      } catch (error) {
        if (!signal.aborted) {
          setState({ status: 'error', message: error instanceof Error ? error.message : 'تکمیل ورود انجام نشد' })
        }
      }
    }
    void complete()
    return () => controller.abort()
  }, [])

  return <main className="magic-callback" dir="rtl">
    <div className="callback-brand"><span><i /><i /><i /><i /></span><b>الماس</b></div>
    <section>
      {state.status === 'working' && <><div className="callback-icon working"><EnvelopeSimple size={34} /></div><small>MAGIC LINK</small><h1>در حال تکمیل استعلام</h1><p>{state.message}</p><span className="callback-loader" /></>}
      {state.status === 'success' && <><div className="callback-icon success"><CheckCircle size={42} weight="light" /></div><small>ثبت موفق</small><h1>استعلام شما ثبت شد.</h1><p>کارشناس الماس پس از بررسی مشخصات پروژه با شما در ارتباط خواهد بود.</p><label>کد پیگیری <b>{state.trackingCode}</b></label><button onClick={() => { window.location.href = '/' }}>بازگشت به کاتالوگ <ArrowRight size={17} /></button></>}
      {state.status === 'error' && <><div className="callback-icon error"><WarningCircle size={40} weight="light" /></div><small>خطا در ورود</small><h1>لینک تکمیل نشد.</h1><p>{state.message}</p><button onClick={() => { window.location.href = '/' }}>بازگشت و تلاش دوباره <ArrowRight size={17} /></button></>}
    </section>
    <footer>احراز هویت امن با Magic Link · بدون رمز عبور</footer>
  </main>
}
