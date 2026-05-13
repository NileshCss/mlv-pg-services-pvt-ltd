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
  const { user, setUser, setLoading, isLoading } = useAuthStore()

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0E1A', overflow: 'hidden' }}>
      {/* Sidebar (renders its own fixed positioning) */}
      <Sidebar />

      {/* Main Content — margin shifts per breakpoint to avoid sidebar overlap */}
      <main
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        className="dashboard-main"
      >
        <div style={{ minHeight: '100vh', padding: '32px' }} className="dashboard-content">
          {children}
        </div>
      </main>

      <style>{`
        /* Mobile: no left margin — hamburger adds top padding */
        @media (max-width: 767px) {
          .dashboard-main { margin-left: 0 !important; }
          .dashboard-content { padding: 70px 16px 24px !important; }
        }
        /* Tablet: match icon-only sidebar width (64px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .dashboard-main { margin-left: 64px !important; }
          .dashboard-content { padding: 24px !important; }
        }
        /* Desktop: match full sidebar width (250px) */
        @media (min-width: 1024px) {
          .dashboard-main { margin-left: 250px !important; }
          .dashboard-content { padding: 32px !important; }
        }
      `}</style>
    </div>
  )
}
