import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle, EnvelopeSimple, SignOut, UserCircle } from '@phosphor-icons/react'
import { requestMagicLink } from './lib/actions/auth-actions'
import { isSupabaseConfigured, supabase } from './lib/supabase/client'

export default function AccountApp() {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [email, setEmail] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const client = supabase
    if (!client) return
    const load = async () => { const { data } = await client.auth.getSession(); setUserEmail(data.session?.user.email ?? null); setLoading(false) }
    void load()
  }, [])
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('')
    try {
      if (!isSupabaseConfigured) { setMessage('Magic Link نمایشی ارسال شد'); setCooldown(60); return }
      await requestMagicLink({ email, next: '/account', shouldCreateUser: true })
      setMessage('Magic Link ارسال شد؛ ایمیل خود را بررسی کنید.'); setCooldown(60)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'ارسال لینک انجام نشد') }
  }
  const logout = async () => { if (supabase) await supabase.auth.signOut(); setUserEmail(null) }

  if (loading) return <div className="account-loading">در حال بررسی نشست...</div>
  return <main className="account-page" dir="rtl"><header><button onClick={() => { window.location.href = '/' }}><ArrowRight size={18} /> بازگشت به کاتالوگ</button><b>کارا</b></header><section>{userEmail ? <div className="account-card"><div className="account-icon success"><UserCircle size={42} /></div><small>حساب مشتری</small><h1>خوش آمدید</h1><p dir="ltr">{userEmail}</p><div className="account-security"><CheckCircle size={17} /> نشست شما با Magic Link و Supabase Auth محافظت می‌شود.</div><button className="account-primary" onClick={() => void logout()}><SignOut size={17} /> خروج از حساب</button></div> : <form className="account-card" onSubmit={submit}><div className="account-icon"><EnvelopeSimple size={34} /></div><small>ورود بدون رمز</small><h1>ورود به حساب</h1><p>Magic Link یک‌بارمصرف به ایمیل شما ارسال می‌شود.</p><label><span>ایمیل</span><input dir="ltr" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>{message && <div className="account-message">{message}</div>}{error && <div className="module-error">{error}</div>}<button className="account-primary" disabled={cooldown > 0}>{cooldown > 0 ? `ارسال دوباره تا ${cooldown.toLocaleString('fa-IR')} ثانیه` : 'ارسال Magic Link'}</button></form>}</section></main>
}
