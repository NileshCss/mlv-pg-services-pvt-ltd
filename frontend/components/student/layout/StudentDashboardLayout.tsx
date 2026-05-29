'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, User, Home, CreditCard, Receipt, History,
  FileText, RefreshCcw, MessageSquare, Bell, FolderOpen, Shield,
  Menu, X, LogOut, GraduationCap, ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C9A84C'
const GOLD_LIGHT = 'rgba(201,168,76,0.1)'
const GOLD_BORDER = 'rgba(201,168,76,0.25)'

interface MenuItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Overview',          href: '/student/dashboard',    icon: LayoutDashboard },
  { label: 'My Profile',        href: '/student/profile',      icon: User },
  { label: 'Room Information',  href: '/student/room',         icon: Home },
  { label: 'Fee Details',       href: '/student/fees',         icon: CreditCard },
  { label: 'Installments',      href: '/student/installments', icon: Receipt },
  { label: 'Payment History',   href: '/student/payments',     icon: History },
  { label: 'Rental Agreement',  href: '/student/agreement',    icon: FileText },
  { label: 'Renewal Requests',  href: '/student/renewals',     icon: RefreshCcw },
  { label: 'Complaints',        href: '/student/complaints',   icon: MessageSquare },
  { label: 'Notice Board',      href: '/student/notices',      icon: Bell },
  { label: 'Documents',         href: '/student/documents',    icon: FolderOpen },
  { label: 'Security Settings', href: '/student/security',     icon: Shield },
]

interface StudentSidebarProps {
  studentName: string
  studentId: string
  onClose?: () => void
}

function StudentSidebar({ studentName, studentId, onClose }: StudentSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/student-login')
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#FFFFFF', borderRight: '1px solid #EBEBF0' }}
    >
      {/* Logo / Header */}
      <div
        className="px-5 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid #EBEBF0' }}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: GOLD_LIGHT, border: `1px solid ${GOLD_BORDER}` }}
          >
            <GraduationCap size={18} style={{ color: GOLD }} />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold" style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), serif' }}>
              MLV PG
            </p>
            <p className="text-[10px]" style={{ color: '#8A8AA0' }}>Student Portal</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
            <X size={18} style={{ color: '#8A8AA0' }} />
          </button>
        )}
      </div>

      {/* Student Info */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid #EBEBF0' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: GOLD_LIGHT, border: `1px solid ${GOLD_BORDER}` }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: GOLD, color: '#1A1A2E' }}
          >
            {studentName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#1A1A2E' }}>{studentName || 'Student'}</p>
            <p className="text-xs truncate" style={{ color: '#8A8AA0' }}>{studentId || 'Loading…'}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
              style={{
                background: isActive ? GOLD_LIGHT : 'transparent',
                color: isActive ? GOLD : '#4A4A6A',
                borderLeft: isActive ? `3px solid ${GOLD}` : '3px solid transparent',
              }}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: GOLD, color: '#1A1A2E' }}
                >
                  {item.badge}
                </span>
              ) : null}
              {isActive && <ChevronRight size={14} className="flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #EBEBF0' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-50"
          style={{ color: '#EF4444' }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}

interface StudentDashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function StudentDashboardLayout({ children, title }: StudentDashboardLayoutProps) {
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/student-login')
        return
      }
      const role = session.user.app_metadata?.role
      if (role !== 'student') {
        await supabase.auth.signOut()
        router.push('/student-login')
        return
      }
      // Fetch student profile
      const { data: student } = await supabase
        .from('students')
        .select('full_name, student_id')
        .eq('user_id', session.user.id)
        .single()

      setStudentName(student?.full_name || session.user.user_metadata?.full_name || 'Student')
      setStudentId(student?.student_id || '')
      setAuthChecked(true)
    }
    checkAuth()
  }, [router, supabase])

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FDF9F3' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-3"
            style={{ borderTopColor: GOLD }} />
          <p className="text-sm" style={{ color: '#8A8AA0' }}>Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F6F1' }}>
      {/* Desktop Sidebar */}
      <div
        className="fixed top-0 left-0 bottom-0 hidden lg:block z-30"
        style={{ width: '260px' }}
      >
        <StudentSidebar studentName={studentName} studentId={studentId} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 lg:hidden"
              style={{ width: '260px' }}
            >
              <StudentSidebar studentName={studentName} studentId={studentId} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-14"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #EBEBF0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} style={{ color: '#4A4A6A' }} />
            </button>
            {title && (
              <h1 className="text-base font-bold hidden sm:block" style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), serif' }}>
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold" style={{ color: '#1A1A2E' }}>{studentName}</p>
              <p className="text-[10px]" style={{ color: '#8A8AA0' }}>{studentId}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: GOLD, color: '#1A1A2E' }}
            >
              {studentName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
