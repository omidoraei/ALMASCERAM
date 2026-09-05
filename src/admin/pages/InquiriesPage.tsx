import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle, ClipboardText, MagnifyingGlass } from '@phosphor-icons/react'
import { FormDialog, PageShell, PaginationFooter, SearchToolbar, StatusPill } from '../components/admin-ui'
import { DialogContent, DialogDescription, DialogTitle } from '../components/Dialog'
import { getAdminInquiries, updateInquiryStatus } from '../../lib/actions/admin-actions'
import { getInquiryItems } from '../../lib/actions/inquiry-detail-actions'
import { isSupabaseConfigured } from '../../lib/supabase/client'
import type { InquiryAdminStatus } from '../../lib/validation/admin-catalog'

type Inquiry = { id: string; number: string; customer: string; company: string; city: string; itemsCount: number; status: InquiryAdminStatus; submittedAt: string }
type Item = { id: string; product: string; sku: string; size: string; quantity: number; requestedSqm: number | null }

const statuses: Record<InquiryAdminStatus, string> = {
  submitted: 'جدید', in_review: 'در حال بررسی', quoted: 'پاسخ داده‌شده', closed: 'بسته‌شده', cancelled: 'لغوشده',
}

const demo: Inquiry[] = [
  { id: 'd1', number: '۸۲۱۶', customer: 'آرمان رضایی', company: 'استودیو بُن', city: 'تهران', itemsCount: 4, status: 'submitted', submittedAt: 'امروز، ۱۰:۲۸' },
  { id: 'd2', number: '۸۲۱۵', customer: 'سارا توسلی', company: 'معماران رواق', city: 'شیراز', itemsCount: 2, status: 'in_review', submittedAt: 'امروز، ۰۹:۱۲' },
  { id: 'd3', number: '۸۲۱۴', customer: 'پویان منصوری', company: 'ساختمان آرتا', city: 'اصفهان', itemsCount: 6, status: 'quoted', submittedAt: 'دیروز' },
]

export function InquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>(demo)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | InquiryAdminStatus>('all')
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const load = async () => {
    if (!isSupabaseConfigured) return
    const data = await getAdminInquiries()
    setRows((data as unknown as Array<{ id: string; inquiry_number: number; customer_name: string | null; company_name: string | null; project_city: string | null; status: InquiryAdminStatus; submitted_at: string; inquiry_items: Array<{ count: number }> }>).map((item) => ({
      id: item.id, number: item.inquiry_number.toLocaleString('fa-IR'),
      customer: item.customer_name ?? 'مشتری', company: item.company_name ?? '—', city: item.project_city ?? '—',
      itemsCount: item.inquiry_items[0]?.count ?? 0, status: item.status,
      submittedAt: new Date(item.submitted_at).toLocaleString('fa-IR'),
    })))
  }

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer) }, [])

  const filtered = useMemo(() => rows.filter((row) => (status === 'all' || row.status === status) && `${row.number} ${row.customer} ${row.company} ${row.city}`.includes(search)), [rows, search, status])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize)

  const change = async (row: Inquiry, next: InquiryAdminStatus) => {
    if (isSupabaseConfigured) await updateInquiryStatus(row.id, next)
    setRows((items) => items.map((item) => item.id === row.id ? { ...item, status: next } : item))
    setSelected((item) => item?.id === row.id ? { ...item, status: next } : item)
    setMessage('وضعیت استعلام به‌روزرسانی شد')
  }

  const open = async (row: Inquiry) => {
    setSelected(row)
    setLoadingItems(true)
    if (!isSupabaseConfigured) {
      setItems([{ id: 'i1', product: 'آرنا سند', sku: 'KR-0101', size: '۱۲۰ × ۲۴۰ × ۹', quantity: 2, requestedSqm: 180 }, { id: 'i2', product: 'کلکته اورو', sku: 'KR-0103', size: '۸۰ × ۱۶۰ × ۹', quantity: 1, requestedSqm: 75 }])
      setLoadingItems(false)
      return
    }
    try {
      const data = await getInquiryItems(row.id)
      setItems((data as unknown as Array<{ id: string; quantity: number; requested_sqm: number | null; sizes: { width_mm: number; height_mm: number; thickness_mm: number; products: { name: string; sku: string } | null } | null }>).map((item) => ({
        id: item.id, product: item.sizes?.products?.name ?? 'محصول', sku: item.sizes?.products?.sku ?? '—',
        size: item.sizes ? `${item.sizes.width_mm / 10} × ${item.sizes.height_mm / 10} × ${item.sizes.thickness_mm}` : '—',
        quantity: item.quantity, requestedSqm: item.requested_sqm,
      })))
    } finally { setLoadingItems(false) }
  }

  return <PageShell
    eyebrow="Lead Management"
    title="مدیریت استعلام‌ها"
    description="بررسی مشتری، اقلام انتخاب‌شده و چرخه پاسخ‌گویی"
    action={<span className="seo-health"><ClipboardText size={17} /> {rows.filter((item) => item.status === 'submitted').length.toLocaleString('fa-IR')} مورد جدید</span>}
  >
    {message && <div className="module-success"><CheckCircle size={16} />{message}<button type="button" onClick={() => setMessage('')}>×</button></div>}
    <div className="module-table-card">
      <SearchToolbar
        value={search}
        onChange={setSearch}
        placeholder="کد، مشتری، شرکت یا شهر..."
        extra={<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="all">همه وضعیت‌ها</option>
          {Object.entries(statuses).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>}
      />
      <div className="admin-table-wrap">
        <table className="admin-data-table">
          <thead>
            <tr><th>کد</th><th>مشتری / شرکت</th><th>شهر</th><th>اقلام</th><th>زمان ثبت</th><th>وضعیت</th><th /></tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td><b>#{row.number}</b></td>
                <td>
                  <div className="customer-cell">
                    <span>{row.customer[0]}</span>
                    <p><b>{row.customer}</b><small>{row.company}</small></p>
                  </div>
                </td>
                <td>{row.city}</td>
                <td>{row.itemsCount.toLocaleString('fa-IR')} قلم</td>
                <td>{row.submittedAt}</td>
                <td>
                  <select className="status-select review" value={row.status} onChange={(event) => void change(row, event.target.value as InquiryAdminStatus)}>
                    {Object.entries(statuses).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                  </select>
                </td>
                <td>
                  <button type="button" className="table-view-button" onClick={() => void open(row)}>
                    مشاهده <ArrowLeft size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter page={page} totalPages={pages} onPageChange={setPage} />
    </div>

    <FormDialog
      open={selected !== null}
      title={selected ? `استعلام ${selected.number}` : ''}
      description="اقلام انتخاب‌شده و اطلاعات مشتری"
      onClose={() => setSelected(null)}
    >
      {selected && (
        <>
          <div className="inquiry-detail-summary">
            <div><small>مشتری</small><b>{selected.customer}</b></div>
            <div><small>شرکت</small><b>{selected.company}</b></div>
            <div><small>شهر</small><b>{selected.city}</b></div>
            <div><small>وضعیت</small><StatusPill active={selected.status !== 'closed' && selected.status !== 'cancelled'} activeLabel={statuses[selected.status]} inactiveLabel={statuses[selected.status]} /></div>
          </div>
          {loadingItems ? <p>در حال بارگذاری اقلام...</p> : (
            <table className="admin-data-table inquiry-items-table">
              <thead><tr><th>محصول</th><th>کد</th><th>سایز</th><th>تعداد</th><th>متراژ</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product}</td>
                    <td><code>{item.sku}</code></td>
                    <td>{item.size}</td>
                    <td>{item.quantity.toLocaleString('fa-IR')}</td>
                    <td>{item.requestedSqm?.toLocaleString('fa-IR') ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </FormDialog>
  </PageShell>
}
