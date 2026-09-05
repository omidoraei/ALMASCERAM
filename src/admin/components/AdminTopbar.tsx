import { useState } from 'react'
import { Bell, ClipboardText, Clock, List } from '@phosphor-icons/react'
import { isSupabaseConfigured } from '../../lib/supabase/client'
import { ThemeToggle } from '../../components/layout/ThemeToggle'

type AdminTopbarProps = {
  titleEyebrow: string
  title: string
  onOpenSidebar: () => void
}

/**
 * Topbar is isolated from the rest of the admin shell so that toggling
 * notifications does not re-render the whole `<AdminApp />` tree
 * (which holds products, inquiries, dashboard counts, etc.).
 */
export function AdminTopbar({ titleEyebrow, title, onOpenSidebar }: AdminTopbarProps) {
  const [notifications, setNotifications] = useState(false)
  return (
    <header className="admin-topbar">
      <button className="admin-menu-trigger" onClick={onOpenSidebar} aria-label="باز کردن منو">
        <List size={22} />
      </button>
      <div>
        <small>{titleEyebrow}</small>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <span className="environment"><i /> {isSupabaseConfigured ? 'Production' : 'Demo mode'}</span>
        <ThemeToggle />
        <button
          className="notification-button"
          onClick={() => setNotifications((value) => !value)}
          aria-label="اعلان‌ها"
        >
          <Bell size={20} />
          <i />
        </button>
        {notifications && (
          <div className="notification-popover" role="dialog" aria-label="اعلان‌ها">
            <b>اعلان‌ها</b>
            <p><ClipboardText size={17} /> ۳ استعلام جدید منتظر بررسی است.</p>
            <p><Clock size={17} /> اطلاعات فنی ۲ محصول ناقص است.</p>
          </div>
        )}
      </div>
    </header>
  )
}
