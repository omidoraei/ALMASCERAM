import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowsClockwise, CheckCircle, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { FormDialog, PageShell, PaginationFooter, SearchToolbar, StatusPill } from '../components/admin-ui'
import {
  createCollection, createSeries, createSize,
  deleteCollection, deleteSeries, deleteSize,
  hardDeleteCollection, hardDeleteSeries, hardDeleteSize,
  listCollections, listProducts, listSeries, listSizes,
  restoreCollection, restoreSeries, restoreSize,
  updateCollection, updateSeries, updateSize,
} from '../../lib/actions/catalog-actions'
import { isSupabaseConfigured } from '../../lib/supabase/client'
import { UploadWidget } from '../components/UploadWidget'

type Resource = 'collections' | 'series' | 'sizes'
type Row = {
  id: string
  name: string
  slug: string
  parentId?: string
  parentName?: string
  description?: string
  isPublished: boolean
  isActive: boolean
  widthMm?: number
  heightMm?: number
  thicknessMm?: number
  sku?: string
}
type Parent = { id: string; name: string }
type FormValue = {
  name: string
  slug: string
  parentId: string
  description: string
  isPublished: boolean
  isActive: boolean
  widthMm: number
  heightMm: number
  thicknessMm: number
  isRectified: boolean
}

const config: Record<Resource, { title: string; singular: string; description: string; parent: string }> = {
  collections: { title: 'کالکشن‌ها', singular: 'کالکشن', description: 'مدیریت سلسله‌مراتب و مشخصات فنی کاتالوگ', parent: '' },
  series: { title: 'سری‌ها', singular: 'سری', description: 'مدیریت سری‌های هر کالکشن', parent: 'کالکشن' },
  sizes: { title: 'سایزها', singular: 'سایز', description: 'مدیریت ابعاد، ضخامت و فایل‌های هر محصول', parent: 'محصول' },
}

const demoRows: Record<Resource, Row[]> = {
  collections: [
    { id: 'c1', name: 'زمین', slug: 'zamin', description: 'بافت‌های طبیعی', isPublished: true, isActive: true },
    { id: 'c2', name: 'معماری', slug: 'architecture', description: 'سطوح مینیمال', isPublished: true, isActive: true },
    { id: 'c3', name: 'میراث', slug: 'heritage', isPublished: false, isActive: false },
  ],
  series: [
    { id: 'r1', name: 'آرنا', slug: 'arena', parentId: 'c1', parentName: 'زمین', isPublished: true, isActive: true },
    { id: 'r2', name: 'اوربان', slug: 'urban', parentId: 'c2', parentName: 'معماری', isPublished: true, isActive: true },
  ],
  sizes: [
    { id: 'z1', name: '۱۲۰ × ۲۴۰', slug: '120-240', parentId: 'p1', parentName: 'آرنا سند', isPublished: true, isActive: true, widthMm: 1200, heightMm: 2400, thicknessMm: 9 },
    { id: 'z2', name: '۸۰ × ۱۶۰', slug: '80-160', parentId: 'p2', parentName: 'اوربان گری', isPublished: true, isActive: true, widthMm: 800, heightMm: 1600, thicknessMm: 9 },
  ],
}

function ResourceForm({ resource, row, parents, onSave, onCancel }: { resource: Resource; row: Row | null; parents: Parent[]; onSave: (value: FormValue) => Promise<void>; onCancel: () => void }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const form = useForm<FormValue>({
    defaultValues: {
      name: row?.name ?? '',
      slug: row?.slug ?? '',
      parentId: row?.parentId ?? parents[0]?.id ?? '',
      description: row?.description ?? '',
      isPublished: row?.isPublished ?? false,
      isActive: row?.isActive ?? true,
      widthMm: row?.widthMm ?? 600,
      heightMm: row?.heightMm ?? 1200,
      thicknessMm: row?.thicknessMm ?? 9,
      isRectified: true,
    },
  })
  const submit = async (value: FormValue) => {
    setSaving(true)
    setError('')
    try {
      await onSave(value)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ذخیره انجام نشد')
    } finally {
      setSaving(false)
    }
  }
  return (
    <form className="module-form" onSubmit={form.handleSubmit(submit)}>
      {resource === 'sizes' ? (
        <>
          <label className="module-field"><span>محصول</span>
            <select {...form.register('parentId')} required>{parents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </label>
          <div className="module-grid three">
            <label className="module-field"><span>عرض (mm)</span><input type="number" {...form.register('widthMm', { valueAsNumber: true })} /></label>
            <label className="module-field"><span>ارتفاع (mm)</span><input type="number" {...form.register('heightMm', { valueAsNumber: true })} /></label>
            <label className="module-field"><span>ضخامت (mm)</span><input type="number" step="0.1" {...form.register('thicknessMm', { valueAsNumber: true })} /></label>
          </div>
          <label className="module-check"><input type="checkbox" {...form.register('isRectified')} /><span>لبه رکتیفای</span></label>
        </>
      ) : (
        <>
          <div className="module-grid">
            <label className="module-field"><span>نام</span><input {...form.register('name')} required /></label>
            <label className="module-field"><span>Slug</span><input dir="ltr" {...form.register('slug')} required /></label>
          </div>
          {resource === 'series' && (
            <label className="module-field"><span>کالکشن</span>
              <select {...form.register('parentId')} required>{parents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            </label>
          )}
          <label className="module-field"><span>توضیحات</span><textarea rows={3} {...form.register('description')} /></label>
          <label className="module-check"><input type="checkbox" {...form.register('isPublished')} /><span>منتشر شود</span></label>
        </>
      )}
      <label className="module-check"><input type="checkbox" {...form.register('isActive')} /><span>فعال باشد</span></label>
      {error && <div className="module-error">{error}</div>}
      <div className="module-form-actions">
        <button type="button" onClick={onCancel}>انصراف</button>
        <button className="module-primary" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'} <CheckCircle size={16} /></button>
      </div>
    </form>
  )
}

export function CatalogResourcePage({ resource, isSuperAdmin }: { resource: Resource; isSuperAdmin: boolean }) {
  const [rows, setRows] = useState<Row[]>(demoRows[resource])
  const [parents, setParents] = useState<Parent[]>(
    resource === 'series'
      ? [{ id: 'c1', name: 'زمین' }, { id: 'c2', name: 'معماری' }]
      : resource === 'sizes'
        ? [{ id: 'p1', name: 'آرنا سند' }, { id: 'p2', name: 'اوربان گری' }]
        : [],
  )
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Row | 'new' | null>(null)
  const [message, setMessage] = useState('')
  const pageSize = 8

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return
    if (resource === 'collections') {
      const data = await listCollections() as Array<{ id: string; name: string; slug: string; description: string | null; is_published: boolean; is_active: boolean }>
      setRows(data.map((item) => ({ id: item.id, name: item.name, slug: item.slug, description: item.description ?? '', isPublished: item.is_published, isActive: item.is_active })))
    } else if (resource === 'series') {
      const [data, collections] = await Promise.all([listSeries(), listCollections()])
      const parentRows = collections as Array<{ id: string; name: string }>
      const names = new Map(parentRows.map((item) => [item.id, item.name]))
      setParents(parentRows)
      setRows((data as Array<{ id: string; name: string; slug: string; description: string | null; collection_id: string; is_published: boolean; is_active: boolean }>).map((item) => ({
        id: item.id, name: item.name, slug: item.slug, description: item.description ?? '',
        parentId: item.collection_id, parentName: names.get(item.collection_id),
        isPublished: item.is_published, isActive: item.is_active,
      })))
    } else {
      const [data, products] = await Promise.all([listSizes(), listProducts()])
      const parentRows = products as Array<{ id: string; name: string }>
      const names = new Map(parentRows.map((item) => [item.id, item.name]))
      setParents(parentRows)
      setRows((data as Array<{ id: string; product_id: string; width_mm: number; height_mm: number; thickness_mm: number; is_active: boolean }>).map((item) => ({
        id: item.id, name: `${item.width_mm} × ${item.height_mm}`, slug: `${item.width_mm}-${item.height_mm}`,
        parentId: item.product_id, parentName: names.get(item.product_id), isPublished: true, isActive: item.is_active,
        widthMm: item.width_mm, heightMm: item.height_mm, thicknessMm: item.thickness_mm,
      })))
    }
  }, [resource])

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer) }, [load])

  const filtered = useMemo(() => rows.filter((item) => `${item.name} ${item.slug} ${item.parentName ?? ''}`.toLowerCase().includes(search.toLowerCase())), [rows, search])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize)

  const save = async (value: FormValue) => {
    const editing = editor && editor !== 'new' ? editor : null
    if (isSupabaseConfigured) {
      if (resource === 'collections') {
        const input = { name: value.name, slug: value.slug, description: value.description || null, isPublished: value.isPublished, isActive: value.isActive }
        if (editing) await updateCollection(editing.id, input); else await createCollection(input)
      } else if (resource === 'series') {
        const input = { collectionId: value.parentId, name: value.name, slug: value.slug, description: value.description || null, isPublished: value.isPublished, isActive: value.isActive }
        if (editing) await updateSeries(editing.id, input); else await createSeries(input)
      } else {
        const input = { productId: value.parentId, widthMm: value.widthMm, heightMm: value.heightMm, thicknessMm: value.thicknessMm, isRectified: value.isRectified, isActive: value.isActive }
        if (editing) await updateSize(editing.id, input); else await createSize(input)
      }
      await load()
    } else {
      const parentName = parents.find((item) => item.id === value.parentId)?.name
      const next: Row = resource === 'sizes'
        ? { id: editing?.id ?? `demo-${Date.now()}`, name: `${value.widthMm} × ${value.heightMm}`, slug: `${value.widthMm}-${value.heightMm}`, parentId: value.parentId, parentName, widthMm: value.widthMm, heightMm: value.heightMm, thicknessMm: value.thicknessMm, isPublished: true, isActive: value.isActive }
        : { id: editing?.id ?? `demo-${Date.now()}`, name: value.name, slug: value.slug, parentId: value.parentId, parentName, description: value.description, isPublished: value.isPublished, isActive: value.isActive }
      setRows((items) => editing ? items.map((item) => item.id === editing.id ? next : item) : [next, ...items])
    }
    setEditor(null)
    setMessage('اطلاعات با موفقیت ذخیره شد')
  }

  const toggle = async (row: Row) => {
    if (isSupabaseConfigured) {
      if (resource === 'collections') await (row.isActive ? deleteCollection(row.id) : restoreCollection(row.id))
      else if (resource === 'series') await (row.isActive ? deleteSeries(row.id) : restoreSeries(row.id))
      else await (row.isActive ? deleteSize(row.id) : restoreSize(row.id))
      await load()
    } else {
      setRows((items) => items.map((item) => item.id === row.id ? { ...item, isActive: !item.isActive } : item))
    }
    setMessage(row.isActive ? 'حذف نرم انجام شد' : 'رکورد بازیابی شد')
  }

  const hard = async (row: Row) => {
    if (!window.confirm('حذف فیزیکی غیرقابل بازگشت است.')) return
    if (isSupabaseConfigured) {
      if (resource === 'collections') await hardDeleteCollection(row.id)
      else if (resource === 'series') await hardDeleteSeries(row.id)
      else await hardDeleteSize(row.id)
      await load()
    } else {
      setRows((items) => items.filter((item) => item.id !== row.id))
    }
  }

  return <PageShell
    eyebrow="ساختار کاتالوگ"
    title={config[resource].title}
    description={config[resource].description}
    action={<button className="module-primary" onClick={() => setEditor('new')}><Plus size={17} /> {config[resource].singular} جدید</button>}
  >
    {message && <div className="module-success"><CheckCircle size={16} />{message}<button type="button" onClick={() => setMessage('')}>×</button></div>}
    <div className="module-table-card">
      <SearchToolbar value={search} onChange={(value) => { setSearch(value); setPage(1) }} count={filtered.length} />
      <div className="admin-table-wrap">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>{resource === 'sizes' ? 'ابعاد' : 'نام'}</th>
              <th>{config[resource].parent || 'اسلاگ'}</th>
              {resource === 'sizes' && <th>ضخامت</th>}
              <th>وضعیت</th>
              {resource === 'sizes' && <th>فایل‌ها</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td><b>{row.name}</b></td>
                <td>{row.parentName ?? <code>{row.slug}</code>}</td>
                {resource === 'sizes' && <td>{row.thicknessMm?.toLocaleString('fa-IR')} mm</td>}
                <td><StatusPill active={row.isActive} published={row.isPublished} /></td>
                {resource === 'sizes' && <td><UploadWidget sizeId={row.id} onUploaded={() => setMessage('فایل و metadata ثبت شد')} /></td>}
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setEditor(row)} aria-label="ویرایش"><PencilSimple size={16} /></button>
                    <button type="button" onClick={() => void toggle(row)} aria-label={row.isActive ? 'حذف' : 'بازیابی'}>
                      {row.isActive ? <Trash size={16} /> : <ArrowsClockwise size={16} />}
                    </button>
                    {isSuperAdmin && <button type="button" className="hard-delete" onClick={() => void hard(row)} aria-label="حذف فیزیکی">×</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter page={page} totalPages={pages} onPageChange={setPage} />
    </div>
    <FormDialog
      open={editor !== null}
      title={editor === 'new' || editor === null ? `${config[resource].singular} جدید` : `ویرایش ${config[resource].singular}`}
      description="فیلدهای فنی و وضعیت انتشار را با دقت تکمیل کنید."
      onClose={() => setEditor(null)}
    >
      <ResourceForm
        resource={resource}
        row={editor && editor !== 'new' ? editor : null}
        parents={parents}
        onSave={save}
        onCancel={() => setEditor(null)}
      />
    </FormDialog>
  </PageShell>
}
