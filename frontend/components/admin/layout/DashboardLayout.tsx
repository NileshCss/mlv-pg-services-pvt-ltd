'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

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
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      <style>{`
        /* ── Mobile (<768px): no sidebar space, top padding for hamburger ── */
        @media (max-width: 767px) {
          .dashboard-main {
            margin-left: 0 !important;
          }
          .dashboard-content {
            padding: 72px 16px 32px 16px !important;
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
