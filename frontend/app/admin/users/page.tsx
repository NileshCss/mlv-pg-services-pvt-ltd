'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Shield, X, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'
import axios from 'axios'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  last_sign_in_at?: string
  created_at: string
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(201,168,76,0.2)',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
}

function AddUserModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (user: AdminUser) => void
}) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Min 6 characters'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    try {
      setLoading(true)
      const res = await axios.post('/api/admin/users', form)
      toast.success(`Admin user "${form.email}" created successfully!`)
      onAdded(res.data.user)
      setForm({ email: '', password: '', full_name: '' })
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create user'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({ email: '', password: '', full_name: '' })
    setErrors({})
    setShowPw(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)', zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <motion.div
            key="modal-box"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '480px',
              background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: 'rgba(201,168,76,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={18} style={{ color: '#c9a84c' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Add Admin User
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                    New user can log in immediately
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
                  borderRadius: '8px', padding: '6px', color: '#9ca3af',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nilesh Kumar"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  style={INPUT_STYLE}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.2)' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="admin@mlvpg.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  style={{ ...INPUT_STYLE, borderColor: errors.email ? '#ef4444' : 'rgba(201,168,76,0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(201,168,76,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(201,168,76,0.2)' }}
                />
                {errors.email && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    style={{
                      ...INPUT_STYLE,
                      paddingRight: '44px',
                      borderColor: errors.password ? '#ef4444' : 'rgba(201,168,76,0.2)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(201,168,76,0.5)' }}
                    onBlur={(e) => { e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(201,168,76,0.2)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.password}</p>
                )}
              </div>

              {/* Info note */}
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(201,168,76,0.07)',
                border: '1px solid rgba(201,168,76,0.15)',
              }}>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
                  ✅ The new user will be created with <span style={{ color: '#c9a84c', fontWeight: 600 }}>Admin</span> role and can log in immediately using these credentials.
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#9ca3af', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                    background: loading ? '#374151' : 'linear-gradient(135deg, #c9a84c, #e8c96d)',
                    color: loading ? '#9ca3af' : '#0a0f1e',
                    fontWeight: 700, fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function UsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      const res = await axios.get('/api/admin/users')
      setUsers(res.data.users || [])
    } catch (err: any) {
      // Fallback: at least show current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        setUsers([{
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'Admin',
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at || new Date().toISOString(),
        }])
      }
      console.warn('Could not fetch all users (service key may be missing):', err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      toast.error('Cannot delete your own account')
      return
    }
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return

    try {
      setDeleting(id)
      await axios.delete(`/api/admin/users?id=${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('User deleted')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'

  return (
    <DashboardLayout>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Users</h1>
            <p className="text-gray-400 text-sm">Manage admin users and access</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={fetchUsers}
              style={{
                padding: '9px 14px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
              }}
              title="Refresh"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '9px 18px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1))',
                border: '1px solid rgba(201,168,76,0.35)',
                color: '#c9a84c', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.25)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1))' }}
            >
              <Plus size={16} />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px',
        }}>
          {[
            { label: 'Total Admins', value: users.length, color: '#c9a84c' },
            { label: 'Active Today', value: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 86400000)).length, color: '#22c55e' },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: '18px 20px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{stat.label}</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 gap-3">
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Loading users...
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    {['User', 'Role', 'Last Sign In', 'Created', 'Actions'].map((h) => (
                      <th key={h} style={{
                        padding: '14px 20px', textAlign: h === 'Actions' ? 'right' : 'left',
                        fontSize: '12px', fontWeight: 600, color: '#6b7280',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      {/* User */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(201,168,76,0.15)',
                            border: '2px solid rgba(201,168,76,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, color: '#c9a84c',
                          }}>
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
                              {user.full_name || '–'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: 'rgba(201,168,76,0.15)', color: '#c9a84c',
                          }}>
                            {user.role || 'Admin'}
                          </span>
                          {user.id === currentUserId && (
                            <span style={{
                              padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                              background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                            }}>
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Sign In */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#9ca3af' }}>
                        {fmt(user.last_sign_in_at)}
                      </td>

                      {/* Created */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#9ca3af' }}>
                        {fmt(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          disabled={user.id === currentUserId || deleting === user.id}
                          onClick={() => handleDelete(user.id)}
                          title={user.id === currentUserId ? 'Cannot delete yourself' : 'Delete user'}
                          style={{
                            padding: '7px', borderRadius: '8px', border: 'none',
                            background: user.id === currentUserId ? 'transparent' : 'rgba(239,68,68,0.1)',
                            color: user.id === currentUserId ? '#374151' : '#ef4444',
                            cursor: user.id === currentUserId ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            if (user.id !== currentUserId)
                              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'
                          }}
                          onMouseLeave={(e) => {
                            if (user.id !== currentUserId)
                              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
                          }}
                        >
                          {deleting === user.id
                            ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Trash2 size={16} />
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
                  <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '15px' }}>No admin users found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add User Modal */}
      <AddUserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdded={(user) => setUsers((prev) => [user, ...prev])}
      />
    </DashboardLayout>
  )
}
