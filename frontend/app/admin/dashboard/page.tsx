'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  BarChart3, Users, Home, Clock, RefreshCw,
  BedDouble, TrendingUp, AlertCircle, MessageSquare,
  GraduationCap, DollarSign, CheckCircle
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { RegistrationsChart } from '@/components/admin/dashboard/RegistrationsChart'
import { BookingStatusChart } from '@/components/admin/dashboard/BookingStatusChart'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalRegistrations: number
  activeResidents: number
  vacantBeds: number
  occupiedBeds: number
  pendingApplications: number
  monthlyRevenue: number
  overduePayments: number
  openComplaints: number
}

interface RecentRegistration {
  id: string
  full_name: string
  phone: string
  college_name: string
  check_in_date: string | null
  status: string
  created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  new:          'bg-blue-500/20 text-blue-400',
  otp_verified: 'bg-purple-500/20 text-purple-400',
  deposit_paid: 'bg-amber-500/20 text-amber-400',
  under_review: 'bg-yellow-500/20 text-yellow-400',
  room_allocated:'bg-teal-500/20 text-teal-400',
  confirmed:    'bg-green-500/20 text-green-400',
  rejected:     'bg-red-500/20 text-red-400',
  contacted:    'bg-purple-500/20 text-purple-400',
}

function KpiCard({
  title, value, icon: Icon, color, sub, prefix = '', loading = false
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'teal' | 'orange'
  sub?: string
  prefix?: string
  loading?: boolean
}) {
  const colors = {
    gold:   { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: 'text-amber-400',  text: 'text-amber-400' },
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   text: 'text-blue-400' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  text: 'text-green-400' },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    text: 'text-red-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', text: 'text-purple-400' },
    teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   icon: 'text-teal-400',   text: 'text-teal-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', text: 'text-orange-400' },
  }
  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border ${c.border} bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-all group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {sub && <span className="text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      {loading ? (
        <div className="h-8 bg-white/5 rounded animate-pulse w-2/3 mb-1" />
      ) : (
        <p className="text-3xl font-bold text-white mb-1 group-hover:text-amber-50 transition-colors">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      )}
      <p className="text-xs text-gray-500 font-medium">{title}</p>
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    activeResidents: 0,
    vacantBeds: 0,
    occupiedBeds: 0,
    pendingApplications: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
    openComplaints: 0,
  })
  const [recentRegs, setRecentRegs] = useState<RecentRegistration[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; registrations: number; bookings: number }[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)

      // Start of current month
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Parallel fetch all stats
      const [
        regsResult,
        allRegsResult,
        residentsResult,
        bedsResult,
        pendingRegsResult,
        revenueResult,
        overdueResult,
        complaintsResult,
      ] = await Promise.all([
        // Recent registrations (5)
        supabase
          .from('pre_registrations')
          .select('id, full_name, phone, college_name, check_in_date, status, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5),
        // All registrations for charts
        supabase
          .from('pre_registrations')
          .select('status, created_at'),
        // Active residents count
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        // Beds stats
        supabase
          .from('beds')
          .select('status'),
        // Pending applications
        supabase
          .from('pre_registrations')
          .select('id', { count: 'exact', head: true })
          .in('status', ['new', 'otp_verified', 'deposit_paid', 'under_review']),
        // Monthly revenue
        supabase
          .from('payments')
          .select('amount')
          .gte('created_at', monthStart),
        // Overdue installments
        supabase
          .from('installments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'overdue'),
        // Open complaints
        supabase
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'in-progress']),
      ])

      // Compute bed stats
      const allBeds = bedsResult.data || []
      const vacantBeds = allBeds.filter(b => b.status === 'available').length
      const occupiedBeds = allBeds.filter(b => b.status === 'occupied').length

      // Compute monthly revenue
      const monthlyRevenue = (revenueResult.data || []).reduce((sum, p) => sum + (p.amount || 0), 0)

      setStats({
        totalRegistrations: regsResult.count ?? 0,
        activeResidents: residentsResult.count ?? 0,
        vacantBeds,
        occupiedBeds,
        pendingApplications: pendingRegsResult.count ?? 0,
        monthlyRevenue,
        overduePayments: overdueResult.count ?? 0,
        openComplaints: complaintsResult.count ?? 0,
      })

      setRecentRegs(regsResult.data ?? [])

      // Build monthly chart (last 6 months)
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return { label: d.toLocaleString('en-IN', { month: 'short' }), year: d.getFullYear(), m: d.getMonth() }
      })
      setMonthlyData(months.map(({ label, year, m }) => ({
        month: label,
        registrations: (allRegsResult.data ?? []).filter(r => {
          const d = new Date(r.created_at)
          return d.getMonth() === m && d.getFullYear() === year
        }).length,
        bookings: 0,
      })))

      // Build status pie
      const statusCounts: Record<string, number> = {}
      ;(allRegsResult.data ?? []).forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
      })
      const STATUS_COLORS: Record<string, string> = {
        new: '#3B82F6', otp_verified: '#8B5CF6', deposit_paid: '#F59E0B',
        under_review: '#EAB308', room_allocated: '#14B8A6', confirmed: '#10B981', rejected: '#EF4444',
      }
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: STATUS_COLORS[name] ?? '#8892AA',
      })))

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDashboardStats()

    // Supabase Realtime — auto-refresh stats when new registration arrives
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pre_registrations' }, () => {
        fetchDashboardStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchDashboardStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchDashboardStats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchDashboardStats, supabase])

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const QUICK_ACTIONS = [
    { label: 'View Registrations', icon: '📋', href: '/admin/registrations' },
    { label: 'Manage Students',    icon: '👥', href: '/admin/students' },
    { label: 'Update Rooms',       icon: '🏠', href: '/admin/rooms' },
    { label: 'Fee Management',     icon: '💰', href: '/admin/fee-management' },
    { label: 'Payments History',   icon: '💳', href: '/admin/payments' },
    { label: 'Complaints',         icon: '❗', href: '/admin/complaints' },
    { label: 'Notice Board',       icon: '📢', href: '/admin/notice-board' },
    { label: 'Reports',            icon: '📊', href: '/admin/reports' },
  ]

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Real-time overview of your PG operations.</p>
          </div>
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 8 KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Total Registrations"   value={stats.totalRegistrations}  icon={BarChart3}      color="gold"   loading={loading} />
          <KpiCard title="Active Residents"       value={stats.activeResidents}      icon={GraduationCap}  color="green"  loading={loading} />
          <KpiCard title="Vacant Beds"            value={stats.vacantBeds}           icon={BedDouble}      color="teal"   loading={loading} sub="Available" />
          <KpiCard title="Occupied Beds"          value={stats.occupiedBeds}         icon={Home}           color="blue"   loading={loading} sub="In use" />
          <KpiCard title="Pending Applications"  value={stats.pendingApplications}  icon={Clock}          color="orange" loading={loading} />
          <KpiCard title="Monthly Revenue"        value={fmtCurrency(stats.monthlyRevenue)} icon={TrendingUp} color="gold" loading={loading} />
          <KpiCard title="Overdue Payments"       value={stats.overduePayments}      icon={AlertCircle}    color="red"    loading={loading} />
          <KpiCard title="Open Complaints"        value={stats.openComplaints}       icon={MessageSquare}  color="purple" loading={loading} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RegistrationsChart data={monthlyData} />
          <BookingStatusChart data={statusData.length > 0 ? statusData : [{ name: 'No Data', value: 1, color: '#4A5568' }]} />
        </div>

        {/* Recent Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Registrations</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest student enquiries — updates in real-time</p>
            </div>
            <a href="/admin/registrations" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
              <thead className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-b border-amber-500/15">
                <tr>
                  {['Name', 'Phone', 'College', 'Check-in', 'Status', 'Registered'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/80 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentRegs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-600 text-sm">
                      No registrations yet — new student submissions will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  recentRegs.map(reg => (
                    <tr key={reg.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">{reg.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{reg.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{reg.college_name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {reg.check_in_date
                          ? new Date(reg.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[reg.status] ?? STATUS_BADGE['new']}`}>
                          {reg.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions — 8 tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, idx) => (
              <a
                key={idx}
                href={action.href}
                className="p-4 rounded-xl border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className="text-sm text-gray-400 group-hover:text-amber-400 transition-colors leading-tight">
                  {action.label}
                </p>
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
