'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Pencil, Save, X, ToggleLeft, ToggleRight, GripVertical, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

interface Notice {
  id: string
  text: string
  emoji: string
  is_active: boolean
  order: number
  created_at?: string
  updated_at?: string
}

const COMMON_EMOJIS = ['📢', '🏠', '🍽️', '📋', '📞', '✅', '🎉', '⚠️', '🔔', '💡', '🏅', '🚀', '📅', '💬', '🌟']

const emptyNotice = (): Omit<Notice, 'id' | 'created_at' | 'updated_at'> => ({
  text: '',
  emoji: '📢',
  is_active: true,
  order: 99,
})

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Add mode
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNotice, setNewNotice] = useState(emptyNotice())

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Notice>>({})

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch ALL notices for admin (including inactive)
      const res = await fetch('/api/notices/all')
      if (!res.ok) throw new Error('fetch failed')
      const { data } = await res.json()
      setNotices((data as Notice[]).sort((a, b) => a.order - b.order))
    } catch {
      toast.error('Failed to load notices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  /* ── Add ── */
  const handleAdd = async () => {
    if (!newNotice.text.trim()) {
      toast.error('Notice text cannot be empty')
      return
    }
    try {
      setSaving(true)
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newNotice, order: notices.length + 1 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Notice added!')
      setNewNotice(emptyNotice())
      setShowAddForm(false)
      fetchNotices()
    } catch (e: any) {
      toast.error(e.message || 'Failed to add notice')
    } finally {
      setSaving(false)
    }
  }

  /* ── Edit ── */
  const startEdit = (notice: Notice) => {
    setEditingId(notice.id)
    setEditData({ text: notice.text, emoji: notice.emoji, is_active: notice.is_active, order: notice.order })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editData.text?.trim()) {
      toast.error('Notice text cannot be empty')
      return
    }
    try {
      setSaving(true)
      const res = await fetch('/api/notices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editData }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Notice updated!')
      setEditingId(null)
      fetchNotices()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update notice')
    } finally {
      setSaving(false)
    }
  }

  /* ── Toggle active ── */
  const handleToggle = async (notice: Notice) => {
    try {
      const res = await fetch('/api/notices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notice.id, is_active: !notice.is_active }),
      })
      if (!res.ok) throw new Error()
      setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, is_active: !n.is_active } : n))
      toast.success(`Notice ${!notice.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to toggle notice')
    }
  }

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return
    try {
      const res = await fetch(`/api/notices?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Notice deleted')
      setNotices(prev => prev.filter(n => n.id !== id))
    } catch {
      toast.error('Failed to delete notice')
    }
  }

  /* ── Emoji picker inline ── */
  const EmojiPicker = ({ value, onChange }: { value: string; onChange: (e: string) => void }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
      {COMMON_EMOJIS.map(em => (
        <button
          key={em}
          type="button"
          onClick={() => onChange(em)}
          style={{
            fontSize: '18px',
            padding: '4px 6px',
            borderRadius: '6px',
            border: value === em ? '2px solid #f59e0b' : '2px solid transparent',
            background: value === em ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {em}
        </button>
      ))}
    </div>
  )

  const inputCls = 'w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all'

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Notice Board</h1>
            <p className="text-gray-400">Manage notices shown on the homepage ticker</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchNotices}
              className="p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000', fontWeight: 600, fontSize: '14px',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
              }}
            >
              <Plus size={18} />
              Add Notice
            </button>
          </div>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${DESIGN_SYSTEM.components.card.base} p-6 space-y-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">New Notice</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Emoji */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Emoji / Icon</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px' }}>{newNotice.emoji}</span>
                    <input
                      type="text"
                      value={newNotice.emoji}
                      onChange={e => setNewNotice(p => ({ ...p, emoji: e.target.value }))}
                      style={{ width: '70px' }}
                      className={inputCls}
                      maxLength={4}
                    />
                  </div>
                  <EmojiPicker value={newNotice.emoji} onChange={e => setNewNotice(p => ({ ...p, emoji: e }))} />
                </div>

                {/* Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notice Text *</label>
                  <input
                    type="text"
                    placeholder="e.g. New rooms now available – Limited seats!"
                    value={newNotice.text}
                    onChange={e => setNewNotice(p => ({ ...p, text: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                {/* Active toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <button
                    type="button"
                    onClick={() => setNewNotice(p => ({ ...p, is_active: !p.is_active }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: newNotice.is_active ? '#f59e0b' : '#6b7280' }}
                  >
                    {newNotice.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                  <span className="text-sm text-gray-300">{newNotice.is_active ? 'Active (visible on homepage)' : 'Inactive (hidden)'}</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 transition-all flex items-center gap-2 font-medium"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Notice'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notices List */}
        <div className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">All Notices</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {notices.filter(n => n.is_active).length} active · {notices.filter(n => !n.is_active).length} inactive
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-700 border-t-amber-500 rounded-full animate-spin" />
              Loading notices...
            </div>
          ) : notices.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              No notices yet. Click "Add Notice" to create one.
            </div>
          ) : (
            <div>
              {notices.map((notice, idx) => (
                <motion.div
                  key={notice.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    borderBottom: idx < notices.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    padding: '0',
                  }}
                >
                  {editingId === notice.id ? (
                    /* ── Edit Row ── */
                    <div style={{ padding: '16px 24px', background: 'rgba(245,158,11,0.04)' }} className="space-y-3">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '26px' }}>{editData.emoji}</span>
                        <input
                          type="text"
                          value={editData.emoji || ''}
                          onChange={e => setEditData(p => ({ ...p, emoji: e.target.value }))}
                          style={{ width: '70px' }}
                          className={inputCls}
                          maxLength={4}
                        />
                        <input
                          type="text"
                          value={editData.text || ''}
                          onChange={e => setEditData(p => ({ ...p, text: e.target.value }))}
                          className={`${inputCls} flex-1`}
                          placeholder="Notice text..."
                        />
                      </div>
                      <EmojiPicker value={editData.emoji || '📢'} onChange={e => setEditData(p => ({ ...p, emoji: e }))} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleSaveEdit(notice.id)}
                          disabled={saving}
                          className="px-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-medium"
                        >
                          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Display Row ── */
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '14px 24px',
                        transition: 'background 0.15s',
                        opacity: notice.is_active ? 1 : 0.45,
                      }}
                      className="hover:bg-white/[0.02]"
                    >
                      <GripVertical size={16} style={{ color: '#4b5563', flexShrink: 0 }} />
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>{notice.emoji}</span>
                      <span style={{ flex: 1, fontSize: '14px', color: notice.is_active ? '#e5e7eb' : '#6b7280', fontWeight: 500 }}>
                        {notice.text}
                      </span>
                      <span
                        style={{
                          flexShrink: 0, fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                          borderRadius: '999px',
                          background: notice.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                          color: notice.is_active ? '#10b981' : '#6b7280',
                        }}
                      >
                        {notice.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(notice)}
                          title={notice.is_active ? 'Deactivate' : 'Activate'}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                            borderRadius: '6px', color: notice.is_active ? '#f59e0b' : '#6b7280',
                            transition: 'background 0.2s',
                          }}
                          className="hover:bg-white/10"
                        >
                          {notice.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => startEdit(notice)}
                          title="Edit"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                            borderRadius: '6px', color: '#9ca3af', transition: 'background 0.2s',
                          }}
                          className="hover:bg-white/10 hover:text-amber-400"
                        >
                          <Pencil size={16} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(notice.id)}
                          title="Delete"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                            borderRadius: '6px', color: '#9ca3af', transition: 'background 0.2s',
                          }}
                          className="hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div
          style={{
            padding: '14px 18px', borderRadius: '10px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
          <p style={{ color: '#d1d5db', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
            Changes are <strong style={{ color: '#f59e0b' }}>live immediately</strong> on the homepage.
            The notice ticker auto-refreshes every 5 minutes for all visitors.
            Inactive notices are hidden from the public but preserved here.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

