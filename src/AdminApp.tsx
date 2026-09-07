import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft, CheckCircle, ClipboardText, Cube, Gear,
  List, MagnifyingGlass, Package, PencilSimple, Plus, ShieldCheck,
  SquaresFour, Stack, Trash, TrendUp, X,
} from '@phosphor-icons/react'
import { products as publicProducts } from './data/catalog'
import { supabase, isSupabaseConfigured } from './lib/supabase/client'
import { AdminTopbar } from './admin/components/AdminTopbar'
import { AdminSidebar, type NavGroup } from './admin/components/AdminSidebar'
import { createProduct, deleteProduct, listProducts, listSeries, restoreProduct, updateProduct } from './lib/actions/catalog-actions'
import { getAdminInquiries } from './lib/actions/admin-actions'
import { getAdminDashboardCounts } from './lib/actions/dashboard-actions'
import { requestMagicLink } from './lib/actions/auth-actions'
import { adminProductFormSchema, type AdminProductFormValues, type InquiryAdminStatus } from './lib/validation/admin-catalog'
import { ADMIN_ROUTES, adminRouteFromPath, type AdminRouteId } from './admin/routes'
import { TaxonomyPage } from './admin/pages/TaxonomyPage'
import { CatalogResourcePage } from './admin/pages/CatalogResourcePage'
import { SeoPage } from './admin/pages/SeoPage'
import { InquiriesPage } from './admin/pages/InquiriesPage'
import { useSEO } from './lib/seo/useSEO'

const faNumber = (value: number | string) => new Intl.NumberFormat('fa-IR').format(Number(value))

type AuthState = 'loading' | 'guest' | 'admin'

type AdminProfile = { fullName: string; role: string }
type SeriesOption = { id: string; name: string }
type AdminProduct = {
  id: string
  name: string
  slug: string
  sku: string
  seriesId: string
  seriesName: string
  description: string
  image: string
  sizesCount: number
  isActive: boolean
  isPublished: boolean
  updatedAt: string
}
type AdminInquiry = {
  id: string
  number: string
  customer: string
  company: string
  city: string
  itemsCount: number
  status: InquiryAdminStatus
  submittedAt: string
}

const demoProducts: AdminProduct[] = publicProducts.map((product, index) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  sku: `KR-${String(index + 101).padStart(4, '0')}`,
  seriesId: `demo-${product.series}`,
  seriesName: product.series,
  description: `پرسلان معماری سری ${product.series}`,
  image: product.image,
  sizesCount: product.sizes.length,
  isActive: true,
  isPublished: index !== 5,
  updatedAt: index < 2 ? 'امروز، ۱۰:۴۵' : '۲ روز پیش',
}))
const demoSeries: SeriesOption[] = Array.from(new Set(publicProducts.map((item) => item.series))).map((name) => ({ id: `demo-${name}`, name }))
const demoInquiries: AdminInquiry[] = [
  { id: 'demo-8216', number: '۸۲۱۶', customer: 'آرمان رضایی', company: 'استودیو بُن', city: 'تهران', itemsCount: 4, status: 'submitted', submittedAt: 'امروز، ۱۰:۲۸' },
  { id: 'demo-8215', number: '۸۲۱۵', customer: 'سارا توسلی', company: 'معماران رواق', city: 'شیراز', itemsCount: 2, status: 'in_review', submittedAt: 'امروز، ۰۹:۱۲' },
  { id: 'demo-8214', number: '۸۲۱۴', customer: 'پویان منصوری', company: 'ساختمان آرتا', city: 'اصفهان', itemsCount: 6, status: 'quoted', submittedAt: 'دیروز، ۱۶:۴۰' },
  { id: 'demo-8213', number: '۸۲۱۳', customer: 'مهسا نیک‌فر', company: '—', city: 'رشت', itemsCount: 1, status: 'closed', submittedAt: 'دیروز، ۱۳:۰۵' },
]

const statusMap: Record<InquiryAdminStatus, { label: string; className: string }> = {
  submitted: { label: 'جدید', className: 'new' },
  in_review: { label: 'در حال بررسی', className: 'review' },
  quoted: { label: 'پاسخ داده‌شده', className: 'quoted' },
  closed: { label: 'بسته‌شده', className: 'closed' },
  cancelled: { label: 'لغوشده', className: 'cancelled' },
}

function AdminBrand() {
  return <button className="admin-brand" onClick={() => { window.location.href = '/' }}><span><i /><i /><i /><i /></span><div><b>کارا</b><small>پنل مدیریت</small></div></button>
}

function AdminLogin({ onAuthenticated }: { onAuthenticated: (profile: AdminProfile) => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('error') && params.get('error') === 'admin_check_failed') {
      return 'خطا در بررسی دسترسی ادمین. جدول admin_profiles ممکن است وجود نداشته باشد یا RLS دسترسی را بلاک کرده. جزئیات در Console مرورگر.'
    }
    if (params.has('unauthorized')) return 'این حساب دسترسی مدیریت فعال ندارد'
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!isSupabaseConfigured || !supabase) {
        console.warn('[admin-login] Supabase not configured; using demo mode')
        if (!email) throw new Error('ایمیل را وارد کنید')
        onAuthenticated({ fullName: 'مدیر نسخه نمایشی', role: 'super_admin' })
        return
      }
      await requestMagicLink({ email, next: '/admin', shouldCreateUser: false })
      setSent(true); setCooldown(60)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'ورود انجام نشد'
      console.error('[admin-login] failed', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return <main className="admin-login-page" dir="rtl">
    <section className="admin-login-visual">
      <img src="/images/hero/hero-architecture.svg" alt="معماری الماس" loading="lazy" decoding="async" width="800" height="600" />
      <div className="login-visual-copy"><span>سامانه مدیریت کاتالوگ</span><h1>جزئیات دقیق،<br />مدیریت یکپارچه.</h1><p>محصولات، مشخصات فنی سایزها و استعلام‌های پروژه را در یک محیط امن مدیریت کنید.</p></div>
      <small>SECURE ADMIN CONSOLE · ALMASCERAM</small>
    </section>
    <section className="admin-login-panel">
      <div className="login-panel-head"><AdminBrand /><button onClick={() => { window.location.href = '/' }}>بازگشت به سایت <ArrowLeft size={15} /></button></div>
      <form onSubmit={submit}>
        <div className="login-shield"><ShieldCheck size={27} /></div>
        <small>ورود کارکنان مجاز</small><h2>ورود امن بدون رمز عبور.</h2><p>لینک یک‌بارمصرف به ایمیل سازمانی شما ارسال می‌شود.</p>
        {!isSupabaseConfigured && <div className="admin-demo-note"><b>نسخه نمایشی</b><span>یک ایمیل دلخواه وارد کنید.</span></div>}
        {sent && <div className="admin-demo-note"><b>لینک ارسال شد</b><span>ایمیل خود را بررسی کنید.</span></div>}
        <label><span>ایمیل سازمانی</span><input dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@almasceram.ir" autoComplete="email" /></label>
        {error && <div className="admin-form-error">{error}</div>}
        <button className="admin-login-submit" disabled={loading || cooldown > 0}>{loading ? 'در حال ارسال...' : cooldown > 0 ? `ارسال دوباره تا ${cooldown.toLocaleString('fa-IR')} ثانیه` : 'ارسال Magic Link'} <ArrowLeft size={17} /></button>
        <div className="login-security"><ShieldCheck size={15} /> Magic Link، Supabase Auth و RLS از نشست محافظت می‌کنند.</div>
      </form>
    </section>
  </main>
}

function ProductEditor({ product, series, onClose, onSave }: { product: AdminProduct | null; series: SeriesOption[]; onClose: () => void; onSave: (values: AdminProductFormValues) => Promise<void> }) {
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: product ? { name: product.name, slug: product.slug, sku: product.sku, seriesId: product.seriesId, description: product.description, isPublished: product.isPublished } : { name: '', slug: '', sku: '', seriesId: series[0]?.id ?? '', description: '', isPublished: false },
  })
  const submit = async (values: AdminProductFormValues) => {
    setSaving(true); setSaveError('')
    try { await onSave(values); onClose() } catch (caught) { setSaveError(caught instanceof Error ? caught.message : 'ذخیره محصول انجام نشد') } finally { setSaving(false) }
  }

  return <motion.div className="admin-modal-layer" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.form className="admin-product-editor" onSubmit={form.handleSubmit(submit)} onMouseDown={(event) => event.stopPropagation()} initial={{ x: '-30px', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30px', opacity: 0 }}>
      <header><div><small>{product ? 'ویرایش محصول' : 'محصول جدید'}</small><h2>{product?.name ?? 'افزودن به کاتالوگ'}</h2></div><button type="button" onClick={onClose}><X size={21} /></button></header>
      <div className="editor-body">
        <div className="editor-section-title"><span>اطلاعات پایه</span><i>01</i></div>
        <div className="editor-row"><label><span>نام فارسی</span><input {...form.register('name')} placeholder="مثلاً آرنا سند" />{form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}</label><label><span>کد محصول</span><input dir="ltr" {...form.register('sku')} placeholder="KR-0101" />{form.formState.errors.sku && <small>{form.formState.errors.sku.message}</small>}</label></div>
        <label><span>Slug انگلیسی</span><input dir="ltr" {...form.register('slug')} placeholder="arena-sand" />{form.formState.errors.slug && <small>{form.formState.errors.slug.message}</small>}</label>
        <label><span>سری محصول</span><select {...form.register('seriesId')}>{series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{form.formState.errors.seriesId && <small>{form.formState.errors.seriesId.message}</small>}</label>
        <label><span>توضیحات</span><textarea rows={4} {...form.register('description')} placeholder="توضیح کوتاه و دقیق درباره محصول..." /></label>
        <div className="editor-section-title second"><span>وضعیت انتشار</span><i>02</i></div>
        <label className="publish-toggle"><input type="checkbox" {...form.register('isPublished')} /><span><b>نمایش در کاتالوگ عمومی</b><small>محصول فقط در صورت انتشار سری و کالکشن قابل مشاهده است.</small></span><i /></label>
        {saveError && <div className="admin-form-error">{saveError}</div>}
      </div>
      <footer><button type="button" onClick={onClose}>انصراف</button><button type="submit" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره محصول'} <CheckCircle size={17} /></button></footer>
    </motion.form>
  </motion.div>
}

type DashboardCounts = { collections: number; series: number; products: number; sizes: number; inquiries: { submitted: number; inReview: number; quoted: number } }

function DashboardView({ products, inquiries, counts, onNavigate }: { products: AdminProduct[]; inquiries: AdminInquiry[]; counts: DashboardCounts; onNavigate: (view: AdminRouteId) => void }) {
  const stats = [
    { label: 'کالکشن‌ها', value: counts.collections, change: 'ساختار اصلی', icon: Stack },
    { label: 'سری‌ها', value: counts.series, change: 'زیرمجموعه کالکشن', icon: SquaresFour },
    { label: 'محصولات', value: counts.products || products.length, change: `${counts.sizes.toLocaleString('fa-IR')} سایز فنی`, icon: Package },
    { label: 'استعلام جدید', value: counts.inquiries.submitted || inquiries.filter((item) => item.status === 'submitted').length, change: `${counts.inquiries.inReview.toLocaleString('fa-IR')} در بررسی`, icon: ClipboardText },
  ]
  const bars = [42, 61, 48, 72, 57, 84, 68, 91, 76, 88, 73, 96]
  return <>
    <section className="admin-stats">{stats.map(({ label, value, change, icon: Icon }, index) => <article key={label}><div><span>{label}</span><strong>{faNumber(value)}</strong><small className={index === 2 ? '' : 'positive'}>{index !== 2 && <TrendUp size={13} />} {change}</small></div><i><Icon size={24} weight="light" /></i></article>)}</section>
    <section className="admin-dashboard-grid">
      <article className="admin-chart-card"><header><div><small>روند استعلام‌ها</small><h3>عملکرد ۱۲ هفته اخیر</h3></div><span>۱۲ هفته اخیر</span></header><div className="chart-summary"><strong>۱۴۸</strong><span>مجموع استعلام‌ها</span><b><TrendUp size={14} /> ۱۸٫۴٪</b></div><div className="bar-chart">{bars.map((height, index) => <div key={index}><i style={{ height: `${height}%` }} className={index === bars.length - 1 ? 'current' : ''} /><small>{index % 2 === 0 ? faNumber(index + 1) : ''}</small></div>)}</div></article>
      <article className="admin-activity-card"><header><div><small>فعالیت کاتالوگ</small><h3>آخرین تغییرات</h3></div><button onClick={() => onNavigate('products')}>مشاهده همه</button></header><div className="activity-list"><div><img src="/images/products/tile-arena.svg" alt="آرنا" loading="lazy" decoding="async" width="60" height="60" /><p><b>آرنا سند</b><span>مشخصات سایز ۱۲۰×۲۴۰ ویرایش شد</span><small>۱۲ دقیقه پیش</small></p></div><div><img src="/images/products/tile-calacatta.svg" alt="کلکته" loading="lazy" decoding="async" width="60" height="60" /><p><b>کلکته اورو</b><span>محصول در کاتالوگ منتشر شد</span><small>۲ ساعت پیش</small></p></div><div><img src="/images/products/tile-noir.svg" alt="نوآر" loading="lazy" decoding="async" width="60" height="60" /><p><b>نوآر استون</b><span>۳ تصویر فیس جدید افزوده شد</span><small>دیروز</small></p></div></div></article>
    </section>
    <section className="admin-table-card recent"><header><div><small>پیگیری فروش</small><h3>آخرین استعلام‌ها</h3></div><button onClick={() => onNavigate('inquiries')}>همه استعلام‌ها <ArrowLeft size={15} /></button></header><InquiryTable inquiries={inquiries.slice(0, 4)} compact onStatusChange={() => undefined} /></section>
  </>
}

function InquiryTable({ inquiries, compact = false, onStatusChange }: { inquiries: AdminInquiry[]; compact?: boolean; onStatusChange: (id: string, status: InquiryAdminStatus) => void }) {
  return <div className="admin-table-wrap"><table className="admin-data-table inquiries-table"><thead><tr><th>کد</th><th>مشتری / شرکت</th><th>شهر</th><th>اقلام</th><th>زمان ثبت</th><th>وضعیت</th></tr></thead><tbody>{inquiries.map((item) => <tr key={item.id}><td><b className="inquiry-code">#{item.number}</b></td><td><div className="customer-cell"><span>{item.customer.slice(0, 1)}</span><p><b>{item.customer}</b><small>{item.company}</small></p></div></td><td>{item.city}</td><td>{faNumber(item.itemsCount)} محصول</td><td>{item.submittedAt}</td><td>{compact ? <span className={`status-pill ${statusMap[item.status].className}`}>{statusMap[item.status].label}</span> : <select className={`status-select ${statusMap[item.status].className}`} value={item.status} onChange={(event) => onStatusChange(item.id, event.target.value as InquiryAdminStatus)}>{Object.entries(statusMap).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select>}</td></tr>)}</tbody></table></div>
}

export default function AdminApp() {
  useSEO({
    title: 'پنل مدیریت',
    description: 'پنل مدیریت محتوای ALMASCERAM — مدیریت کاتالوگ، استعلام‌ها و SEO.',
    noindex: true,
    canonicalPath: '/admin',
  })
  const [auth, setAuth] = useState<AuthState>(isSupabaseConfigured ? 'loading' : 'guest')
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [view, setView] = useState<AdminRouteId>(() => adminRouteFromPath(window.location.pathname))
  const [mobileNav, setMobileNav] = useState(false)
  const [products, setProducts] = useState<AdminProduct[]>(demoProducts)
  const [series, setSeries] = useState<SeriesOption[]>(demoSeries)
  const [inquiries, setInquiries] = useState<AdminInquiry[]>(demoInquiries)
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<'new' | AdminProduct | null>(null)
  const [toast, setToast] = useState('')
  const [dataError, setDataError] = useState('')
  const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({ collections: 3, series: 6, products: demoProducts.length, sizes: demoProducts.reduce((sum, item) => sum + item.sizesCount, 0), inquiries: { submitted: 3, inReview: 4, quoted: 12 } })

  const navigate = useCallback((next: AdminRouteId) => {
    setView(next)
    window.history.pushState({}, '', ADMIN_ROUTES[next].path)
    setMobileNav(false)
  }, [])

  useEffect(() => {
    const onPopState = () => setView(adminRouteFromPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setDataError('')
    try {
      const [productData, seriesData, inquiryData, counts] = await Promise.all([listProducts(), listSeries(), getAdminInquiries(), getAdminDashboardCounts()])
      const dbSeries = (seriesData as unknown as Array<{ id: string; name: string }>).map((item) => ({ id: item.id, name: item.name }))
      const seriesNames = new Map(dbSeries.map((item) => [item.id, item.name]))
      const dbProducts = (productData as unknown as Array<{ id: string; name: string; slug: string; sku: string; series_id: string; description: string | null; is_active: boolean; is_published: boolean; updated_at: string }>).map((item, index) => ({ id: item.id, name: item.name, slug: item.slug, sku: item.sku, seriesId: item.series_id, seriesName: seriesNames.get(item.series_id) ?? 'بدون سری', description: item.description ?? '', image: publicProducts[index % publicProducts.length].image, sizesCount: 0, isActive: item.is_active, isPublished: item.is_published, updatedAt: new Date(item.updated_at).toLocaleDateString('fa-IR') }))
      const dbInquiries = (inquiryData as unknown as Array<{ id: string; inquiry_number: number; status: InquiryAdminStatus; project_city: string | null; company_name: string | null; submitted_at: string; customer_name: string | null; inquiry_items: Array<{ count: number }> }>).map((item) => ({ id: item.id, number: faNumber(item.inquiry_number), customer: item.customer_name ?? 'مشتری', company: item.company_name ?? '—', city: item.project_city ?? '—', itemsCount: item.inquiry_items[0]?.count ?? 0, status: item.status, submittedAt: new Date(item.submitted_at).toLocaleString('fa-IR') }))
      setSeries(dbSeries); setProducts(dbProducts); setInquiries(dbInquiries); setDashboardCounts(counts)
    } catch (caught) { setDataError(caught instanceof Error ? caught.message : 'دریافت داده‌های پنل ناموفق بود') }
  }, [])

  useEffect(() => {
    const client = supabase
    if (!isSupabaseConfigured || !client) return
    let active = true
    const checkSession = async () => {
      let { data: { session } } = await client.auth.getSession()
      const code = new URLSearchParams(window.location.search).get('code')
      if (!session && code) {
        const { data, error } = await client.auth.exchangeCodeForSession(code)
        if (!error) {
          session = data.session
          window.history.replaceState({}, '', '/admin')
        }
      }
      if (!session) {
        if (active) {
          if (window.location.pathname !== '/admin/login') window.history.replaceState({}, '', `/admin/login${window.location.search}`)
          setAuth('guest')
        }
        return
      }
      const { data: admin, error: adminError } = await client.from('admin_profiles').select('full_name,role,is_active').eq('user_id', session.user.id).eq('is_active', true).maybeSingle()
      if (adminError) {
        console.error('[admin] admin_profiles query failed', { code: (adminError as { code?: string }).code, message: adminError.message, details: (adminError as { details?: string }).details })
        if (active) { window.history.replaceState({}, '', '/admin/login?error=admin_check_failed'); setAuth('guest') }
        return
      }
      if (!admin) {
        console.warn('[admin] authenticated user has no admin_profiles row', { userId: session.user.id, email: session.user.email })
        if (active) { window.history.replaceState({}, '', '/admin/login?unauthorized=1'); setAuth('guest') }
        return
      }
      if (active) {
        if (window.location.pathname === '/admin/login') window.history.replaceState({}, '', '/admin')
        setProfile({ fullName: admin.full_name, role: admin.role }); setAuth('admin'); await refreshData()
      }
    }
    void checkSession()

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return
      console.info('[admin] onAuthStateChange', event, { hasSession: Boolean(session) })
      if (event === 'SIGNED_OUT' || !session) {
        setAuth('guest')
        setProfile(null)
        if (window.location.pathname !== '/admin/login') {
          window.history.replaceState({}, '', '/admin/login')
        }
        return
      }
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        void checkSession()
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const filteredProducts = useMemo(() => products.filter((item) => `${item.name} ${item.sku} ${item.seriesName}`.toLowerCase().includes(query.trim().toLowerCase())), [products, query])
  const saveProduct = useCallback(async (values: AdminProductFormValues) => {
    const payload = { seriesId: values.seriesId, name: values.name, slug: values.slug, sku: values.sku, description: values.description || null, isPublished: values.isPublished }
    if (isSupabaseConfigured) {
      if (editor && editor !== 'new') await updateProduct(editor.id, payload)
      else await createProduct(payload)
      await refreshData()
    } else {
      const seriesName = series.find((item) => item.id === values.seriesId)?.name ?? 'بدون سری'
      if (editor && editor !== 'new') setProducts((rows) => rows.map((item) => item.id === editor.id ? { ...item, ...values, seriesName, updatedAt: 'همین حالا' } : item))
      else setProducts((rows) => [{ id: `demo-${Date.now()}`, name: values.name, slug: values.slug, sku: values.sku, seriesId: values.seriesId, seriesName, description: values.description ?? '', image: '/images/products/tile-arena.svg', sizesCount: 0, isActive: true, isPublished: values.isPublished, updatedAt: 'همین حالا' }, ...rows])
    }
    setToast(editor === 'new' ? 'محصول جدید ایجاد شد' : 'تغییرات محصول ذخیره شد')
  }, [editor, series, refreshData])
  const removeProduct = useCallback(async (product: AdminProduct) => {
    if (!window.confirm(`محصول «${product.name}» غیرفعال شود؟`)) return
    try { if (isSupabaseConfigured) { await deleteProduct(product.id); await refreshData() } else setProducts((rows) => rows.map((item) => item.id === product.id ? { ...item, isActive: false } : item)); setToast('حذف نرم انجام شد') } catch (caught) { setDataError(caught instanceof Error ? caught.message : 'حذف انجام نشد') }
  }, [refreshData])
  const reactivateProduct = useCallback(async (product: AdminProduct) => {
    try { if (isSupabaseConfigured) { await restoreProduct(product.id); await refreshData() } else setProducts((rows) => rows.map((item) => item.id === product.id ? { ...item, isActive: true } : item)); setToast('محصول بازیابی شد') } catch (caught) { setDataError(caught instanceof Error ? caught.message : 'بازیابی انجام نشد') }
  }, [refreshData])
  const logout = useCallback(async () => { if (supabase) await supabase.auth.signOut(); setAuth('guest'); setProfile(null) }, [])

  const navGroups: NavGroup[] = useMemo(() => [
    { label: 'اصلی', items: [{ id: 'dashboard', label: 'نمای کلی', icon: SquaresFour }, { id: 'inquiries', label: 'استعلام‌ها', icon: ClipboardText, badge: inquiries.filter((item) => item.status === 'submitted').length }] },
    { label: 'طبقه‌بندی', items: [{ id: 'taxonomy-surface', label: 'سطوح', icon: Stack }, { id: 'taxonomy-finishes', label: 'پرداخت‌ها', icon: Stack }, { id: 'taxonomy-spaces', label: 'فضاها', icon: Stack }] },
    { label: 'کاتالوگ', items: [{ id: 'collections', label: 'کالکشن‌ها', icon: Stack }, { id: 'series', label: 'سری‌ها', icon: SquaresFour }, { id: 'products', label: 'محصولات', icon: Cube }, { id: 'sizes', label: 'سایزها و فایل‌ها', icon: Package }] },
    { label: 'SEO', items: [{ id: 'seo-collection', label: 'SEO کالکشن', icon: Gear }, { id: 'seo-series', label: 'SEO سری', icon: Gear }, { id: 'seo-product', label: 'SEO محصول', icon: Gear }] },
    { label: 'سیستم', items: [{ id: 'settings', label: 'تنظیمات و امنیت', icon: ShieldCheck }] },
  ], [inquiries])

  if (auth === 'loading') return <div className="admin-loading" dir="rtl"><span className="admin-spinner" /><p>در حال اعتبارسنجی نشست امن...</p></div>
  if (auth === 'guest') return <AdminLogin onAuthenticated={(nextProfile) => { window.history.replaceState({}, '', '/admin'); setProfile(nextProfile); setAuth('admin'); if (isSupabaseConfigured) void refreshData() }} />

  const title = ADMIN_ROUTES[view]

  return <div className="admin-shell" dir="rtl">
    <AdminSidebar activeView={view} groups={navGroups} profile={profile} mobileOpen={mobileNav} onNavigate={navigate} onCloseMobile={() => setMobileNav(false)} onSignOut={() => void logout()} />
    <main className="admin-main">
      <AdminTopbar titleEyebrow={title.eyebrow} title={title.title} onOpenSidebar={() => setMobileNav(true)} />
      <div className="admin-content">{dataError && <div className="admin-data-error"><span>{dataError}</span><button onClick={() => setDataError('')}><X size={16} /></button></div>}
        {view === 'dashboard' && <DashboardView products={products} inquiries={inquiries} counts={dashboardCounts} onNavigate={navigate} />}
        {view === 'taxonomy-surface' && <TaxonomyPage kind="surface" isSuperAdmin={profile?.role === 'super_admin'} />}
        {view === 'taxonomy-finishes' && <TaxonomyPage kind="finishes" isSuperAdmin={profile?.role === 'super_admin'} />}
        {view === 'taxonomy-spaces' && <TaxonomyPage kind="spaces" isSuperAdmin={profile?.role === 'super_admin'} />}
        {view === 'collections' && <CatalogResourcePage resource="collections" isSuperAdmin={profile?.role === 'super_admin'} />}
        {view === 'series' && <CatalogResourcePage resource="series" isSuperAdmin={profile?.role === 'super_admin'} />}
        {view === 'sizes' && <CatalogResourcePage resource="sizes" isSuperAdmin={profile?.role === 'super_admin'} />}
        {view === 'seo-collection' && <SeoPage entity="collection" />}
        {view === 'seo-series' && <SeoPage entity="series" />}
        {view === 'seo-product' && <SeoPage entity="product" />}
        {view === 'products' && <section className="admin-table-card products-card"><header><div><small>همه محصولات</small><h3>{faNumber(filteredProducts.length)} محصول ثبت‌شده</h3></div><div className="table-tools"><label><MagnifyingGlass size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام، سری یا کد محصول..." /></label><button onClick={() => setEditor('new')}><Plus size={17} /> محصول جدید</button></div></header><div className="admin-table-wrap"><table className="admin-data-table products-table"><thead><tr><th>محصول</th><th>کد</th><th>سری</th><th>سایزها</th><th>وضعیت</th><th>آخرین تغییر</th><th /></tr></thead><tbody>{filteredProducts.map((item) => <tr key={item.id}>                <td><div className="admin-product-cell"><img src={item.image} alt={item.name} loading="lazy" decoding="async" width="40" height="40" /><p><b>{item.name}</b><small dir="ltr">/{item.slug}</small></p></div></td><td><code>{item.sku}</code></td><td>{item.seriesName}</td><td>{faNumber(item.sizesCount)} سایز</td><td><span className={`publish-status ${item.isActive && item.isPublished ? 'published' : 'draft'}`}><i />{!item.isActive ? 'غیرفعال' : item.isPublished ? 'منتشرشده' : 'پیش‌نویس'}</span></td><td>{item.updatedAt}</td><td><div className="row-actions"><button onClick={() => setEditor(item)} aria-label={`ویرایش ${item.name}`}><PencilSimple size={17} /></button>{item.isActive ? <button onClick={() => void removeProduct(item)} aria-label={`حذف نرم ${item.name}`}><Trash size={17} /></button> : <button onClick={() => void reactivateProduct(item)} aria-label={`بازیابی ${item.name}`}>↻</button>}</div></td></tr>)}</tbody></table></div></section>}
        {view === 'inquiries' && <InquiriesPage />}
        {view === 'settings' && <section className="settings-grid"><article><header><i><ShieldCheck size={25} /></i><div><small>کنترل دسترسی</small><h3>Security by Design</h3></div></header><ul><li><CheckCircle size={17} /> RLS روی تمام جداول فعال است</li><li><CheckCircle size={17} /> Service Role در مرورگر وجود ندارد</li><li><CheckCircle size={17} /> نقش فعال: {profile?.role}</li><li><CheckCircle size={17} /> Audit Log فقط خواندنی برای ادمین</li></ul></article><article><header><i><Stack size={25} /></i><div><small>وضعیت زیرساخت</small><h3>Supabase Connection</h3></div></header><div className="system-status"><span><i className={isSupabaseConfigured ? 'online' : 'demo'} /> پایگاه داده</span><b>{isSupabaseConfigured ? 'متصل' : 'حالت نمایشی'}</b><span><i className={isSupabaseConfigured ? 'online' : 'demo'} /> احراز هویت</span><b>{isSupabaseConfigured ? 'فعال' : 'شبیه‌سازی رابط'}</b><span><i className="online" /> Build تولید</span><b>سالم</b></div></article></section>}
      </div>
    </main>
    <AnimatePresence>{editor && <ProductEditor key={editor === 'new' ? 'new' : editor.id} product={editor === 'new' ? null : editor} series={series} onClose={() => setEditor(null)} onSave={saveProduct} />}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="admin-toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 15, opacity: 0 }}><CheckCircle size={19} /> {toast}</motion.div>}</AnimatePresence>
  </div>
}
