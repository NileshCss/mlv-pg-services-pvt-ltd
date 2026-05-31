'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/admin/NotificationBell'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const supabase = createClient()
  const { user, setUser, isLoading } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router, setUser])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0E1A]">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-amber-500 rounded-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0E1A' }}>
      {/* Sidebar renders with its own fixed positioning */}
      <Sidebar />

      {/* Main Content — shifts right to avoid sidebar overlap */}
      <main
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}
        className="dashboard-main"
      >
        {/* Top header bar with notification bell */}
        <div className="dashboard-topbar">
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                {user.email?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <span className="text-xs text-gray-400 hidden sm:block max-w-[140px] truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {children}
        </div>
      </main>

      <style>{`
        /* ── Topbar ── */
        .dashboard-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 12px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(15,22,41,0.6);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        /* ── Mobile (<768px): no sidebar space, top padding for hamburger ── */
        @media (max-width: 767px) {
          .dashboard-main {
            margin-left: 0 !important;
          }
          .dashboard-topbar {
            padding-left: 56px !important;
          }
          .dashboard-content {
            padding: 24px 16px 32px 16px !important;
          }
        }
        /* ── Tablet (768–1023px): leave room for 64px icon sidebar ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .dashboard-main {
            margin-left: 64px !important;
          }
          .dashboard-content {
            padding: 28px 24px 32px 24px !important;
          }
        }
        /* ── Desktop (1024px+): leave room for 260px always-visible sidebar ── */
        @media (min-width: 1024px) {
          .dashboard-main {
            margin-left: 260px !important;
          }
          .dashboard-content {
            padding: 32px 36px 32px 36px !important;
          }
        }
      `}</style>
    </div>
  )
}

