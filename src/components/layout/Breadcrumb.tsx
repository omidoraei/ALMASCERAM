import { CaretRight } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

/**
 * Single breadcrumb item. `href` is required unless the item is the
 * current page (the trailing item, rendered as a `<span>` for a11y).
 */
export interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  className?: string
  label?: string
}

/**
 * Breadcrumb — accessible, RTL-friendly navigation trail. Renders a
 * `<nav aria-label="...">` with an `<ol>` of items. The last item is
 * treated as the current page and rendered with `aria-current="page"`.
 *
 * JSON-LD is intentionally NOT rendered here; use `breadcrumbSchema`
 * from `lib/seo/jsonld` separately so search engines can index the
 * structured data.
 */
export function Breadcrumb({ items, separator, className, label = 'مسیر دسترسی' }: BreadcrumbProps) {
  if (!items.length) return null
  const sep = separator ?? <CaretRight size={12} weight="bold" aria-hidden="true" />

  return (
    <nav className={`breadcrumb ${className ?? ''}`.trim()} aria-label={label}>
      <ol className="breadcrumb-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          const content = item.href && !isLast ? (
            <a href={item.href} className="breadcrumb-link">{item.name}</a>
          ) : (
            <span className="breadcrumb-current" aria-current={isLast ? 'page' : undefined}>{item.name}</span>
          )
          return (
            <li key={`${item.name}-${idx}`} className="breadcrumb-item">
              {content}
              {!isLast && <span className="breadcrumb-sep" aria-hidden="true">{sep}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
