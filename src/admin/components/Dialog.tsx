import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onOpenChange(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return <AnimatePresence>
    {open && (
      <motion.div className="ui-dialog-overlay" onClick={() => onOpenChange(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} dir="rtl">
        <motion.div className="ui-dialog-content" onClick={(event) => event.stopPropagation()} initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }}>
          <button className="ui-dialog-close" type="button" onClick={() => onOpenChange(false)} aria-label="بستن"><X size={18} /></button>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
}

type DialogContentProps = { children: ReactNode; className?: string; dir?: string }
export function DialogContent({ children, className }: DialogContentProps) {
  return <div className={className}>{children}</div>
}

type DialogTitleProps = { children: ReactNode }
export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="ui-dialog-title">{children}</h2>
}

type DialogDescriptionProps = { children: ReactNode }
export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="ui-dialog-description">{children}</p>
}

type DialogTriggerProps = { children: ReactNode; asChild?: boolean }
export function DialogTrigger({ children }: DialogTriggerProps) {
  // The existing callers wrap a button themselves; we render children directly.
  return <>{children}</>
}
