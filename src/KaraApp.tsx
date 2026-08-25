import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import {
  ArrowLeft, ArrowRight, ArrowUpLeft, Buildings, CaretDown, Check, CheckCircle,
  ClipboardText, Cube, EnvelopeSimple, List, MagnifyingGlass, Minus, Plus, Ruler,
  ShieldCheck, SlidersHorizontal, Sparkle, Trash, User, X,
} from '@phosphor-icons/react'
import { products, categories } from './data/catalog'
import { useInquiryStore } from './store/inquiry-store'
import { inquirySchema, otpSchema, type InquiryFormValues, type OtpFormValues } from './lib/validation/inquiry'
import { requestInquiryEmailOtp, verifyOtpAndCreateInquiry } from './lib/actions/inquiry-actions'
import { isSupabaseConfigured } from './lib/supabase/client'
import type { Product, TileSize } from './types/catalog'

const toFa = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

function Brand() {
  return (
    <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="صفحه نخست کارا">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="brand-copy"><b>کارا</b><small>KARA CERAM</small></span>
    </button>
  )
}

function Header({ count, onInquiry, onSearch }: { count: number; onInquiry: () => void; onSearch: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const goTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="site-header">
      <div className="header-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          <button onClick={() => goTo('catalog')}>محصولات <CaretDown size={13} /></button>
          <button onClick={() => goTo('collections')}>کالکشن‌ها</button>
          <button onClick={() => goTo('technical')}>راهنمای فنی</button>
          <button onClick={() => goTo('about')}>درباره کارا</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-button" onClick={onSearch} aria-label="جستجو"><MagnifyingGlass size={21} /></button>
          <button className="inquiry-button" onClick={onInquiry}>
            <ClipboardText size={20} /><span>سبد استعلام</span>
            {count > 0 && <b>{toFa(count)}</b>}
          </button>
          <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="نمایش منو">
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav className="mobile-nav" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <button onClick={() => goTo('catalog')}>محصولات</button><button onClick={() => goTo('collections')}>کالکشن‌ها</button>
            <button onClick={() => goTo('technical')}>راهنمای فنی</button><button onClick={() => goTo('about')}>درباره کارا</button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Hero() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> معماری از سطح آغاز می‌شود</div>
          <h1>سطوحی برای<br /><em>ماندگار شدن.</em></h1>
          <p>مجموعه‌ای دقیق از پرسلان‌های معماری؛ طراحی‌شده برای فضاهایی که کیفیت، جزئیات و دوام در آن‌ها تعیین‌کننده است.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>مشاهده محصولات <ArrowLeft size={18} /></button>
            <button className="text-button" onClick={() => document.getElementById('technical')?.scrollIntoView({ behavior: 'smooth' })}>دریافت راهنمای انتخاب <ArrowUpLeft size={18} /></button>
          </div>
        </div>
        <div className="hero-media">
          <img src="/images/hero-architecture.jpg" alt="فضای معماری مدرن پوشیده‌شده با پرسلان روشن" />
          <div className="hero-label"><span>کالکشن زمین</span><b>تراورتن لایت</b><small>۱۲۰ × ۲۴۰ سانتی‌متر</small></div>
          <div className="hero-index">۰۱ <i /> ۰۴</div>
        </div>
      </section>
      <section className="trust-strip" aria-label="ویژگی‌های کلیدی">
        <div><strong>۲۴+</strong><span>سال تجربه در تولید</span></div><div><strong>ISO</strong><span>تولید مطابق استاندارد</span></div>
        <div><strong>۱۸</strong><span>بازار صادراتی فعال</span></div><div><strong><ShieldCheck size={26} /></strong><span>کنترل کیفیت چندمرحله‌ای</span></div>
      </section>
    </main>
  )
}

function ProductCard({ product, onDetails, onAdded }: { product: Product; onDetails: (product: Product) => void; onAdded: (name: string) => void }) {
  const [size, setSize] = useState(product.sizes[0])
  const addItem = useInquiryStore((state) => state.addItem)
  const add = () => { addItem(product, size); onAdded(`${product.name}، سایز ${size.label}`) }

  return (
    <article className="product-card">
      <button className="product-image" onClick={() => onDetails(product)} aria-label={`مشاهده جزئیات ${product.name}`}>
        <img src={product.image} alt={`طرح و بافت محصول ${product.name}`} loading="lazy" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <span className="view-detail">مشاهده جزئیات <ArrowUpLeft size={17} /></span>
      </button>
      <div className="product-info">
        <div className="product-title"><div><small>{product.englishName}</small><h3>{product.name}</h3></div><span className="tone" style={{ backgroundColor: product.tone }} aria-label="نمونه رنگ" /></div>
        <div className="product-meta"><span>{product.category}</span><i /><span>{product.finish}</span><i /><span>پرسلان</span></div>
        <div className="size-picker">
          <label htmlFor={`size-${product.id}`}>انتخاب سایز</label>
          <div className="select-wrap">
            <select id={`size-${product.id}`} value={size.id} onChange={(event) => setSize(product.sizes.find((item) => item.id === event.target.value) ?? product.sizes[0])}>
              {product.sizes.map((item) => <option key={item.id} value={item.id}>{item.label} سانتی‌متر</option>)}
            </select><CaretDown size={14} />
          </div>
        </div>
        <button className="add-button" onClick={add}><Plus size={18} /> افزودن به استعلام</button>
      </div>
    </article>
  )
}

function Catalog({ onDetails, onAdded, initialSearch }: { onDetails: (product: Product) => void; onAdded: (name: string) => void; initialSearch: number }) {
  const [category, setCategory] = useState<(typeof categories)[number]>('همه')
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (initialSearch > 0) {
      document.getElementById('catalog-search')?.focus()
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [initialSearch])

  const filtered = useMemo(() => products.filter((product) => {
    const categoryMatch = category === 'همه' || product.category === category
    const source = `${product.name} ${product.englishName} ${product.series} ${product.finish} ${product.applications.join(' ')}`
    return categoryMatch && source.toLowerCase().includes(query.trim().toLowerCase())
  }), [category, query])
  const visible = showAll ? filtered : filtered.slice(0, 4)

  return (
    <section className="catalog-section" id="catalog">
      <div className="section-heading">
        <div><span>کاتالوگ محصولات</span><h2>سطح مناسب پروژه‌تان را پیدا کنید.</h2></div>
        <p>فیلتر کنید، مشخصات فنی هر سایز را ببینید و محصولات منتخب را برای استعلام تخصصی کنار هم قرار دهید.</p>
      </div>
      <div className="catalog-toolbar">
        <div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="tool-actions">
          <label className="catalog-search"><MagnifyingGlass size={18} /><input id="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی محصول..." /></label>
          <button className={filtersOpen ? 'filter-active' : ''} onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={18} /> فیلتر فنی</button>
        </div>
      </div>
      <AnimatePresence>
        {filtersOpen && <motion.div className="filter-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
          <div><span>نوع پرداخت</span><button onClick={() => setQuery('مات')}>مات</button><button onClick={() => setQuery('پولیش')}>پولیش</button></div>
          <div><span>کاربری پیشنهادی</span><button onClick={() => setQuery('کف')}>کف</button><button onClick={() => setQuery('نما')}>نما</button></div>
          <button className="clear-filter" onClick={() => { setQuery(''); setCategory('همه') }}>پاک کردن فیلترها</button>
        </motion.div>}
      </AnimatePresence>
      {visible.length > 0 ? <motion.div className="product-grid" layout>{visible.map((product) => <ProductCard key={product.id} product={product} onDetails={onDetails} onAdded={onAdded} />)}</motion.div> :
        <div className="empty-search"><MagnifyingGlass size={28} /><h3>محصولی پیدا نشد</h3><p>عبارت جستجو یا فیلتر انتخاب‌شده را تغییر دهید.</p><button onClick={() => { setQuery(''); setCategory('همه') }}>نمایش همه محصولات</button></div>}
      {!showAll && filtered.length > 4 && <button className="show-all" onClick={() => setShowAll(true)}>مشاهده همه {toFa(filtered.length)} محصول <ArrowLeft size={17} /></button>}
    </section>
  )
}

function Collections() {
  return (
    <section className="collections-section" id="collections">
      <div className="collection-copy"><span className="section-kicker">کالکشن‌های منتخب</span><h2>از ایده تا سطح،<br />یک روایت منسجم.</h2><p>هر کالکشن کارا بر پایه یک زبان متریال شکل گرفته تا انتخاب سطوح مختلف پروژه، دقیق و هماهنگ باقی بماند.</p><button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>کاوش در کالکشن زمین <ArrowLeft size={18} /></button></div>
      <div className="collection-visual"><img src="/images/hero-architecture.jpg" alt="کالکشن پرسلان معماری زمین" loading="lazy" /><div><small>۰۱ / ۰۳</small><strong>زمین</strong><span>ZAMIN COLLECTION</span></div></div>
    </section>
  )
}

function Technical() {
  const items = [
    { icon: Ruler, title: 'داده دقیق هر سایز', text: 'ابعاد، ضخامت، وزن بسته و تعداد فیس‌ها برای هر سایز مستقل ثبت می‌شود.' },
    { icon: Cube, title: 'بافت واقعی محصول', text: 'تصاویر باکیفیت فیس‌ها و تنوع شید، تصمیم‌گیری پیش از سفارش نمونه را ساده می‌کند.' },
    { icon: ShieldCheck, title: 'مطابق استاندارد', text: 'جذب آب، مقاومت شکست، سایش و یخ‌زدگی با استانداردهای مرجع تطبیق داده شده‌اند.' },
  ]
  return (
    <section className="technical-section" id="technical">
      <div className="technical-heading"><span>تصمیم مطمئن‌تر</span><h2>جزئیات فنی، نه فقط یک تصویر زیبا.</h2><p>کارا اطلاعات لازم برای طراح، مجری و خریدار را در سطح هر سایز ارائه می‌دهد.</p></div>
      <div className="technical-grid">{items.map(({ icon: Icon, title, text }, index) => <article key={title}><i>{toFa(index + 1).padStart(2, '۰')}</i><Icon size={28} weight="light" /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
  )
}

function ProductModal({ product, onClose, onAdded }: { product: Product; onClose: () => void; onAdded: (name: string) => void }) {
  const [size, setSize] = useState<TileSize>(product.sizes[0])
  const addItem = useInquiryStore((state) => state.addItem)

  return (
    <motion.div className="modal-backdrop" role="presentation" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="product-modal" role="dialog" aria-modal="true" aria-label={`جزئیات ${product.name}`} onMouseDown={(event) => event.stopPropagation()} initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }}>
        <button className="close-modal" onClick={onClose} aria-label="بستن"><X size={22} /></button>
        <div className="modal-image"><img src={product.image} alt={product.name} /><span>{product.badge ?? 'پرسلان معماری'}</span></div>
        <div className="modal-content">
          <div className="modal-breadcrumb">محصولات / {product.collection} / {product.series}</div><small>{product.englishName}</small><h2>{product.name}</h2>
          <p>سطحی با بیان طبیعی و جزئیات کنترل‌شده؛ مناسب پروژه‌هایی که پیوستگی بصری و دوام فنی را هم‌زمان می‌خواهند.</p>
          <div className="modal-tags">{product.applications.map((item) => <span key={item}><Check size={13} /> {item}</span>)}</div>
          <div className="modal-size-title"><b>سایز مورد نظر</b><span>{toFa(product.sizes.length)} گزینه موجود</span></div>
          <div className="modal-sizes">{product.sizes.map((item) => <button key={item.id} className={size.id === item.id ? 'active' : ''} onClick={() => setSize(item)}><strong>{item.label}</strong><small>ضخامت {toFa(item.thicknessMm)} میلی‌متر</small></button>)}</div>
          <div className="technical-table">
            <div><span>جذب آب</span><b>{product.technical.waterAbsorption}</b></div><div><span>مقاومت شکست</span><b>{product.technical.breakingStrength}</b></div>
            <div><span>مقاومت سایشی</span><b>{product.technical.abrasionResistance}</b></div><div><span>تعداد فیس</span><b>{toFa(size.faces)} فیس</b></div>
            <div><span>مقاومت یخ‌زدگی</span><b>{product.technical.frostResistance}</b></div><div><span>تغییرات شید</span><b>{product.technical.shadeVariation}</b></div>
          </div>
          <button className="modal-add" onClick={() => { addItem(product, size); onAdded(`${product.name}، سایز ${size.label}`) }}><Plus size={19} /> افزودن این سایز به استعلام</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className={`form-field ${error ? 'has-error' : ''}`}><span>{label}</span>{children}{error && <small>{error}</small>}</label>
}

function InquiryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, setQuantity, clear } = useInquiryStore()
  const [step, setStep] = useState<'cart' | 'form' | 'otp' | 'success'>('cart')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<InquiryFormValues | null>(null)
  const [submissionError, setSubmissionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const form = useForm<InquiryFormValues>({ resolver: zodResolver(inquirySchema), defaultValues: { customerType: 'business', fullName: '', email: '', phone: '', company: '', projectCity: '', notes: '' } })
  const otpForm = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '' } })
  const customerType = useWatch({ control: form.control, name: 'customerType' })
  const handleClose = () => { if (step === 'success') setStep('cart'); setSubmissionError(''); onClose() }
  const submitProfile = async (values: InquiryFormValues) => {
    setSubmitting(true)
    setSubmissionError('')
    try {
      if (isSupabaseConfigured) await requestInquiryEmailOtp(values)
      setProfile(values)
      setEmail(values.email)
      setStep('otp')
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'ارسال کد تأیید انجام نشد')
    } finally {
      setSubmitting(false)
    }
  }
  const verifyOtp = async ({ otp }: OtpFormValues) => {
    setSubmitting(true)
    setSubmissionError('')
    try {
      if (isSupabaseConfigured) {
        if (!profile) throw new Error('اطلاعات استعلام کامل نیست')
        const result = await verifyOtpAndCreateInquiry({
          email,
          token: otp,
          basket: {
            items: items.map((item) => ({ sizeId: item.size.id, quantity: item.quantity })),
            note: profile.notes,
          },
        })
        setTrackingCode(result.inquiryId.split('-')[0].toUpperCase())
      } else {
        if (otp !== '246810') throw new Error('کد واردشده صحیح نیست؛ از کد نمایشی استفاده کنید')
        clear()
        setTrackingCode('DEMO-۸۲۱۶')
      }
      setStep('success')
      form.reset()
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'ثبت استعلام انجام نشد')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && <motion.div className="drawer-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="drawer-overlay" onClick={handleClose} aria-label="بستن سبد" />
        <motion.aside className="inquiry-drawer" role="dialog" aria-modal="true" aria-label="سبد استعلام" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
          <div className="drawer-header"><div><small>{step === 'cart' ? 'مرحله ۱ از ۳' : step === 'form' ? 'مرحله ۲ از ۳' : step === 'otp' ? 'مرحله ۳ از ۳' : 'ثبت نهایی'}</small><h2>{step === 'success' ? 'استعلام ثبت شد' : 'سبد استعلام قیمت'}</h2></div><button onClick={handleClose} aria-label="بستن"><X size={22} /></button></div>
          <div className="step-line"><i className={step !== 'cart' ? 'done' : 'active'} /><i className={step === 'form' ? 'active' : step === 'otp' || step === 'success' ? 'done' : ''} /><i className={step === 'otp' ? 'active' : step === 'success' ? 'done' : ''} /></div>
          {step === 'cart' && <>
            <div className="drawer-note"><Sparkle size={18} /> قیمت‌ها بر اساس متراژ، محل پروژه و شرایط تحویل توسط کارشناس اعلام می‌شوند.</div>
            <div className="drawer-items">{items.length === 0 ? <div className="empty-cart"><ClipboardText size={38} weight="light" /><h3>سبد شما خالی است</h3><p>محصول و سایز مورد نظر را از کاتالوگ انتخاب کنید.</p><button onClick={handleClose}>بازگشت به محصولات</button></div> : items.map((item) =>
              <div className="drawer-item" key={item.key}><img src={item.image} alt={item.productName} /><div className="drawer-item-info"><small>سری {item.series}</small><b>{item.productName}</b><span>{item.size.label} سانتی‌متر · {toFa(item.size.thicknessMm)} میلی‌متر</span><div className="quantity"><button onClick={() => setQuantity(item.key, item.quantity - 1)}><Minus size={12} /></button><span>{toFa(item.quantity)}</span><button onClick={() => setQuantity(item.key, item.quantity + 1)}><Plus size={12} /></button></div></div><button className="remove-item" onClick={() => removeItem(item.key)} aria-label={`حذف ${item.productName}`}><Trash size={17} /></button></div>
            )}</div>
            {items.length > 0 && <div className="drawer-footer"><div><span>اقلام انتخاب‌شده</span><b>{toFa(items.length)} محصول / سایز</b></div><button className="primary-button" onClick={() => setStep('form')}>تکمیل اطلاعات <ArrowLeft size={18} /></button></div>}
          </>}
          {step === 'form' && <form className="inquiry-form" onSubmit={form.handleSubmit(submitProfile)}>
            <p>برای دریافت پاسخ دقیق، اطلاعات پروژه را کامل کنید.</p>
            <div className="customer-type"><label className={customerType === 'business' ? 'active' : ''}><input type="radio" value="business" {...form.register('customerType')} /><Buildings size={20} /> حقوقی / پروژه‌ای</label><label className={customerType === 'individual' ? 'active' : ''}><input type="radio" value="individual" {...form.register('customerType')} /><User size={20} /> شخصی</label></div>
            <FormField label="نام و نام خانوادگی" error={form.formState.errors.fullName?.message}><input {...form.register('fullName')} placeholder="مثلاً آرمان رضایی" /></FormField>
            <div className="form-row"><FormField label="ایمیل کاری" error={form.formState.errors.email?.message}><input dir="ltr" {...form.register('email')} placeholder="name@company.com" /></FormField><FormField label="شماره موبایل" error={form.formState.errors.phone?.message}><input dir="ltr" {...form.register('phone')} placeholder="09123456789" /></FormField></div>
            <div className="form-row"><FormField label="نام شرکت (اختیاری)" error={form.formState.errors.company?.message}><input {...form.register('company')} /></FormField><FormField label="شهر پروژه" error={form.formState.errors.projectCity?.message}><input {...form.register('projectCity')} placeholder="تهران" /></FormField></div>
            <FormField label="توضیحات پروژه (اختیاری)" error={form.formState.errors.notes?.message}><textarea {...form.register('notes')} rows={3} placeholder="متراژ تقریبی، زمان تحویل یا نکات مهم..." /></FormField>
            <div className="form-security"><ShieldCheck size={17} /> اطلاعات شما فقط برای پاسخ به این استعلام استفاده می‌شود.</div>
            {submissionError && <div className="submission-error">{submissionError}</div>}
            <div className="form-actions"><button type="button" onClick={() => setStep('cart')}><ArrowRight size={17} /> بازگشت</button><button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'در حال ارسال...' : 'ارسال کد تأیید'} {!submitting && <ArrowLeft size={17} />}</button></div>
          </form>}
          {step === 'otp' && <form className="otp-form" onSubmit={otpForm.handleSubmit(verifyOtp)}>
            <div className="otp-icon"><EnvelopeSimple size={30} /></div><h3>ایمیل خود را بررسی کنید</h3><p>کد تأیید ۶ رقمی به <b dir="ltr">{email}</b> ارسال شد.</p>
            {!isSupabaseConfigured && <div className="demo-code">نسخه نمایشی — کد تأیید: <b>۲۴۶۸۱۰</b></div>}<input dir="ltr" inputMode="numeric" maxLength={6} autoFocus {...otpForm.register('otp')} placeholder="------" aria-label="کد تأیید" />
            {otpForm.formState.errors.otp && <span className="field-error">{otpForm.formState.errors.otp.message}</span>}{submissionError && <div className="submission-error">{submissionError}</div>}<button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'در حال ثبت...' : 'تأیید و ثبت استعلام'}</button><button type="button" className="otp-back" onClick={() => setStep('form')}>اصلاح اطلاعات</button>
          </form>}
          {step === 'success' && <div className="success-state"><div><CheckCircle size={58} weight="light" /></div><h3>درخواست شما با موفقیت ثبت شد.</h3><p>کارشناس کارا پس از بررسی موجودی و مشخصات پروژه، حداکثر تا یک روز کاری با شما در ارتباط خواهد بود.</p><span>کد پیگیری</span><strong>{trackingCode}</strong><button className="primary-button" onClick={handleClose}>بازگشت به سایت</button></div>}
        </motion.aside>
      </motion.div>}
    </AnimatePresence>
  )
}

function Footer() {
  return <footer id="about"><div className="footer-top"><div><Brand /><p>سطوح پرسلانی برای معماری امروز؛<br />ساخته‌شده با دقت، برای ماندن.</p></div><div><b>دسترسی سریع</b><button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>محصولات</button><button onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}>کالکشن‌ها</button><button onClick={() => document.getElementById('technical')?.scrollIntoView({ behavior: 'smooth' })}>راهنمای فنی</button></div><div><b>ارتباط با ما</b><span>تهران، بلوار میرداماد</span><a href="tel:+982188765400" dir="ltr">+98 21 8876 5400</a><a href="mailto:project@karaceram.ir">project@karaceram.ir</a></div></div><div className="footer-bottom"><span>© ۱۴۰۴ کارا سرام. تمامی حقوق محفوظ است.</span><span>کاتالوگ حرفه‌ای محصولات پرسلانی</span></div></footer>
}

export default function KaraApp() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [searchSignal, setSearchSignal] = useState(0)
  const count = useInquiryStore((state) => state.items.length)
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer) }, [toast])
  const handleAdded = (name: string) => setToast(`${name} به سبد استعلام افزوده شد`)

  return <div className="app-shell" dir="rtl">
    <Header count={count} onInquiry={() => setDrawerOpen(true)} onSearch={() => setSearchSignal((value) => value + 1)} /><Hero />
    <Catalog onDetails={setSelectedProduct} onAdded={handleAdded} initialSearch={searchSignal} /><Collections /><Technical />
    <section className="inquiry-cta"><div><small>برای پروژه بعدی آماده‌اید؟</small><h2>انتخاب کنید؛ پاسخ دقیق را از ما بگیرید.</h2><p>چند محصول و سایز را کنار هم قرار دهید تا تیم تخصصی کارا بر اساس نیاز پروژه، استعلام شما را بررسی کند.</p></div><button onClick={() => setDrawerOpen(true)}>مشاهده سبد استعلام <ArrowLeft size={19} />{count > 0 && <span>{toFa(count)}</span>}</button></section>
    <Footer /><InquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    <AnimatePresence>{selectedProduct && <ProductModal key={selectedProduct.id} product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdded={handleAdded} />}</AnimatePresence>
    <AnimatePresence>{toast && <motion.button className="toast" onClick={() => setDrawerOpen(true)} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}><CheckCircle size={21} /><span>{toast}</span><b>مشاهده</b></motion.button>}</AnimatePresence>
    {count > 0 && <button className="mobile-basket" onClick={() => setDrawerOpen(true)}><ClipboardText size={21} /><span>سبد استعلام</span><b>{toFa(count)}</b></button>}
  </div>
}
