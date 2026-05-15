'use client'

import React, { useEffect, useRef } from 'react'
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
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Registrations',icon: ClipboardList,   href: '/admin/registrations' },
  { label: 'Bookings',     icon: Calendar,        href: '/admin/bookings' },
  { label: 'Food Menu',    icon: UtensilsCrossed, href: '/admin/food-menu' },
  { label: 'Rooms',        icon: Home,            href: '/admin/rooms' },
  { label: 'Gallery',      icon: Image,           href: '/admin/gallery' },
  { label: 'Testimonials', icon: Star,            href: '/admin/testimonials' },
  { label: 'Users',        icon: Users,           href: '/admin/users' },
  { label: 'Settings',     icon: Settings,        href: '/admin/settings' },
]

/* ─── Shared styles ─────────────────────────────────────── */
const SIDEBAR_BG   = '#080C18'
const SIDEBAR_BORDER = '1px solid rgba(245, 166, 35, 0.1)'
const ACTIVE_BG    = 'rgba(245, 166, 35, 0.1)'
const ACTIVE_COLOR = '#f59e0b'   // amber-400
const INACTIVE_COLOR = '#9ca3af' // gray-400

const activeClass = 'bg-amber-500/10 text-amber-400'
const inactiveClass = 'text-gray-400 hover:text-gray-300 hover:bg-white/5'

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
      zIndex: 100,
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

/* ─── Nav Item (reusable) ────────────────────────────────── */
interface NavItemProps {
  item: typeof navItems[0]
  isActive: boolean
  collapsed?: boolean
  onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, collapsed = false, onClick }) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const Icon = item.icon

  return (
    <Link href={item.href} onClick={onClick} style={{ display: 'block', position: 'relative' }}>
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
        <Icon size={20} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
        )}
        {collapsed && showTooltip && <Tooltip label={item.label} />}
      </div>
    </Link>
  )
}

/* ─── Logo ───────────────────────────────────────────────── */
const Logo: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => (
  <div style={{ padding: '24px', borderBottom: SIDEBAR_BORDER }}>
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
    <div style={{ padding: '16px', borderTop: SIDEBAR_BORDER }}>
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

/* ─── Main Sidebar Component ─────────────────────────────── */
export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const {
    mobileOpen, closeMobileSidebar, toggleMobileSidebar,
    desktopOpen, closeDesktopSidebar, toggleDesktopSidebar,
    tabletCollapsed, toggleTabletCollapsed,
  } = useUIStore()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/admin/login')
  }

  // Close all sidebars on route change
  useEffect(() => {
    closeMobileSidebar()
    closeDesktopSidebar()
  }, [pathname])

  const sidebarStyle: React.CSSProperties = {
    background: SIDEBAR_BG,
    borderRight: SIDEBAR_BORDER,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  }

  return (
    <>
      {/* ── CSS overrides for hover states ── */}
      <style>{`
        .sidebar-nav-inactive:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #d1d5db !important;
        }
        .sidebar-logout-btn:hover {
          background: rgba(239,68,68,0.1) !important;
          color: #d1d5db !important;
        }
        /* Tablet hover-expand */
        @media (min-width: 768px) and (max-width: 1023px) {
          .tablet-sidebar-group:hover .tablet-sidebar {
            width: 240px !important;
          }
          .tablet-sidebar-group:hover .tablet-sidebar .nav-label,
          .tablet-sidebar-group:hover .tablet-sidebar .logo-text,
          .tablet-sidebar-group:hover .tablet-sidebar .logout-text {
            display: block !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          MOBILE (< 768px): Hamburger + Drawer
      ══════════════════════════════════════════ */}

      {/* Hamburger button — always visible on mobile */}
      <button
        onClick={toggleMobileSidebar}
        aria-label="Open menu"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'none',
        }}
        className="mobile-hamburger"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileSidebar}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 49,
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
              ...sidebarStyle,
              position: 'fixed',
              left: 0, top: 0,
              width: 260,
              zIndex: 50,
              display: 'none',
            }}
            className="mobile-drawer"
          >
            {/* Close button — LEFT side */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 12px 0' }}>
              <button
                onClick={closeMobileSidebar}
                style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <Logo collapsed={false} />
            <nav style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  collapsed={false}
                  onClick={closeMobileSidebar}
                />
              ))}
            </nav>
            <LogoutBtn collapsed={false} onLogout={handleLogout} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          TABLET (768px – 1023px): Icon-only sidebar
          Expands to 240px on hover
      ══════════════════════════════════════════ */}
      <aside
        style={{
          ...sidebarStyle,
          position: 'fixed',
          left: 0, top: 0,
          width: 64,
          zIndex: 40,
          transition: 'width 0.25s ease',
          display: 'none',
          overflow: 'visible',
        }}
        className="tablet-sidebar"
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.width = '240px'
          el.querySelectorAll<HTMLElement>('.nav-label, .logo-text, .logout-text').forEach(n => n.style.display = 'block')
          el.querySelectorAll<HTMLElement>('.nav-item-inner').forEach(n => {
            n.style.justifyContent = 'flex-start'
            n.style.padding = '12px 16px'
            n.style.gap = '12px'
          })
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.width = '64px'
          el.querySelectorAll<HTMLElement>('.nav-label, .logo-text, .logout-text').forEach(n => n.style.display = 'none')
          el.querySelectorAll<HTMLElement>('.nav-item-inner').forEach(n => {
            n.style.justifyContent = 'center'
            n.style.padding = '12px 0'
            n.style.gap = '0'
          })
        }}
      >
        {/* Logo icon-only */}
        <div style={{ padding: '24px 12px', borderBottom: SIDEBAR_BORDER, display: 'flex', justifyContent: 'center' }}>
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

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const [showTooltip, setShowTooltip] = React.useState(false)
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', position: 'relative' }}>
                <div
                  className={`nav-item-inner ${isActive ? '' : 'sidebar-nav-inactive'}`.trim()}
                  onMouseEnter={(e) => {
                    // only show tooltip when sidebar is icon-only
                    const sidebar = e.currentTarget.closest('.tablet-sidebar') as HTMLElement
                    if (sidebar && parseInt(sidebar.style.width) <= 64) setShowTooltip(true)
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
        <div style={{ padding: '16px 8px', borderTop: SIDEBAR_BORDER }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 0, padding: '12px 0',
              borderRadius: '8px', border: 'none', background: 'transparent',
              color: '#9ca3af', cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
            }}
            className="sidebar-logout-btn nav-item-inner"
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

      {/* ══════════════════════════════════════════
          DESKTOP (1024px+): Hamburger + Drawer (hidden by default)
      ══════════════════════════════════════════ */}

      {/* Desktop Hamburger — top-left of content area */}
      <button
        onClick={toggleDesktopSidebar}
        aria-label="Open menu"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 50,
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          cursor: 'pointer',
          display: 'none',
        }}
        className="desktop-hamburger"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Backdrop */}
      <AnimatePresence>
        {desktopOpen && (
          <motion.div
            key="desktop-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDesktopSidebar}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 45,
              display: 'none',
            }}
            className="desktop-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Desktop Drawer */}
      <AnimatePresence>
        {desktopOpen && (
          <motion.aside
            key="desktop-drawer"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'tween', duration: 0.25 }}
            style={{
              ...sidebarStyle,
              position: 'fixed',
              left: 0, top: 0,
              width: 260,
              zIndex: 46,
              display: 'none',
            }}
            className="desktop-drawer"
          >
            {/* Close button — LEFT side */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 12px 0' }}>
              <button
                onClick={closeDesktopSidebar}
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
            <Logo collapsed={false} />
            <nav style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  collapsed={false}
                  onClick={closeDesktopSidebar}
                />
              ))}
            </nav>
            <LogoutBtn collapsed={false} onLogout={handleLogout} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Global responsive display rules ── */}
      <style>{`
        @media (max-width: 767px) {
          .mobile-hamburger   { display: block !important; }
          .mobile-backdrop    { display: block !important; }
          .mobile-drawer      { display: flex !important; }
          .tablet-sidebar     { display: none !important; }
          .desktop-hamburger  { display: none !important; }
          .desktop-backdrop   { display: none !important; }
          .desktop-drawer     { display: none !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-hamburger   { display: none !important; }
          .mobile-backdrop    { display: none !important; }
          .mobile-drawer      { display: none !important; }
          .tablet-sidebar     { display: flex !important; }
          .desktop-hamburger  { display: none !important; }
          .desktop-backdrop   { display: none !important; }
          .desktop-drawer     { display: none !important; }
        }
        @media (min-width: 1024px) {
          .mobile-hamburger   { display: none !important; }
          .mobile-backdrop    { display: none !important; }
          .mobile-drawer      { display: none !important; }
          .tablet-sidebar     { display: none !important; }
          .desktop-hamburger  { display: block !important; }
          .desktop-backdrop   { display: block !important; }
          .desktop-drawer     { display: flex !important; }
        }
      `}</style>
    </>
  )
}
