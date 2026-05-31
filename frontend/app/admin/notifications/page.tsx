'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, Search, Filter, RefreshCw, Trash2, CheckCircle2, AlertTriangle, MessageSquare, CreditCard, GraduationCap, Mail, Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'registration' | 'complaint' | 'payment' | 'contact' | 'review' | 'student' | 'room' | 'building' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  read_status: boolean
  email_sent: boolean
  whatsapp_sent: boolean
  created_at: string
}

const TYPE_CONFIG = {
  registration: { icon: UserPlusIcon,   color: 'text-blue-400',   bg: 'bg-blue-500/10',    label: 'Registration' },
  complaint:    { icon: MessageSquare,  color: 'text-red-400',    bg: 'bg-red-500/10',     label: 'Complaint' },
  payment:      { icon: CreditCard,     color: 'text-green-400',  bg: 'bg-green-500/10',   label: 'Payment' },
  contact:      { icon: Mail,           color: 'text-purple-400', bg: 'bg-purple-500/10',  label: 'Contact Form' },
  review:       { icon: Star,           color: 'text-yellow-400', bg: 'bg-yellow-500/10',  label: 'Student Review' },
  student:      { icon: GraduationCap,  color: 'text-amber-400',  bg: 'bg-amber-500/10',   label: 'Student Portal' },
  room:         { icon: HomeIcon,       color: 'text-teal-400',   bg: 'bg-teal-500/10',    label: 'Room Allocation' },
  building:     { icon: HomeIcon,       color: 'text-indigo-400', bg: 'bg-indigo-500/10',  label: 'Building Update' },
  system:       { icon: AlertTriangle,  color: 'text-orange-400', bg: 'bg-orange-500/10',  label: 'System Alert' },
}

// Inline fallback icons for safety
function UserPlusIcon(props: any) {
  return <GraduationCap {...props} />
}
function HomeIcon(props: any) {
  return <HomeIconSub {...props} />
}
function HomeIconSub(props: any) {
  return <span className={props.className}>🏠</span>
}

export default function NotificationsPage() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'registration' | 'complaint' | 'payment' | 'review' | 'system'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const url = `/api/admin/notifications?page=${page}&limit=${limit}&type=${activeTab}&priority=${priorityFilter}&readStatus=${readFilter}&search=${encodeURIComponent(search)}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.data || [])
        setTotalCount(data.count || 0)
        setUnreadCount(data.unreadCount || 0)
        setTotalPages(Math.ceil((data.count || 0) / limit))
      }
    } catch {
      toast.error('Failed to load system notification history')
    } finally {
      setLoading(false)
    }
  }, [page, activeTab, priorityFilter, readFilter, search])

  useEffect(() => {
    fetchNotifications()

    // ── Supabase Realtime Auto-refresh ────────────────────────
    const channel = supabase
      .channel('realtime-admin-logs-center')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
      }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [activeTab, priorityFilter, readFilter, search])

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.warn('Failed to mark read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true)
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })
      if (res.ok) {
        toast.success('All notifications marked as read')
        fetchNotifications()
      }
    } catch {
      toast.error('Failed to update logs')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this notification log permanently?')) return
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Notification log deleted')
        fetchNotifications()
      }
    } catch {
      toast.error('Failed to delete log')
    }
  }

  const handleClearReadHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all read notification history logs?')) return
    try {
      setActionLoading(true)
      const res = await fetch('/api/admin/notifications?clearRead=true', {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Read notification history deleted successfully')
        fetchNotifications()
      }
    } catch {
      toast.error('Failed to clear logs')
    } finally {
      setActionLoading(false)
    }
  }

  const getActionRedirect = (type: string) => {
    switch (type) {
      case 'registration': return '/admin/registrations'
      case 'complaint': return '/admin/complaints'
      case 'payment': return '/admin/payments'
      case 'review': return '/admin/testimonials'
      case 'student': return '/admin/students'
      case 'room': return '/admin/rooms'
      default: return '/admin/dashboard'
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 font-serif">Notification Center</h1>
            <p className="text-gray-400 text-sm">Real-time persistent audit logs of registrations, payments, and student activities</p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || actionLoading}
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-gray-300 hover:bg-white/[0.12] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={handleClearReadHistory}
              disabled={actionLoading}
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 active:scale-95 transition-all text-xs font-semibold flex items-center gap-2"
            >
              <Trash2 size={15} />
              <span>Clear Read Logs</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Unread Alerts', value: unreadCount, color: '#C8840A', icon: Bell },
            { label: 'Total Logs', value: totalCount, color: '#9CA3AF', icon: Filter },
            { label: 'Registrations', value: notifications.filter(n => n.type === 'registration').length, color: '#3B82F6', icon: GraduationCap },
            { label: 'Pending Complaints', value: notifications.filter(n => n.type === 'complaint' && !n.read_status).length, color: '#EF4444', icon: MessageSquare },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold font-serif" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400">
                <stat.icon size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-white/5 bg-[#0F1629]/60 backdrop-blur-md">
          {/* Categories Tab Bar */}
          <div className="admin-tab-bar mb-0">
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'registration', label: 'Registrations' },
              { id: 'complaint', label: 'Complaints' },
              { id: 'payment', label: 'Payments' },
              { id: 'review', label: 'Reviews' },
              { id: 'system', label: 'System Warnings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={activeTab === tab.id ? 'active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Dropdown filters */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <input
                type="text"
                placeholder="Search logs by keyword title or message details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
            </div>

            {/* Dropdowns */}
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as any)}
                className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 font-semibold focus:border-[#C8840A]/50 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={readFilter}
                onChange={e => setReadFilter(e.target.value as any)}
                className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 font-semibold focus:border-[#C8840A]/50 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All States</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              <button
                onClick={fetchNotifications}
                className="px-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                title="Refresh logs"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Listing */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <RefreshCw size={24} className="animate-spin text-[#C8840A]" />
            <span className="text-xs">Loading operational alerts log...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/5 bg-[#0F1629]/40 backdrop-blur-md max-w-md mx-auto">
            <Bell size={40} className="mx-auto mb-3 opacity-30 text-gray-400" />
            <h3 className="font-serif font-bold text-white text-base">No notifications matched</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-[280px] mx-auto leading-relaxed">
              No audit logs matches your specific filter constraints. Toggle the tabs or search keywords to refine search.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table Wrapper */}
            <div className="admin-table-wrapper">
              <div className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(200,132,10,0.1)' }}>
                      {['Priority', 'Type', 'Alert Notification Details', 'Dispatches', 'Action Logs'].map(h => (
                        <th
                          key={h}
                          style={{
                            padding: '12px 18px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map(notif => {
                      const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
                      const Icon = cfg.icon
                      return (
                        <tr
                          key={notif.id}
                          onClick={() => handleMarkSingleRead(notif.id)}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${!notif.read_status ? 'bg-amber-500/[0.01]' : ''}`}
                        >
                          {/* Priority */}
                          <td className="px-4 py-4 text-xs">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                              notif.priority === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              notif.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                              notif.priority === 'medium' ? 'bg-[#C8840A]/10 text-[#C8840A] border border-[#C8840A]/20' :
                              'bg-white/5 text-gray-400 border border-white/10'
                            }`}>
                              {notif.priority}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-4 text-xs font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span className={`h-6 w-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                <Icon size={12} className={cfg.color} />
                              </span>
                              <span>{cfg.label}</span>
                            </div>
                          </td>

                          {/* Details */}
                          <td className="px-4 py-4 text-xs max-w-md">
                            <div className="flex flex-col gap-0.5">
                              <p className={`font-semibold text-sm ${!notif.read_status ? 'text-white' : 'text-gray-400'}`}>{notif.title}</p>
                              <p className="text-gray-500 leading-relaxed break-words">{notif.message}</p>
                              <span className="text-[10px] text-gray-600 mt-1">{new Date(notif.created_at).toLocaleString('en-IN')}</span>
                            </div>
                          </td>

                          {/* Dispatches */}
                          <td className="px-4 py-4 text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                notif.email_sent ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/10'
                              }`}>
                                EMAIL
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                notif.whatsapp_sent ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/10'
                              }`}>
                                WHATSAPP
                              </span>
                            </div>
                          </td>

                          {/* Action Logs */}
                          <td className="px-4 py-4 text-xs text-right">
                            <div className="flex items-center gap-2.5 justify-end">
                              <a
                                href={getActionRedirect(notif.type)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-[#C8840A] hover:border-[#C8840A]/20 transition-all"
                                title="Go to module panel"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button
                                onClick={(e) => handleDeleteSingle(e, notif.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                                title="Delete log"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards stack fallback */}
            <div className="admin-mobile-card space-y-4">
              {notifications.map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
                const Icon = cfg.icon
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkSingleRead(notif.id)}
                    className={`p-4 rounded-xl border border-white/5 bg-[#0F1629]/50 space-y-3 ${!notif.read_status ? 'border-[#C8840A]/20' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-6 w-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                          <Icon size={12} className={cfg.color} />
                        </span>
                        <span className="text-xs font-bold text-white">{cfg.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize ${
                        notif.priority === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        notif.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-white/5 text-gray-400 border border-white/10'
                      }`}>
                        {notif.priority}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${!notif.read_status ? 'text-white' : 'text-gray-300'}`}>{notif.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>
                      <span className="block text-[9px] text-gray-600 pt-1">{new Date(notif.created_at).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold border ${
                          notif.email_sent ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/10'
                        }`}>
                          EMAIL
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold border ${
                          notif.whatsapp_sent ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/10'
                        }`}>
                          WHATSAPP
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={getActionRedirect(notif.type)}
                          className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ExternalLink size={10} />
                        </a>
                        <button
                          onClick={(e) => handleDeleteSingle(e, notif.id)}
                          className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <span>Delete</span>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0F1629]/40 backdrop-blur-md">
                <p className="text-xs text-gray-500">
                  Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} total alerts)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
