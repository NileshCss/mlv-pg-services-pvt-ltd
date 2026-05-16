'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  UtensilsCrossed,
  Home,
  Image,
  Star,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
  MessageSquare,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard,     href: '/admin/dashboard' },
  { label: 'Registrations',icon: ClipboardList,       href: '/admin/registrations' },
  { label: 'Bookings',     icon: Calendar,            href: '/admin/bookings' },
  { label: 'Food Menu',    icon: UtensilsCrossed,     href: '/admin/food-menu' },
  { label: 'Rooms',        icon: Home,                href: '/admin/rooms' },
  { label: 'Gallery',      icon: Image,               href: '/admin/gallery' },
  { label: 'Testimonials', icon: Star,                href: '/admin/testimonials' },
  { label: 'Notice Board', icon: Megaphone,           href: '/admin/notice-board' },
  { label: 'Complaints',   icon: MessageSquare,href: '/admin/complaints', badge: true },
  { label: 'Users',        icon: Users,               href: '/admin/users' },
  { label: 'Settings',     icon: Settings,            href: '/admin/settings' },
]

/* ─── Shared styles ─────────────────────────────────────── */
const SIDEBAR_BG     = '#080C18'
const SIDEBAR_BORDER = '1px solid rgba(245, 166, 35, 0.1)'
const ACTIVE_BG      = 'rgba(245, 166, 35, 0.1)'
const ACTIVE_COLOR   = '#f59e0b'
const INACTIVE_COLOR = '#9ca3af'

/* ─── Tooltip for collapsed tablet icons ─────────────────── */
const Tooltip: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      position: 'absolute',
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '12px',
      background: '#1e293b',
      color: '#e2e8f0',
      fontSize: '12px',
      fontWeight: 500,
      padding: '4px 10px',
      borderRadius: '6px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  >
    {label}
    <div style={{
      position: 'absolute', right: '100%', top: '50%',
      transform: 'translateY(-50%)',
      width: 0, height: 0,
      borderTop: '5px solid transparent',
      borderBottom: '5px solid transparent',
      borderRight: '6px solid #1e293b',
    }} />
  </div>
)

/* ─── Nav Item ───────────────────────────────────────────── */
interface NavItemProps {
  item: typeof navItems[0]
  isActive: boolean
  collapsed?: boolean
  onClick?: () => void
  badgeCount?: number
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, collapsed = false, onClick, badgeCount = 0 }) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const Icon = item.icon

  return (
    <Link href={item.href} onClick={onClick} style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
      <div
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '12px 0' : '12px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
          background: isActive ? ACTIVE_BG : 'transparent',
          color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
          borderLeft: isActive && !collapsed ? '3px solid #f59e0b' : '3px solid transparent',
          position: 'relative',
        }}
        className={isActive ? '' : 'sidebar-nav-inactive'}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Icon size={20} />
          {/* Badge on icon (collapsed view) */}
          {collapsed && badgeCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#E74C3C', color: '#fff',
              fontSize: '9px', fontWeight: 700,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{badgeCount > 99 ? '99+' : badgeCount}</span>
          )}
        </div>
        {!collapsed && (
          <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', flex: 1 }}>
            {item.label}
          </span>
        )}
        {/* Badge on label (expanded view) */}
        {!collapsed && badgeCount > 0 && (
          <span style={{
            background: '#E74C3C', color: '#fff',
            fontSize: '10px', fontWeight: 700,
            padding: '1px 6px', borderRadius: '999px',
            marginLeft: 'auto', flexShrink: 0,
          }}>{badgeCount > 99 ? '99+' : badgeCount}</span>
        )}
        {collapsed && showTooltip && <Tooltip label={item.label} />}
      </div>
    </Link>
  )
}

/* ─── Logo ───────────────────────────────────────────────── */
const Logo: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => (
  <div style={{ padding: '24px', borderBottom: SIDEBAR_BORDER, flexShrink: 0 }}>
    <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#000', fontWeight: 700, fontSize: '12px' }}>MLV</span>
      </div>
      {!collapsed && (
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px', margin: 0 }}>MLV</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>PG Services</p>
        </div>
      )}
    </Link>
  </div>
)

/* ─── Logout Button ──────────────────────────────────────── */
const LogoutBtn: React.FC<{ collapsed?: boolean; onLogout: () => void }> = ({ collapsed = false, onLogout }) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  return (
    <div style={{ padding: '16px', borderTop: SIDEBAR_BORDER, flexShrink: 0 }}>
      <button
        onClick={onLogout}
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '12px 0' : '12px 16px',
          borderRadius: '8px',
          border: 'none',
          background: 'transparent',
          color: '#9ca3af',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
          position: 'relative',
        }}
        className="sidebar-logout-btn"
      >
        <LogOut size={20} style={{ flexShrink: 0 }} />
        {!collapsed && <span style={{ fontSize: '14px', fontWeight: 500 }}>Logout</span>}
        {collapsed && showTooltip && <Tooltip label="Logout" />}
      </button>
    </div>
  )
}

/* ─── Sidebar inner content (reused in all three variants) ── */
const SidebarContent: React.FC<{
  collapsed?: boolean
  pathname: string
  onNavClick?: () => void
  onLogout: () => void
  showCloseBtn?: boolean
  onClose?: () => void
  pendingComplaints?: number
}> = ({ collapsed = false, pathname, onNavClick, onLogout, showCloseBtn = false, onClose, pendingComplaints = 0 }) => (
  <>
    {showCloseBtn && (
      <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 12px 0', flexShrink: 0 }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', color: '#9ca3af',
            cursor: 'pointer', padding: '6px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>
    )}
    <Logo collapsed={collapsed} />
    <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '16px 8px' : '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          isActive={pathname === item.href}
          collapsed={collapsed}
          onClick={onNavClick}
          badgeCount={item.badge ? pendingComplaints : 0}
        />
      ))}
    </nav>
    <LogoutBtn collapsed={collapsed} onLogout={onLogout} />
  </>
)

/* ─── Main Sidebar Component ─────────────────────────────── */
export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const supabase = createClient()
  const { mobileOpen, closeMobileSidebar, toggleMobileSidebar } = useUIStore()
  const { logout } = useAuthStore()
  const [pendingComplaints, setPendingComplaints] = React.useState(0)

  React.useEffect(() => {
    fetch('/api/complaints?status=pending')
      .then(r => r.json())
      .then(j => setPendingComplaints((j.data ?? []).length))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    window.location.href = '/'
  }

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobileSidebar()
  }, [pathname])

  const sidebarBase: React.CSSProperties = {
    background: SIDEBAR_BG,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  }

  return (
    <>
      {/* ── CSS hover & responsive rules ── */}
      <style>{`
        a { text-decoration: none; }
        .sidebar-nav-inactive:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #d1d5db !important;
        }
        .sidebar-logout-btn:hover {
          background: rgba(239,68,68,0.1) !important;
          color: #ef4444 !important;
        }
        /* Tablet hover-expand */
        .tablet-sidebar {
          transition: width 0.25s ease;
          overflow: visible !important;
        }
        .tablet-sidebar .nav-item-inner {
          transition: padding 0.25s ease, gap 0.25s ease, justify-content 0.25s ease;
        }
        .tablet-sidebar:hover {
          width: 240px !important;
        }
        .tablet-sidebar:hover .nav-label,
        .tablet-sidebar:hover .logo-text,
        .tablet-sidebar:hover .logout-text {
          display: block !important;
        }
        .tablet-sidebar:hover .nav-item-inner {
          justify-content: flex-start !important;
          padding: 12px 16px !important;
          gap: 12px !important;
        }
        .tablet-sidebar:hover .logout-inner {
          justify-content: flex-start !important;
          padding: 12px 16px !important;
          gap: 12px !important;
        }

        /* ── Mobile (<768px) ── */
        @media (max-width: 767px) {
          .mobile-hamburger  { display: flex !important; }
          .mobile-backdrop   { display: block !important; }
          .mobile-drawer     { display: flex !important; }
          .tablet-sidebar    { display: none !important; }
          .desktop-sidebar   { display: none !important; }
        }
        /* ── Tablet (768–1023px) ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-hamburger  { display: none !important; }
          .mobile-backdrop   { display: none !important; }
          .mobile-drawer     { display: none !important; }
          .tablet-sidebar    { display: flex !important; }
          .desktop-sidebar   { display: none !important; }
        }
        /* ── Desktop (1024px+) ── */
        @media (min-width: 1024px) {
          .mobile-hamburger  { display: none !important; }
          .mobile-backdrop   { display: none !important; }
          .mobile-drawer     { display: none !important; }
          .tablet-sidebar    { display: none !important; }
          .desktop-sidebar   { display: flex !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          MOBILE (<768px): Hamburger + Drawer
      ══════════════════════════════════════ */}

      {/* Mobile hamburger — top-left, fixed */}
      <button
        onClick={toggleMobileSidebar}
        aria-label="Open menu"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1100,
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="mobile-hamburger"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileSidebar}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 1050,
              display: 'none',
            }}
            className="mobile-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-drawer"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'tween', duration: 0.25 }}
            style={{
              ...sidebarBase,
              position: 'fixed',
              left: 0, top: 0,
              width: 260,
              zIndex: 1100,
              display: 'none',
              borderRight: SIDEBAR_BORDER,
            }}
            className="mobile-drawer"
          >
            <SidebarContent
              collapsed={false}
              pathname={pathname}
              onNavClick={closeMobileSidebar}
              onLogout={handleLogout}
              showCloseBtn
              onClose={closeMobileSidebar}
              pendingComplaints={pendingComplaints}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          TABLET (768–1023px): Icon-only, hover expands
      ══════════════════════════════════════ */}
      <aside
        style={{
          ...sidebarBase,
          position: 'fixed',
          left: 0, top: 0,
          width: 64,
          zIndex: 1000,
          display: 'none',
          borderRight: SIDEBAR_BORDER,
          overflow: 'visible',
        }}
        className="tablet-sidebar"
      >
        {/* Logo icon-only */}
        <div style={{ padding: '24px 12px', borderBottom: SIDEBAR_BORDER, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#000', fontWeight: 700, fontSize: '12px' }}>MLV</span>
            </div>
            <div className="logo-text" style={{ display: 'none', minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px', margin: 0, whiteSpace: 'nowrap' }}>MLV</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>PG Services</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const [showTooltip, setShowTooltip] = React.useState(false)
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
                <div
                  className={`nav-item-inner ${isActive ? '' : 'sidebar-nav-inactive'}`.trim()}
                  onMouseEnter={(e) => {
                    const sidebar = e.currentTarget.closest('.tablet-sidebar') as HTMLElement
                    if (sidebar && sidebar.offsetWidth <= 70) setShowTooltip(true)
                  }}
                  onMouseLeave={() => setShowTooltip(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                    padding: '12px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                    background: isActive ? ACTIVE_BG : 'transparent',
                    color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                    borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  <span
                    className="nav-label"
                    style={{ display: 'none', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '12px' }}
                  >
                    {item.label}
                  </span>
                  {showTooltip && <Tooltip label={item.label} />}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 8px', borderTop: SIDEBAR_BORDER, flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 0, padding: '12px 0',
              borderRadius: '8px', border: 'none', background: 'transparent',
              color: '#9ca3af', cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
            }}
            className="sidebar-logout-btn nav-item-inner logout-inner"
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <span
              className="logout-text"
              style={{ display: 'none', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '12px' }}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          DESKTOP (1024px+): Always-visible fixed sidebar
      ══════════════════════════════════════ */}
      <aside
        style={{
          ...sidebarBase,
          position: 'fixed',
          left: 0, top: 0,
          width: 260,
          zIndex: 1000,
          display: 'none',
          borderRight: SIDEBAR_BORDER,
        }}
        className="desktop-sidebar"
      >
        <SidebarContent
          collapsed={false}
          pathname={pathname}
          onLogout={handleLogout}
          pendingComplaints={pendingComplaints}
        />
      </aside>
    </>
  )
}

