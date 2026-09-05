import { ArrowSquareOut, SignOut, X, type IconProps } from '@phosphor-icons/react'
import { ComponentType, type ReactNode } from 'react'
import { ADMIN_ROUTES, type AdminRouteId } from '../routes'
import { ThemeToggle } from '../../components/layout/ThemeToggle'

type AdminProfile = { fullName: string; role: string }

type NavItem = {
  id: AdminRouteId
  label: string
  icon: ComponentType<IconProps>
  badge?: number
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

type AdminSidebarProps = {
  activeView: AdminRouteId
  groups: NavGroup[]
  profile: AdminProfile | null
  mobileOpen: boolean
  onNavigate: (view: AdminRouteId) => void
  onCloseMobile: () => void
  onSignOut: () => void
}

const faNumber = (value: number | string) => new Intl.NumberFormat('fa-IR').format(Number(value))

/**
 * Sidebar lives in its own component so the parent shell can keep its
 * re-renders cheap. When the user changes the route, only this component
 * re-renders, not the page body that holds the data tables.
 */
export function AdminSidebar({ activeView, groups, profile, mobileOpen, onNavigate, onCloseMobile, onSignOut }: AdminSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-nav-overlay"
          onClick={onCloseMobile}
          aria-label="بستن منو"
        />
      )}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`} dir="rtl">
        <div className="sidebar-head">
          <AdminBrand />
          <button type="button" className="sidebar-close" onClick={onCloseMobile} aria-label="بستن منو">
            <X size={20} />
          </button>
        </div>
        <nav className="admin-grouped-nav" aria-label="ناوبری پنل">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <small>{group.label}</small>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={activeView === item.id ? 'active' : ''}
                    onClick={() => onNavigate(item.id)}
                    aria-current={activeView === item.id ? 'page' : undefined}
                  >
                    <Icon size={19} weight="light" />
                    <span>{item.label}</span>
                    {item.badge ? <b>{faNumber(item.badge)}</b> : null}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <SidebarFoot profile={profile} onSignOut={onSignOut} />
      </aside>
    </>
  )
}

function AdminBrand() {
  return (
    <button type="button" className="admin-brand" onClick={() => { window.location.href = '/' }}>
      <span aria-hidden="true"><i /><i /><i /><i /></span>
      <div><b>الماس</b><small>پنل مدیریت</small></div>
    </button>
  )
}

function SidebarFoot({ profile, onSignOut }: { profile: AdminProfile | null; onSignOut: () => void }) {
  return (
    <div className="sidebar-foot">
      <button type="button" onClick={() => { window.location.href = '/' }}>
        <ArrowSquareOut size={18} />
        <span>مشاهده وب‌سایت</span>
      </button>
      <button type="button" onClick={onSignOut}>
        <SignOut size={18} />
        <span>خروج از حساب</span>
      </button>
      <ThemeToggle />
      <div className="admin-profile">
        <span>{profile?.fullName?.slice(0, 1) ?? '?'}</span>
        <p><b>{profile?.fullName ?? 'مهمان'}</b><small>{profile?.role === 'super_admin' ? 'مدیر ارشد' : profile?.role ?? '—'}</small></p>
        <i aria-hidden="true" />
      </div>
    </div>
  )
}

// Re-export to silence unused-import warnings for types that are
// only consumed via the props shape above.
export type { ReactNode }
