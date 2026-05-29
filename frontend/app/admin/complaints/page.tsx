'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  Search, Filter, RefreshCw, Eye, CheckCircle, Trash2,
  MessageCircle, AlertTriangle, Clock, TrendingUp,
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { toast } from 'sonner'

/* ─── Types ──────────────────────────────────────────────── */
interface Complaint {
  id: string
  complaint_id: string
  student_name: string
  room_number: string
  phone: string
  category: string
  details: string
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'resolved'
  photo_url?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

/* ─── Constants ─────────────────────────────────────────── */
const URGENCY_CONFIG = {
  low:    { label: 'Low',          emoji: '🟢', color: '#2ECC71', bg: 'rgba(46,204,113,0.12)'  },
  medium: { label: 'Medium',       emoji: '🟡', color: '#F39C12', bg: 'rgba(243,156,18,0.12)'  },
  high:   { label: 'High / Urgent',emoji: '🔴', color: '#E74C3C', bg: 'rgba(231,76,60,0.12)'   },
}
const STATUS_CONFIG = {
  pending:     { label: 'Pending',     emoji: '⏳', color: '#F39C12', bg: 'rgba(243,156,18,0.15)'  },
  'in-progress':{ label: 'In Progress', emoji: '🔄', color: '#3498DB', bg: 'rgba(52,152,219,0.15)'  },
  resolved:    { label: 'Resolved',    emoji: '✅', color: '#2ECC71', bg: 'rgba(46,204,113,0.15)'  },
}
const CATEGORIES = [
  'All Categories','Food Quality','Room Cleanliness','WiFi / Internet',
  'Electricity / Power','Water Supply','Security Issue','Staff Behaviour','Maintenance','Other',
]

/* ─── Detail Modal ───────────────────────────────────────── */
const DetailModal: React.FC<{
  complaint: Complaint | null
  onClose: () => void
  onUpdate: (id: string, status: string, notes: string) => Promise<void>
}> = ({ complaint, onClose, onUpdate }) => {
  const [notes,   setNotes]   = useState(complaint?.admin_notes || '')
  const [status,  setStatus]  = useState(complaint?.status || 'pending')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    setNotes(complaint?.admin_notes || '')
    setStatus(complaint?.status || 'pending')
  }, [complaint])

  if (!complaint) return null

  const urgency = URGENCY_CONFIG[complaint.urgency]
  const statusCfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

  const waReply = () => {
    const ph = complaint.phone.replace(/\D/g, '')
    const msg = `Dear ${complaint.student_name}, your complaint ${complaint.complaint_id} regarding "${complaint.category}" has been received and is being addressed. Expected resolution: 24 hours.\n- MLV PG Team`
    window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleSave = async () => {
    setSaving(true)
    try { await onUpdate(complaint.id, status, notes) } finally { setSaving(false) }
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 9001, width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto',
        background: '#0F1629', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        fontFamily: 'Inter, sans-serif',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '17px', fontWeight: 700 }}>
              Complaint {complaint.complaint_id}
            </h3>
            <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '12px' }}>
              {new Date(complaint.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '8px', borderRadius: '8px', fontSize: '18px', lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Student info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Student',  value: complaint.student_name },
              { label: 'Room',     value: complaint.room_number },
              { label: 'Phone',    value: complaint.phone },
              { label: 'Category', value: complaint.category },
            ].map(f => (
              <div key={f.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                <div style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Urgency badge */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: urgency.bg, color: urgency.color }}>
              {urgency.emoji} {urgency.label}
            </span>
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaint Details</div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '14px', color: '#d1d5db', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{complaint.details}"
            </div>
          </div>

          {/* Photo */}
          {complaint.photo_url && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attached Photo</div>
              <a href={complaint.photo_url} target="_blank" rel="noopener noreferrer"
                style={{ color: '#f59e0b', fontSize: '14px', textDecoration: 'underline' }}>
                View Image ↗
              </a>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes about this complaint…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '10px 12px',
                color: '#e5e7eb', fontSize: '13px', resize: 'vertical',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          {/* Status Toggle */}
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG['pending']][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key as any)}
                  style={{
                    flex: 1, padding: '9px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700, transition: 'all 0.2s',
                    background: status === key ? cfg.bg : 'rgba(255,255,255,0.05)',
                    color: status === key ? cfg.color : '#6b7280',
                    outline: status === key ? `1.5px solid ${cfg.color}` : '1.5px solid transparent',
                  }}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <button
              onClick={waReply}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <MessageCircle size={16} /> Reply on WhatsApp
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? '#4a3d20' : 'linear-gradient(135deg, #C9A84C, #E8C96B)',
                color: '#1A1A2E', fontWeight: 700, fontSize: '14px',
              }}
            >
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Complaint | null>(null)

  const [filterStatus,   setFilterStatus]   = useState('all')
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [filterUrgency,  setFilterUrgency]  = useState('all')
  const [search,         setSearch]         = useState('')

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/complaints?_t=${Date.now()}`)
      const json = await res.json()
      if (!res.ok || json.error) {
        console.error('[Complaints fetch error]', json.error)
        toast.error(`Failed to load complaints: ${json.error || res.statusText}`)
        setComplaints([])
      } else {
        setComplaints(json.data || [])
      }
    } catch (e) {
      console.error(e)
      toast.error('Network error — could not reach the complaints API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  const handleUpdate = async (id: string, status: string, adminNotes: string) => {
    await fetch('/api/complaints', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, adminNotes }),
    })
    fetchComplaints()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this complaint? This action cannot be undone.')) return
    await fetch(`/api/complaints?id=${id}`, { method: 'DELETE' })
    fetchComplaints()
  }

  // Stats based on ALL complaints
  const total      = complaints.length
  const pending    = complaints.filter(c => c.status === 'pending').length
  const inProgress = complaints.filter(c => c.status === 'in-progress').length
  const resolved   = complaints.filter(c => c.status === 'resolved').length

  const STAT_CARDS = [
    { label: 'Total',       value: total,      icon: TrendingUp,    color: '#f59e0b' },
    { label: 'Pending',     value: pending,    icon: Clock,         color: '#F39C12' },
    { label: 'In Progress', value: inProgress, icon: AlertTriangle, color: '#3498DB' },
    { label: 'Resolved',    value: resolved,   icon: CheckCircle,   color: '#2ECC71' },
  ]

  // Filter complaints for the table
  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    if (filterCategory !== 'All Categories' && c.category !== filterCategory) return false
    if (filterUrgency !== 'all' && c.urgency !== filterUrgency) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return c.student_name.toLowerCase().includes(q) ||
             c.room_number.toLowerCase().includes(q) ||
             c.complaint_id.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">📋 Complaints</h1>
            <p className="text-gray-400 text-sm">Manage and resolve student complaints in real time.</p>
          </div>
          <button
            onClick={fetchComplaints}
            className="p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          {/* Status Pills - scrollable row on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'pending', 'in-progress', 'resolved'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                style={{
                  background: filterStatus === s ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                  color:      filterStatus === s ? '#f59e0b' : '#9ca3af',
                  border:     filterStatus === s ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {s === 'all' ? 'All' : s === 'in-progress' ? 'In-progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Second Row: Dropdowns + Search */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 min-w-[130px] text-xs rounded-lg px-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Urgency Filter */}
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="flex-1 min-w-[110px] text-xs rounded-lg px-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
            >
              <option value="all">All Urgency</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            {/* Search - full width on its own row on very small screens */}
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-[160px]" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchComplaints()}
                placeholder="Search name, room, ID…"
                className="bg-transparent outline-none text-xs text-gray-300 w-full placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Mobile: Card List */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8 flex items-center justify-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-700 border-t-amber-500 rounded-full animate-spin" />
              Loading complaints…
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-gray-600 text-sm">
              No complaints found. Adjust your filters or wait for new submissions.
            </div>
          ) : (
            filteredComplaints.map(c => {
              const urg = URGENCY_CONFIG[c.urgency]
              const sta = STATUS_CONFIG[c.status]
              return (
                <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                  {/* Top row: ID + status badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{c.complaint_id}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sta.bg, color: sta.color }}>
                      {sta.emoji} {sta.label}
                    </span>
                  </div>

                  {/* Student info */}
                  <div>
                    <p className="text-sm font-semibold text-white">{c.student_name}</p>
                    <p className="text-xs text-gray-500">Room {c.room_number} · {c.phone}</p>
                  </div>

                  {/* Category + Urgency */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">{c.category}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: urg.bg, color: urg.color }}>
                      {urg.emoji} {urg.label}
                    </span>
                    <span className="text-xs text-gray-600 ml-auto">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Complaint preview */}
                  <p className="text-xs text-gray-500 line-clamp-2">{c.details}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelected(c)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      <Eye size={12} className="inline mr-1" />View
                    </button>
                    {c.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdate(c.id, 'resolved', c.admin_notes || '')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: 'rgba(46,204,113,0.1)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.2)' }}
                      >
                        <CheckCircle size={12} className="inline mr-1" />Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-lg transition-all"
                      style={{ color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop: Full Table */}
        <div className="hidden md:block rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Student', 'Room', 'Category', 'Urgency', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-amber-500 rounded-full animate-spin" />
                        Loading complaints…
                      </div>
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-600 text-sm">
                      No complaints found. Adjust your filters or wait for new submissions.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(c => {
                    const urg = URGENCY_CONFIG[c.urgency]
                    const sta = STATUS_CONFIG[c.status]
                    return (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.025] transition-colors">
                        <td className="px-4 py-3 text-xs text-amber-400 font-mono font-semibold whitespace-nowrap">{c.complaint_id}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium whitespace-nowrap">{c.student_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{c.room_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{c.category}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: urg.bg, color: urg.color }}>
                            {urg.emoji} {urg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: sta.bg, color: sta.color }}>
                            {sta.emoji} {sta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelected(c)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-amber-500/10"
                              style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                            >
                              <Eye size={13} className="inline mr-1" />View
                            </button>
                            {c.status !== 'resolved' && (
                              <button
                                onClick={() => handleUpdate(c.id, 'resolved', c.admin_notes || '')}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-green-500/10"
                                style={{ background: 'rgba(46,204,113,0.08)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.2)' }}
                              >
                                <CheckCircle size={13} className="inline mr-1" />Resolve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                              style={{ color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <DetailModal
        complaint={selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
      />
    </DashboardLayout>
  )
}

