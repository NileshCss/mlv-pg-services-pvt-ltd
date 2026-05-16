'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FoodMenuItem } from '@/types/food'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { motion } from 'motion/react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const EMPTY_FORM: Omit<FoodMenuItem, 'id' | 'created_at' | 'updated_at'> = {
  day: 'Monday',
  day_order: 1,
  breakfast: '',
  lunch: '',
  dinner: '',
  is_active: true,
}

export default function AdminFoodMenu() {
  const [menu, setMenu] = useState<FoodMenuItem[]>([])
  const [editing, setEditing] = useState<FoodMenuItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loadingMenu, setLoadingMenu] = useState(true)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadMenu = async () => {
    setLoadingMenu(true)
    const { data } = await supabase.from('food_menu').select('*').order('day_order')
    if (data) setMenu(data)
    setLoadingMenu(false)
  }

  useEffect(() => {
    loadMenu()
  }, [])

  const openNew = () => {
    setEditing({
      ...EMPTY_FORM,
      id: `new-${Date.now()}`,
      created_at: '',
      updated_at: '',
    } as FoodMenuItem)
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const { id, created_at, updated_at, ...payload } = editing
    const isNew = id.startsWith('new-')

    const { error } = isNew
      ? await supabase
          .from('food_menu')
          .insert({ ...payload, updated_at: new Date().toISOString() })
      : await supabase
          .from('food_menu')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)

    setSaving(false)
    if (error) {
      showToast('❌ ' + error.message, 'error')
      return
    }
    showToast('✅ Menu saved successfully!')
    setEditing(null)
    loadMenu()
  }

  const toggleActive = async (item: FoodMenuItem) => {
    await supabase.from('food_menu').update({ is_active: !item.is_active }).eq('id', item.id)
    setMenu(prev => prev.map(m => (m.id === item.id ? { ...m, is_active: !m.is_active } : m)))
  }

  // ─── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(251,191,36,0.2)',
    color: '#E5E7EB',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical' as const,
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    color: '#FBBF24',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 500,
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#0B1D34',
            border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.3)'}`,
            color: toast.type === 'error' ? '#ef4444' : '#FBBF24',
            padding: '12px 20px',
            borderRadius: '10px',
            zIndex: 9999,
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            🍽️ Food Menu Manager
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>
            Manage weekly breakfast, lunch &amp; dinner — changes reflect live on the website
          </p>
        </div>
        <button
          id="admin-food-add-btn"
          onClick={openNew}
          style={{
            background: 'linear-gradient(135deg, #FBBF24, #D4AF37)',
            color: '#071120',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          + Add Day
        </button>
      </div>

      {/* Menu table */}
      <div
        style={{
          background: 'rgba(11,29,52,0.8)',
          border: '1px solid rgba(251,191,36,0.15)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(251,191,36,0.1)' }}>
                {['Day', 'Breakfast', 'Lunch', 'Dinner', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '14px 20px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#FBBF24',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(251,191,36,0.15)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingMenu ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} style={{ padding: '16px 20px' }}>
                        <div
                          className="animate-pulse"
                          style={{ height: '14px', borderRadius: '6px', background: 'rgba(255,255,255,0.07)' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : menu.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                    No menu items found. Click "+ Add Day" to get started.
                  </td>
                </tr>
              ) : (
                menu.map(item => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,191,36,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', color: '#FBBF24', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {item.day}
                    </td>
                    {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                      <td
                        key={meal}
                        style={{
                          padding: '14px 20px',
                          color: '#D1D5DB',
                          fontSize: '13px',
                          fontFamily: 'Inter, sans-serif',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item[meal] ?? ''}
                      >
                        {item[meal] || <span style={{ color: '#9CA3AF' }}>—</span>}
                      </td>
                    ))}
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => toggleActive(item)}
                        style={{
                          padding: '4px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          border: 'none',
                          background: item.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: item.is_active ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {item.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => setEditing(item)}
                        style={{
                          background: 'rgba(251,191,36,0.1)',
                          color: '#FBBF24',
                          border: '1px solid rgba(251,191,36,0.2)',
                          padding: '6px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontFamily: 'Poppins, sans-serif',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <div
            style={{
              background: '#0B1D34',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 600, margin: 0 }}>
                {editing.id.startsWith('new-') ? '➕ Add Menu Day' : `✏️ Edit — ${editing.day}`}
              </h2>
              <button
                onClick={() => setEditing(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#9CA3AF',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Day selector (only for new entries) */}
            {editing.id.startsWith('new-') && (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Day</label>
                <select
                  value={editing.day}
                  onChange={e => {
                    const day = e.target.value
                    setEditing({ ...editing, day, day_order: DAYS.indexOf(day) + 1 })
                  }}
                  style={{ ...inputStyle, resize: 'none' }}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d} style={{ background: '#0B1D34' }}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Meal inputs */}
            {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
              <div key={meal} style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                  {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}{' '}
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </label>
                <textarea
                  value={editing[meal] ?? ''}
                  onChange={e => setEditing({ ...editing, [meal]: e.target.value })}
                  rows={2}
                  placeholder={`Enter ${meal} items (e.g. Rice + Dal + Sabzi)`}
                  style={inputStyle}
                />
              </div>
            ))}

            {/* Active toggle */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ ...labelStyle, margin: 0 }}>Visible on website</label>
              <button
                onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
                style={{
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: 'none',
                  background: editing.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)',
                  color: editing.is_active ? '#22c55e' : '#ef4444',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                }}
              >
                {editing.is_active ? 'Active' : 'Hidden'}
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                id="admin-food-save-btn"
                onClick={save}
                disabled={saving}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #FBBF24, #D4AF37)',
                  color: '#071120',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontFamily: 'Poppins, sans-serif',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {saving ? 'Saving…' : 'Save Menu'}
              </button>
              <button
                onClick={() => setEditing(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  color: '#E5E7EB',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </motion.div>
    </DashboardLayout>
  )
}

