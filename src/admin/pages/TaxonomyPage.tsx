import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowsClockwise, CheckCircle, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { FormDialog, PageShell, PaginationFooter, SearchToolbar, StatusPill } from '../components/admin-ui'
import { createTaxonomy, hardDeleteTaxonomy, listTaxonomies, restoreTaxonomy, softDeleteTaxonomy, updateTaxonomy } from '../../lib/actions/taxonomy-actions'
import { isSupabaseConfigured } from '../../lib/supabase/client'
import { taxonomyInputSchema, type TaxonomyInput, type TaxonomyKind } from '../../lib/validation/admin-entities'

type Row = { id: string; name: string; slug: string; description: string | null; icon?: string | null; is_active: boolean; sort_order: number }

const labels: Record<TaxonomyKind, { title: string; singular: string; description: string }> = {
  surface: { title: 'سطوح', singular: 'سطح', description: 'تعریف واژگان استاندارد برای فیلتر و مشخصات محصولات' },
  finishes: { title: 'پرداخت‌ها', singular: 'پرداخت', description: 'تعریف انواع پرداخت سطح محصولات' },
  spaces: { title: 'فضاها', singular: 'فضا', description: 'تعریف فضاهای کاربردی محصولات' },
}

const demo: Record<TaxonomyKind, Row[]> = {
  surface: [
    { id: 's1', name: 'سنگ', slug: 'stone', description: 'الهام‌گرفته از سنگ طبیعی', is_active: true, sort_order: 10 },
    { id: 's2', name: 'بتن', slug: 'concrete', description: 'سطوح معماری مدرن', is_active: true, sort_order: 20 },
    { id: 's3', name: 'چوب', slug: 'wood', description: 'بافت گرم چوب', is_active: false, sort_order: 30 },
  ],
  finishes: [
    { id: 'f1', name: 'مات', slug: 'matt', description: 'بدون بازتاب نور', is_active: true, sort_order: 10 },
    { id: 'f2', name: 'پولیش', slug: 'polished', description: 'سطح براق', is_active: true, sort_order: 20 },
  ],
  spaces: [
    { id: 'p1', name: 'فضای مسکونی', slug: 'residential', icon: 'house', description: 'خانه و آپارتمان', is_active: true, sort_order: 10 },
    { id: 'p2', name: 'فضای تجاری', slug: 'commercial', icon: 'buildings', description: 'فروشگاه و دفتر', is_active: true, sort_order: 20 },
  ],
}

function TaxonomyForm({ kind, row, onDone, onCancel }: { kind: TaxonomyKind; row: Row | null; onDone: (value: TaxonomyInput) => Promise<void>; onCancel: () => void }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const form = useForm<TaxonomyInput>({
    defaultValues: {
      name: row?.name ?? '',
      slug: row?.slug ?? '',
      description: row?.description ?? '',
      icon: row?.icon ?? '',
      isActive: row?.is_active ?? true,
      sortOrder: row?.sort_order ?? 0,
    },
  })
  const submit = async (raw: TaxonomyInput) => {
    setSaving(true)
    setError('')
    try {
      const value = taxonomyInputSchema.parse(raw)
      await onDone(value)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'اطلاعات معتبر نیست')
    } finally {
      setSaving(false)
    }
  }
  return (
    <form className="module-form" onSubmit={form.handleSubmit(submit)}>
      <div className="module-grid">
        <label className="module-field"><span>نام</span><input {...form.register('name')} /></label>
        <label className="module-field"><span>Slug</span><input dir="ltr" {...form.register('slug')} /></label>
      </div>
      {kind === 'spaces' && <label className="module-field"><span>نام آیکن</span><input dir="ltr" {...form.register('icon')} /></label>}
      <label className="module-field"><span>توضیحات</span><textarea rows={3} {...form.register('description')} /></label>
      <div className="module-grid">
        <label className="module-field"><span>ترتیب</span><input type="number" {...form.register('sortOrder', { valueAsNumber: true })} /></label>
        <label className="module-check"><input type="checkbox" {...form.register('isActive')} /><span>فعال باشد</span></label>
      </div>
      {error && <div className="module-error">{error}</div>}
      <div className="module-form-actions">
        <button type="button" onClick={onCancel}>انصراف</button>
        <button className="module-primary" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'} <CheckCircle size={16} /></button>
      </div>
    </form>
  )
}

export function TaxonomyPage({ kind, isSuperAdmin }: { kind: TaxonomyKind; isSuperAdmin: boolean }) {
  const [rows, setRows] = useState<Row[]>(demo[kind])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Row | 'new' | null>(null)
  const pageSize = 8

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const result = await listTaxonomies(kind, { page: 1, pageSize: 100 })
    setRows(result.rows as Row[])
  }, [kind])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.slug}`.toLowerCase().includes(search.toLowerCase())), [rows, search])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize)

  const save = async (value: TaxonomyInput) => {
    if (isSupabaseConfigured) {
      if (editor && editor !== 'new') await updateTaxonomy(kind, editor.id, value)
      else await createTaxonomy(kind, value)
      await load()
    } else if (editor && editor !== 'new') {
      setRows((items) => items.map((item) => item.id === editor.id
        ? { ...item, ...value, description: value.description ?? null, icon: value.icon, is_active: value.isActive ?? true, sort_order: value.sortOrder ?? 0 }
        : item))
    } else {
      setRows((items) => [{
        id: `demo-${Date.now()}`,
        name: value.name,
        slug: value.slug,
        description: value.description ?? null,
        icon: value.icon,
        is_active: value.isActive ?? true,
        sort_order: value.sortOrder ?? 0,
      }, ...items])
    }
    setEditor(null)
  }

  const toggle = async (row: Row) => {
    if (isSupabaseConfigured) {
      if (row.is_active) await softDeleteTaxonomy(kind, row.id)
      else await restoreTaxonomy(kind, row.id)
      await load()
    } else {
      setRows((items) => items.map((item) => item.id === row.id ? { ...item, is_active: !item.is_active } : item))
    }
  }

  const hardDelete = async (row: Row) => {
    if (!window.confirm('حذف فیزیکی غیرقابل بازگشت است. ادامه می‌دهید؟')) return
    if (isSupabaseConfigured) {
      await hardDeleteTaxonomy(kind, row.id)
      await load()
    } else {
      setRows((items) => items.filter((item) => item.id !== row.id))
    }
  }

  return <PageShell
    eyebrow="طبقه‌بندی کاتالوگ"
    title={labels[kind].title}
    description={labels[kind].description}
    action={<button className="module-primary" onClick={() => setEditor('new')}><Plus size={17} /> {labels[kind].singular} جدید</button>}
  >
    <div className="module-table-card">
      <SearchToolbar
        value={search}
        onChange={(value) => { setSearch(value); setPage(1) }}
        placeholder="جستجو نام یا اسلاگ..."
        count={filtered.length}
      />
      <div className="admin-table-wrap">
        <table className="admin-data-table">
          <thead>
            <tr><th>نام</th><th>اسلاگ</th><th>توضیحات</th><th>ترتیب</th><th>وضعیت</th><th /></tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td><b>{row.name}</b></td>
                <td><code>{row.slug}</code></td>
                <td>{row.description || '—'}</td>
                <td>{row.sort_order.toLocaleString('fa-IR')}</td>
                <td><StatusPill active={row.is_active} activeLabel="فعال" /></td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setEditor(row)} aria-label="ویرایش"><PencilSimple size={16} /></button>
                    <button type="button" title={row.is_active ? 'حذف نرم' : 'بازیابی'} onClick={() => void toggle(row)} aria-label={row.is_active ? 'حذف نرم' : 'بازیابی'}>
                      {row.is_active ? <Trash size={16} /> : <ArrowsClockwise size={16} />}
                    </button>
                    {isSuperAdmin && (
                      <button type="button" className="hard-delete" title="حذف فیزیکی" onClick={() => void hardDelete(row)} aria-label="حذف فیزیکی">×</button>
                    )}
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
      title={editor === 'new' || editor === null ? `${labels[kind].singular} جدید` : `ویرایش ${labels[kind].singular}`}
      description="نام فارسی، اسلاگ و وضعیت نمایش را مدیریت کنید."
      onClose={() => setEditor(null)}
    >
      <TaxonomyForm
        kind={kind}
        row={editor && editor !== 'new' ? editor : null}
        onDone={save}
        onCancel={() => setEditor(null)}
      />
    </FormDialog>
  </PageShell>
}
