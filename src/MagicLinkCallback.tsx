import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle, EnvelopeSimple, WarningCircle } from '@phosphor-icons/react'
import { completeMagicLinkInquiry, hasPendingMagicInquiry } from './lib/actions/inquiry-actions'
import { exchangeMagicLinkSession, getActiveAdminProfile } from './lib/actions/auth-actions'
import { isSupabaseConfigured, supabase } from './lib/supabase/client'
import { useInquiryStore } from './store/inquiry-store'

type CallbackState =
  | { status: 'working'; message: string }
  | { status: 'success'; trackingCode: string }
  | { status: 'error'; message: string }

export default function MagicLinkCallback() {
  const [state, setState] = useState<CallbackState>({ status: 'working', message: 'در حال تأیید لینک و ثبت استعلام...' })

  useEffect(() => {
    let active = true
    const complete = async () => {
      try {
        if (!isSupabaseConfigured) {
          await new Promise((resolve) => window.setTimeout(resolve, 850))
          useInquiryStore.getState().clear()
          if (active) setState({ status: 'success', trackingCode: 'DEMO-۸۲۱۶' })
          return
        }
        const search = new URLSearchParams(window.location.search)
        const code = search.get('code')
        const next = search.get('next')
        const session = await exchangeMagicLinkSession(code)
        window.history.replaceState({}, '', '/auth/callback')
        if (hasPendingMagicInquiry()) {
          const result = await completeMagicLinkInquiry()
          if (active) setState({ status: 'success', trackingCode: result.inquiryId.split('-')[0].toUpperCase() })
          return
        }
        const admin = await getActiveAdminProfile(session.user.id)
        if (next?.startsWith('/admin') && !admin) {
          await supabase?.auth.signOut()
          window.location.replace('/admin?unauthorized=1')
          return
        }
        const destination = admin ? '/admin' : next?.startsWith('/account') ? next : '/account'
        window.location.replace(destination)
      } catch (error) {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'تکمیل ورود انجام نشد' })
      }
    }
    void complete()
    return () => { active = false }
  }, [])

  return <main className="magic-callback" dir="rtl">
    <div className="callback-brand"><span><i /><i /><i /><i /></span><b>کارا</b></div>
    <section>
      {state.status === 'working' && <><div className="callback-icon working"><EnvelopeSimple size={34} /></div><small>MAGIC LINK</small><h1>در حال تکمیل استعلام</h1><p>{state.message}</p><span className="callback-loader" /></>}
      {state.status === 'success' && <><div className="callback-icon success"><CheckCircle size={42} weight="light" /></div><small>ثبت موفق</small><h1>استعلام شما ثبت شد.</h1><p>کارشناس کارا پس از بررسی مشخصات پروژه با شما در ارتباط خواهد بود.</p><label>کد پیگیری <b>{state.trackingCode}</b></label><button onClick={() => { window.location.href = '/' }}>بازگشت به کاتالوگ <ArrowRight size={17} /></button></>}
      {state.status === 'error' && <><div className="callback-icon error"><WarningCircle size={40} weight="light" /></div><small>خطا در ورود</small><h1>لینک تکمیل نشد.</h1><p>{state.message}</p><button onClick={() => { window.location.href = '/' }}>بازگشت و تلاش دوباره <ArrowRight size={17} /></button></>}
    </section>
    <footer>احراز هویت امن با Magic Link · بدون رمز عبور</footer>
  </main>
}
