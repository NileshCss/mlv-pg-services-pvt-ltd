'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Bell, X, CheckCircle, AlertCircle, MessageSquare, CreditCard, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'

interface Notification {
  id: string
  type: 'registration' | 'complaint' | 'payment' | 'overdue'
  title: string
  message: string
  time: Date
  read: boolean
}

const TYPE_CONFIG = {
  registration: { icon: UserPlus,      color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  complaint:    { icon: MessageSquare, color: 'text-red-400',    bg: 'bg-red-500/10' },
  payment:      { icon: CreditCard,    color: 'text-green-400',  bg: 'bg-green-500/10' },
  overdue:      { icon: AlertCircle,   color: 'text-orange-400', bg: 'bg-orange-500/10' },
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const addNotification = (n: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      time: new Date(),
      read: false,
    }
    setNotifications(prev => [newNotif, ...prev].slice(0, 20))
    // Play subtle sound / browser notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`MLV PG — ${n.title}`, { body: n.message, icon: '/images/logo.png' })
    }
  }

  useEffect(() => {
    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const channel = supabase
      .channel('admin-notifications')
      // New pre-registration submitted
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pre_registrations',
      }, payload => {
        const data = payload.new as any
        addNotification({
          type: 'registration',
          title: 'New Registration',
          message: `${data.full_name} (${data.phone}) applied for a room`,
        })
      })
      // Complaint raised
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'complaints',
      }, payload => {
        const data = payload.new as any
        addNotification({
          type: 'complaint',
          title: 'New Complaint',
          message: `${data.student_name} raised a ${data.category} complaint`,
        })
      })
      // Payment received
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
      }, payload => {
        const data = payload.new as any
        addNotification({
          type: 'payment',
          title: 'Payment Received',
          message: `₹${data.amount?.toLocaleString('en-IN')} payment recorded`,
        })
      })
      .subscribe()

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [supabase])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
    setOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(o => !o)
          if (!open) markAllRead()
        }}
        className="relative p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0F1629] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <span className="text-sm font-bold text-white">Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-[11px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle size={20} className="text-green-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-300">All caught up!</p>
                  <p className="text-xs text-gray-600 mt-1">New registrations, complaints and payments will appear here in real-time.</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const cfg = TYPE_CONFIG[notif.type]
                  const Icon = cfg.icon
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${!notif.read ? 'bg-amber-500/[0.03]' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-[11px] text-gray-600 mt-1">{timeAgo(notif.time)}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
