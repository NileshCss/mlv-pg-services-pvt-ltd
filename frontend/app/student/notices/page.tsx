'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Bell } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import type { Notice, NoticeType } from '@/types/student'

const GOLD = '#C9A84C'
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const TYPE_CONFIG: Record<NoticeType, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  events: { label: 'Event', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  maintenance: { label: 'Maintenance', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  general: { label: 'General', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
}

const FILTERS: { value: NoticeType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: '🚨 Urgent' },
  { value: 'general', label: '📢 General' },
  { value: 'events', label: '🎉 Events' },
  { value: 'maintenance', label: '🔧 Maintenance' },
]

export default function NoticesPage() {
  const supabase = createClient()
  const [notices, setNotices] = useState<Notice[]>([])
  const [filter, setFilter] = useState<NoticeType | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      let query = supabase.from('notices').select('*').eq('is_active', true).in('target_role', ['all', 'student']).order('created_at', { ascending: false })
      const { data } = await query
      setNotices(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const filtered = filter === 'all' ? notices : notices.filter(n => n.type === filter)

  return (
    <StudentDashboardLayout title="Notice Board">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => (
            <button key={value} onClick={() => setFilter(value)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === value ? GOLD : '#F0EEE8',
                color: filter === value ? '#1A1A2E' : '#4A4A6A',
                border: filter === value ? `1px solid ${GOLD}` : '1px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Notices */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" style={{ border: '1px solid #EBEBF0' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #EBEBF0' }}>
            <Bell size={40} className="mx-auto mb-3" style={{ color: '#C4C4D0' }} />
            <p className="font-semibold" style={{ color: '#1A1A2E' }}>No notices</p>
            <p className="text-sm mt-1" style={{ color: '#8A8AA0' }}>There are no {filter !== 'all' ? filter : ''} notices at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notice, idx) => {
              const cfg = TYPE_CONFIG[notice.type] || TYPE_CONFIG.general
              return (
                <motion.div key={notice.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl p-5"
                  style={{
                    border: notice.type === 'urgent' ? '1px solid rgba(239,68,68,0.3)' : '1px solid #EBEBF0',
                    boxShadow: notice.type === 'urgent' ? '0 2px 12px rgba(239,68,68,0.06)' : '0 2px 12px rgba(0,0,0,0.04)',
                  }}>
                  <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <h3 className="text-sm font-bold" style={{ color: '#1A1A2E' }}>{notice.title}</h3>
                    </div>
                    <p className="text-xs flex-shrink-0" style={{ color: '#8A8AA0' }}>{fmtDate(notice.created_at)}</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#4A4A6A' }}>{notice.content}</p>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  )
}
