'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Shield, X, Eye, EyeOff, RefreshCw, GraduationCap, ArrowRight, UserCheck, Users } from 'lucide-react'
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
  border: '1px solid rgba(200,132,10,0.2)',
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
              border: '1px solid rgba(200,132,10,0.25)',
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
                  background: 'rgba(200,132,10,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={18} style={{ color: '#C8840A' }} />
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
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(200,132,10,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(200,132,10,0.2)' }}
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
                  style={{ ...INPUT_STYLE, borderColor: errors.email ? '#ef4444' : 'rgba(200,132,10,0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(200,132,10,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(200,132,10,0.2)' }}
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
                      borderColor: errors.password ? '#ef4444' : 'rgba(200,132,10,0.2)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(200,132,10,0.5)' }}
                    onBlur={(e) => { e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(200,132,10,0.2)' }}
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
                background: 'rgba(200,132,10,0.07)',
                border: '1px solid rgba(200,132,10,0.15)',
              }}>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
                  ✅ The new user will be created with <span style={{ color: '#C8840A', fontWeight: 600 }}>Admin</span> role and can log in immediately using these credentials.
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
                    background: loading ? '#374151' : 'linear-gradient(135deg, #C8840A, #e8c96d)',
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
  const [totalStudents, setTotalStudents] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'managers' | 'super_admins' | 'students'>('all')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Fetch admin users from API
      const res = await axios.get('/api/admin/users')
      setUsers(res.data.users || [])

      // Fetch students count from DB
      const { count: tsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
      setTotalStudents(tsCount || 0)

      const { count: asCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      setActiveStudents(asCount || 0)

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

  const filteredUsers = users.filter((user) => {
    const role = (user.role || 'Admin').toLowerCase()
    if (activeTab === 'all') return true
    if (activeTab === 'admins') return role === 'admin'
    if (activeTab === 'managers') return role === 'manager'
    if (activeTab === 'super_admins') return role === 'super admin' || role === 'super_admin' || role === 'superadmin' || role === 'owner'
    return false // students tab is read-only student layout, handled separately
  })

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 font-serif">Users</h1>
            <p className="text-gray-400 text-sm">Manage admin access roles and student connections</p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={fetchUsers}
              className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-white/[0.07] border border-white/10 text-gray-300 hover:bg-white/[0.12] active:scale-95 transition-all text-sm flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8840A]/20 to-[#C8840A]/10 border border-[#C8840A]/35 text-[#C8840A] hover:bg-[#C8840A]/25 active:scale-95 transition-all font-semibold text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stat-grid gap-4">
          {[
            { label: 'Total Admins', value: users.length, color: '#C8840A', icon: Shield },
            { label: 'Active Today (Admins)', value: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 86400000)).length, color: '#22c55e', icon: UserCheck },
            { label: 'Total Students', value: totalStudents, color: '#C8840A', icon: GraduationCap },
            { label: 'Active Residents', value: activeStudents, color: '#22c55e', icon: Users },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold font-serif" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.06] text-gray-400">
                <stat.icon size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Role Filter Tabs */}
        <div className="admin-tab-bar">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'admins', label: 'Admins' },
            { id: 'managers', label: 'Managers' },
            { id: 'super_admins', label: 'Super Admins' },
            { id: 'students', label: 'Students (Read-only)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'active' : ''}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {activeTab === 'students' ? (
          /* Specialized premium view when exclusively students tab is clicked */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-[#0F1629]/40 backdrop-blur-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8840A]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-2.5 text-[#C8840A]">
                <GraduationCap className="h-6 w-6" />
                <h3 className="text-xl font-bold text-white font-serif">Student Registry Directory</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                To streamline administrative tasks, student directories, resident verifications, pre-registrations, and application flows are consolidated on the **Students Page**. Students are granted automated access keys to check billing histories and log complaints.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8840A]" />
                  Total Database Students: <strong className="text-white ml-1">{totalStudents}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Active Live Residents: <strong className="text-white ml-1">{activeStudents}</strong>
                </span>
              </div>
            </div>

            <a
              href="/admin/students"
              className="z-10 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C8840A] to-[#e8c96d] text-black font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#C8840A]/10 whitespace-nowrap self-stretch md:self-auto justify-center"
            >
              <span>Manage Students Directory</span>
              <ArrowRight size={16} />
            </a>
          </motion.div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 gap-3">
            <RefreshCw size={18} className="animate-spin text-[#C8840A]" />
            <span>Loading admin users...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users Table / Mobile List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}
            >
              {/* Desktop Table Wrapper */}
              <div className="admin-table-wrapper">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(200,132,10,0.1)' }}>
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
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          {/* User */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                background: 'rgba(200,132,10,0.15)',
                                border: '2px solid rgba(200,132,10,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: 700, color: '#C8840A',
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
                                background: 'rgba(200,132,10,0.15)', color: '#C8840A',
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

                  {filteredUsers.length === 0 && (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
                      <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p style={{ fontSize: '15px' }}>No users match the filtered role</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Cards Stack */}
              <div className="admin-mobile-card p-4 space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(200,132,10,0.15)',
                          border: '2px solid rgba(200,132,10,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, color: '#C8840A',
                        }}>
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{user.full_name || '–'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#C8840A]/10 text-[#C8840A] border border-[#C8840A]/20">
                          {user.role || 'Admin'}
                        </span>
                        {user.id === currentUserId && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/5 text-xs text-gray-400">
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Last Sign In</span>
                        <span>{fmt(user.last_sign_in_at)}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Created At</span>
                        <span>{fmt(user.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        disabled={user.id === currentUserId || deleting === user.id}
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {deleting === user.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        <span>Delete User</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Shield size={36} className="mx-auto mb-2 opacity-30 text-gray-400" />
                    <p className="text-sm">No users match this role</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Read-Only Student Section under the admin user table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-white/5 bg-[#0F1629]/50 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Background design glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8840A]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 z-10">
                <div className="flex items-center gap-2 text-[#C8840A]">
                  <GraduationCap className="h-5 w-5" />
                  <h3 className="text-lg font-bold text-white font-serif">Student Accounts</h3>
                </div>
                <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                  Student directory and registration requests are managed separately in the Students Directory. 
                  Students have access to their portal to view dues, pay rent, and submit complaints.
                </p>
                
                {/* Stats pills */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C8840A]" />
                    Total Students: <strong className="text-white ml-0.5">{totalStudents}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active Residents: <strong className="text-white ml-0.5">{activeStudents}</strong>
                  </span>
                </div>
              </div>

              <a
                href="/admin/students"
                className="z-10 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C8840A] to-[#e8c96d] text-black font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#C8840A]/10 whitespace-nowrap self-stretch md:self-auto justify-center"
              >
                <span>Manage Students</span>
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
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


