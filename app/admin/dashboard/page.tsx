'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Home, Clock, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { StatCard } from '@/components/admin/dashboard/StatCard'
import { RegistrationsChart } from '@/components/admin/dashboard/RegistrationsChart'
import { BookingStatusChart } from '@/components/admin/dashboard/BookingStatusChart'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '@/store/dashboardStore'

interface DashboardStats {
  totalRegistrations: number
  totalBookings: number
  activeResidents: number
  pendingFollowups: number
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
  new:       'bg-blue-500/20 text-blue-400',
  contacted: 'bg-purple-500/20 text-purple-400',
  confirmed: 'bg-green-500/20 text-green-400',
  rejected:  'bg-red-500/20 text-red-400',
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalBookings: 0,
    activeResidents: 0,
    pendingFollowups: 0,
  })
  const [recentRegs, setRecentRegs] = useState<RecentRegistration[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; registrations: number; bookings: number }[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const { setStats: setStoreStats, setLoadingStats } = useDashboardStore()

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true)
      setLoading(true)

      // ── Fetch all registration data ──
      const [
        { count: registrationsCount },
        { count: pendingCount },
        { data: allRegs },
        { data: recentData },
      ] = await Promise.all([
        supabase.from('pre_registrations').select('id', { count: 'exact', head: true }),
        supabase.from('pre_registrations').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('pre_registrations').select('status, created_at'),
        supabase.from('pre_registrations')
          .select('id, full_name, phone, college_name, check_in_date, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      // ── Try fetching bookings (table may not exist) ──
      let bookingsCount = 0
      let activeResidents = 0
      try {
        const { count: bc } = await supabase.from('bookings').select('id', { count: 'exact', head: true })
        bookingsCount = bc ?? 0
        const { count: ac } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'checked_in')
        activeResidents = ac ?? 0
      } catch {
        // bookings table doesn't exist yet — that's fine
        console.log('[Dashboard] bookings table not found, showing 0')
      }

      const newStats = {
        totalRegistrations: registrationsCount ?? 0,
        totalBookings: bookingsCount,
        activeResidents: activeResidents,
        pendingFollowups: pendingCount ?? 0,
      }

      setStats(newStats)
      setRecentRegs(recentData ?? [])

      // ── Build monthly chart from real registrations data ──
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return {
          label: d.toLocaleString('en-IN', { month: 'short' }),
          year: d.getFullYear(),
          m: d.getMonth(),
        }
      })

      const realMonthlyData = months.map(({ label, year, m }) => ({
        month: label,
        registrations: (allRegs ?? []).filter(r => {
          const d = new Date(r.created_at)
          return d.getMonth() === m && d.getFullYear() === year
        }).length,
        bookings: 0, // will populate once bookings table exists
      }))
      setMonthlyData(realMonthlyData)

      // ── Build registration status pie chart from real data ──
      const statusCounts: Record<string, number> = {}
      ;(allRegs ?? []).forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
      })
      const STATUS_COLORS: Record<string, string> = {
        new: '#3B82F6',
        contacted: '#8B5CF6',
        confirmed: '#10B981',
        rejected: '#EF4444',
      }
      const realStatusData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_COLORS[name] ?? '#8892AA',
      }))
      setStatusData(realStatusData)

      setStoreStats({
        ...newStats,
        monthlyTrend: 0,
        bookingTrend: 0,
        residenceTrend: 0,
        followupTrend: 0,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

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
            <p className="text-gray-400">Welcome back! Here's your PG management overview.</p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Stat Cards Row (4 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            trend={0}
            icon={BarChart3}
            color="gold"
            suffix=""
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            trend={0}
            icon={Users}
            color="blue"
            suffix=""
          />
          <StatCard
            title="Active Residents"
            value={stats.activeResidents}
            trend={0}
            icon={Home}
            color="green"
            suffix=""
          />
          <StatCard
            title="Pending Follow Ups"
            value={stats.pendingFollowups}
            trend={0}
            icon={Clock}
            color="red"
            suffix=""
          />
        </div>

        {/* Charts Section — Real Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RegistrationsChart data={monthlyData} />
          <BookingStatusChart data={statusData.length > 0 ? statusData : [{ name: 'No Data', value: 1, color: '#4A5568' }]} />
        </div>

        {/* Recent Registrations — Real Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Registrations</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest student enquiries from the website</p>
            </div>
            <a
              href="/admin/registrations"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              View all →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Name', 'Phone', 'College', 'Check-in', 'Status', 'Registered'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-amber-500 rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : recentRegs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-600 text-sm">
                      No registrations yet — new student submissions will appear here.
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
                          ? new Date(reg.check_in_date).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[reg.status] ?? STATUS_BADGE['new']}`}>
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reg.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'View Registrations', icon: '📋', href: '/admin/registrations' },
              { label: 'Manage Bookings', icon: '📅', href: '/admin/bookings' },
              { label: 'Update Rooms', icon: '🏠', href: '/admin/rooms' },
              { label: 'View Gallery', icon: '🖼️', href: '/admin/gallery' },
            ].map((action, idx) => (
              <a
                key={idx}
                href={action.href}
                className="p-4 rounded-lg border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className="text-sm text-gray-400 group-hover:text-amber-400 transition-colors">
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
