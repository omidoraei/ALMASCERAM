import { useState, type ReactNode } from 'react'
import { CheckCircle, X } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './Dialog'

type PageShellProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

/**
 * Standard admin page wrapper: header (eyebrow + title + description + action),
 * a dismissible success banner, and the page body.
 */
export function PageShell({ eyebrow, title, description, action, children }: PageShellProps) {
  const [message, setMessage] = useState('')
  return <section className="module-page">
    <header className="module-page-head">
      <div>
        {eyebrow && <small>{eyebrow}</small>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
    {message && (
      <div className="module-success" onClick={() => setMessage('')} role="status">
        <CheckCircle size={16} />{message}<button type="button" aria-label="بستن پیام"><X size={14} /></button>
      </div>
    )}
    {children}
  </section>
}

type SearchToolbarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  count?: number
  extra?: ReactNode
}

export function SearchToolbar({ value, onChange, placeholder = 'جستجو...', count, extra }: SearchToolbarProps) {
  return <div className="module-toolbar">
    <label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
    {count !== undefined && <span>{count.toLocaleString('fa-IR')} رکورد</span>}
    {extra}
  </div>
}

type PaginationFooterProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationFooter({ page, totalPages, onPageChange }: PaginationFooterProps) {
  return <footer className="module-pagination">
    <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>قبلی</button>
    <span>صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}</span>
    <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>بعدی</button>
  </footer>
}

type StatusPillProps = {
  active: boolean
  published?: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusPill({ active, published, activeLabel, inactiveLabel = 'غیرفعال' }: StatusPillProps) {
  const label = active ? (activeLabel ?? (published ? 'فعال / منتشر' : 'فعال')) : inactiveLabel
  return <span className={`publish-status ${active ? 'published' : 'draft'}`}><i />{label}</span>
}

type FormDialogProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

/**
 * Wraps the lightweight Dialog with a standardized form layout (title + description + content).
 * Use inside a form to compose the submit/cancel buttons in `children`.
 */
export function FormDialog({ open, title, description, onClose, children }: FormDialogProps) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
    <DialogContent className="ui-form-dialog" dir="rtl">
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
      {children}
    </DialogContent>
  </Dialog>
}
