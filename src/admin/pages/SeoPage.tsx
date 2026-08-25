import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { CheckCircle, Code, Image, MagnifyingGlass, UploadSimple } from '@phosphor-icons/react'
import { listCollections, listProducts, listSeries } from '../../lib/actions/catalog-actions'
import { listSeoRecords, upsertSeoRecord } from '../../lib/actions/seo-actions'
import { uploadPublicCatalogAsset } from '../../lib/actions/storage-actions'
import { isSupabaseConfigured } from '../../lib/supabase/client'
import { seoInputSchema, type SeoEntity, type SeoInput } from '../../lib/validation/admin-entities'

type Option = { id: string; name: string }
type SeoForm = Omit<SeoInput, 'jsonLd'> & { jsonLdText: string }
const label = { collection: 'کالکشن', series: 'سری', product: 'محصول' } as const

export function SeoPage({ entity }: { entity: SeoEntity }) {
  const [options, setOptions] = useState<Option[]>([{ id: '00000000-0000-4000-8000-000000000001', name: `${label[entity]} نمونه اول` }, { id: '00000000-0000-4000-8000-000000000002', name: `${label[entity]} نمونه دوم` }])
  const [records, setRecords] = useState<Array<Record<string, unknown>>>([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const form = useForm<SeoForm>({ defaultValues: { entityId: options[0].id, metaTitle: '', metaDescription: '', canonicalUrl: null, focusKeyword: '', ogTitle: '', ogDescription: '', ogImagePath: '', robotsNoindex: false, robotsNofollow: false, jsonLdText: '{}' } })
  const title = useWatch({ control: form.control, name: 'metaTitle' })
  const description = useWatch({ control: form.control, name: 'metaDescription' })
  const selectedId = useWatch({ control: form.control, name: 'entityId' })

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const [entityRows, seoRows] = await Promise.all([entity === 'collection' ? listCollections() : entity === 'series' ? listSeries() : listProducts(), listSeoRecords(entity)])
    const normalized = (entityRows as unknown as Array<{ id: string; name: string }>).map((item) => ({ id: item.id, name: item.name }))
    setOptions(normalized); setRecords(seoRows as unknown as Array<Record<string, unknown>>)
    if (normalized[0]) form.setValue('entityId', normalized[0].id)
  }, [entity, form])
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer) }, [load])

  const selectEntity = (id: string) => {
    const idColumn = `${entity}_id`
    const record = records.find((item) => item[idColumn] === id)
    form.reset({ entityId: id, metaTitle: String(record?.meta_title ?? ''), metaDescription: String(record?.meta_description ?? ''), canonicalUrl: record?.canonical_url ? String(record.canonical_url) : null, focusKeyword: String(record?.focus_keyword ?? ''), ogTitle: String(record?.og_title ?? ''), ogDescription: String(record?.og_description ?? ''), ogImagePath: String(record?.og_image_path ?? ''), robotsNoindex: Boolean(record?.robots_noindex), robotsNofollow: Boolean(record?.robots_nofollow), jsonLdText: JSON.stringify(record?.json_ld ?? {}, null, 2) })
  }
  const save = async (value: SeoForm) => {
    setSaving(true); setError(''); setMessage('')
    try {
      let jsonLd: Record<string, unknown>
      try { jsonLd = JSON.parse(value.jsonLdText) as Record<string, unknown> } catch { throw new Error('ساختار JSON-LD معتبر نیست') }
      const validated = seoInputSchema.parse({ ...value, jsonLd })
      if (isSupabaseConfigured) { await upsertSeoRecord(entity, validated); await load() }
      setMessage('اطلاعات SEO ذخیره شد')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'ذخیره انجام نشد') } finally { setSaving(false) }
  }
  const uploadOg = async (file: File | undefined) => {
    if (!file) return
    setUploading(true); setError('')
    try { if (isSupabaseConfigured) { const result = await uploadPublicCatalogAsset({ bucket: 'seo-media', folder: `${entity}/${selectedId}`, file }); form.setValue('ogImagePath', result.path) } else form.setValue('ogImagePath', `demo/${file.name}`); setMessage('تصویر OG آپلود شد') } catch (caught) { setError(caught instanceof Error ? caught.message : 'آپلود انجام نشد') } finally { setUploading(false) }
  }
  const filtered = options.filter((item) => item.name.includes(search))

  return <section className="module-page"><header className="module-page-head"><div><small>Technical SEO</small><h2>SEO {label[entity]}ها</h2><p>مدیریت metadata، OpenGraph، Canonical و JSON-LD</p></div><span className="seo-health"><CheckCircle size={17} /> نسخه نهایی schema</span></header>{message && <div className="module-success"><CheckCircle size={16} />{message}<button onClick={() => setMessage('')}>×</button></div>}<div className="seo-layout"><aside className="seo-entities"><label><MagnifyingGlass size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو..." /></label>{filtered.map((item) => <button key={item.id} className={selectedId === item.id ? 'active' : ''} onClick={() => selectEntity(item.id)}><span>{item.name.slice(0, 1)}</span><p><b>{item.name}</b><small>{records.some((record) => record[`${entity}_id`] === item.id) ? 'تکمیل‌شده' : 'نیازمند تکمیل'}</small></p></button>)}</aside><form className="seo-form-card" onSubmit={form.handleSubmit(save)}><div className="seo-form-section"><header><span>Metadata اصلی</span><i>01</i></header><label className="module-field"><span>Meta Title <b>{title?.length ?? 0}/70</b></span><input {...form.register('metaTitle')} placeholder="عنوان دقیق صفحه برای موتور جستجو" /></label><label className="module-field"><span>Meta Description <b>{description?.length ?? 0}/170</b></span><textarea rows={3} {...form.register('metaDescription')} /></label><div className="module-grid"><label className="module-field"><span>Focus Keyword</span><input {...form.register('focusKeyword')} /></label><label className="module-field"><span>Canonical URL</span><input dir="ltr" {...form.register('canonicalUrl')} /></label></div></div><div className="seo-form-section"><header><span>OpenGraph</span><i>02</i></header><div className="module-grid"><label className="module-field"><span>OG Title</span><input {...form.register('ogTitle')} /></label><label className="module-field"><span>مسیر تصویر OG</span><input dir="ltr" readOnly {...form.register('ogImagePath')} /></label></div><button type="button" className="seo-upload" onClick={() => fileRef.current?.click()}><Image size={19} /><span><b>{uploading ? 'در حال آپلود...' : 'آپلود مستقیم تصویر OG'}</b><small>بدون عبور از سرور</small></span><UploadSimple size={17} /></button><input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void uploadOg(event.target.files?.[0])} /></div><div className="seo-form-section"><header><span>Robots & Structured Data</span><i>03</i></header><div className="seo-checks"><label className="module-check"><input type="checkbox" {...form.register('robotsNoindex')} /><span>noindex</span></label><label className="module-check"><input type="checkbox" {...form.register('robotsNofollow')} /><span>nofollow</span></label></div><label className="module-field code-field"><span><Code size={14} /> JSON-LD</span><textarea dir="ltr" rows={8} {...form.register('jsonLdText')} /></label></div>{error && <div className="module-error">{error}</div>}<footer><button className="module-primary" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات SEO'} <CheckCircle size={17} /></button></footer></form></div></section>
}
