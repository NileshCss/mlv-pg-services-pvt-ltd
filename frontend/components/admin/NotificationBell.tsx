'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Bell, X, CheckCircle, AlertCircle, MessageSquare, CreditCard, UserPlus, Star, GraduationCap, Home, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'registration' | 'complaint' | 'payment' | 'contact' | 'review' | 'student' | 'room' | 'building' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  read_status: boolean
  created_at: string
}

const TYPE_CONFIG = {
  registration: { icon: UserPlus,      color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  complaint:    { icon: MessageSquare, color: 'text-red-400',    bg: 'bg-red-500/10' },
  payment:      { icon: CreditCard,    color: 'text-green-400',  bg: 'bg-green-500/10' },
  contact:      { icon: Mail,          color: 'text-purple-400', bg: 'bg-purple-500/10' },
  review:       { icon: Star,          color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  student:      { icon: GraduationCap, color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  room:         { icon: Home,          color: 'text-teal-400',   bg: 'bg-teal-500/10' },
  building:     { icon: Home,          color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  system:       { icon: AlertCircle,   color: 'text-orange-400', bg: 'bg-orange-500/10' },
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/** Play a high-end, synthetic chime sound using Web Audio API */
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    
    // Primary bell pitch
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 Note
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12) // E6 Note
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch (err) {
    console.warn('[Chime Synth] Audio context blocked by browser user gesture policies:', err)
  }
}

export function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchLatestNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications?page=1&limit=10')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.data || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err)
    }
  }

  useEffect(() => {
    fetchLatestNotifications()

    // ── Supabase Realtime Subscription ────────────────────────
    const channel = supabase
      .channel('realtime-admin-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, payload => {
        const newNotif = payload.new as Notification
        
        // 1. Play premium dynamic audio chime
        playChime()

        // 2. Add toast alert
        toast.info(newNotif.title, {
          description: newNotif.message,
          action: {
            label: 'View',
            onClick: () => { window.location.href = '/admin/notifications' }
          }
        })

        // 3. Force refetch to populate preview lists
        fetchLatestNotifications()

        // 4. Send browser system notification if enabled
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`MLV PG — ${newNotif.title}`, { body: newNotif.message, icon: '/images/logo.png' })
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
      }, () => {
        // Refetch when read states are updated
        fetchLatestNotifications()
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
      }, () => {
        // Refetch when items are deleted
        fetchLatestNotifications()
      })
      .subscribe()

    // Request system notifications permissions
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Close on outside clicks
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

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read_status: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    } catch {
      toast.error('Failed to mark notifications as read')
    }
  }

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

  const clearAllRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications?clearRead=true', {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchLatestNotifications()
        toast.success('Read notification history cleared')
      }
    } catch {
      toast.error('Failed to clear read logs')
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center justify-center"
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
                <Bell size={16} className="text-[#C8840A]" />
                <span className="text-sm font-bold text-white font-serif">Alert Logs</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-gray-500 hover:text-[#C8840A] transition-colors font-semibold"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.some(n => n.read_status) && (
                  <button
                    onClick={clearAllRead}
                    className="text-[10px] text-gray-500 hover:text-red-400 transition-colors font-semibold"
                  >
                    Clear read
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[360px] overflow-y-auto scrollbar-none">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle size={20} className="text-green-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-300 font-serif">All caught up!</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-[240px] leading-relaxed">No new alerts. Database notifications will appear here instantly in real-time.</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
                  const Icon = cfg.icon
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkSingleRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer relative ${!notif.read_status ? 'bg-amber-500/[0.02]' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                          <span className={`text-[9px] font-semibold px-1 py-0.5 rounded capitalize ${
                            notif.priority === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            notif.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            {notif.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed break-words">{notif.message}</p>
                        <p className="text-[10px] text-gray-600 mt-1.5">{timeAgo(notif.created_at)}</p>
                      </div>
                      {!notif.read_status && (
                        <div className="w-1.5 h-1.5 bg-[#C8840A] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer View All */}
            <div className="p-2 border-t border-white/8 bg-black/15 text-center">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="inline-block text-xs font-semibold text-[#C8840A] hover:text-white transition-all py-1 w-full"
              >
                View All Notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
