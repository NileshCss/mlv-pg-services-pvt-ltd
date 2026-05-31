'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle, LogOut } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { DashboardInstallBanner } from '@/components/pwa/DashboardInstallBanner'

const GOLD = '#C9A84C'
const GOLD_LIGHT = 'rgba(201,168,76,0.1)'
const GOLD_BORDER = 'rgba(201,168,76,0.25)'

export default function SecurityPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const validate = () => {
    const err = { currentPassword: '', newPassword: '', confirmPassword: '' }
    let ok = true

    if (!form.currentPassword) {
      err.currentPassword = 'Current password is required'
      ok = false
    }
    if (!form.newPassword) {
      err.newPassword = 'New password is required'
      ok = false
    } else if (form.newPassword.length < 6) {
      err.newPassword = 'Password must be at least 6 characters'
      ok = false
    }
    if (form.newPassword === form.currentPassword && form.newPassword !== '') {
      err.newPassword = 'New password must be different from current password'
      ok = false
    }
    if (form.newPassword !== form.confirmPassword) {
      err.confirmPassword = 'Passwords do not match'
      ok = false
    }

    setErrors(err)
    return ok
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // 1. In Supabase, if a user is logged in, they can update their password via updateUser
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to sign out from all devices? You will be logged out of your current session too.')) return

    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error
      
      toast.success('Logged out from all devices')
      window.location.href = '/student-login'
    } catch (err: any) {
      toast.error(err.message || 'Logout failed')
    }
  }

  return (
    <StudentDashboardLayout title="Security Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Intro Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: GOLD_LIGHT, border: `1px solid ${GOLD_BORDER}` }}>
              <Shield size={22} style={{ color: GOLD }} />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                Account Security & Credentials
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Protect your account by setting a strong, unique password. If you notice any suspicious activity, 
                you can immediately terminate all active sessions across all devices using the global logout below.
              </p>
            </div>
          </div>
        </div>

        {/* PWA Install Banner */}
        <DashboardInstallBanner />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Password Reset Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 sm:p-6 md:col-span-2 space-y-4"
            style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
          >
            <h3 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              <Lock size={16} style={{ color: GOLD }} /> Update Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={form.currentPassword}
                    onChange={e => { setForm(p => ({ ...p, currentPassword: e.target.value })); setErrors(p => ({ ...p, currentPassword: '' })) }}
                    className="w-full pl-4 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: errors.currentPassword ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0', background: '#FAFAFA', color: '#1A1A2E' }}
                    onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.currentPassword ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A2E] transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Create strong password (min 6 characters)"
                    value={form.newPassword}
                    onChange={e => { setForm(p => ({ ...p, newPassword: e.target.value })); setErrors(p => ({ ...p, newPassword: '' })) }}
                    className="w-full pl-4 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: errors.newPassword ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0', background: '#FAFAFA', color: '#1A1A2E' }}
                    onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.newPassword ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A2E] transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={form.confirmPassword}
                    onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setErrors(p => ({ ...p, confirmPassword: '' })) }}
                    className="w-full pl-4 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: errors.confirmPassword ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0', background: '#FAFAFA', color: '#1A1A2E' }}
                    onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.confirmPassword ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A2E] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : 'Change Password'}
              </button>
            </form>
          </motion.div>

          {/* Quick Actions & Sessions Card */}
          <div className="space-y-6">
            {/* Password Tips */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-5 border border-[#EBEBF0] space-y-3"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Security Best Practices</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use at least 8 characters with letters, numbers, and special symbols.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Do not reuse a password you have used on another website.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sign out completely if using a shared computer or device.</span>
                </li>
              </ul>
            </motion.div>

            {/* Global Signout */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-[#EBEBF0] space-y-4"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}
            >
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Global Sign Out</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Log out of this account on all other devices, web browsers, or apps. You will need to log back in on all devices.
                </p>
              </div>
              <button
                onClick={handleLogoutAllDevices}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold transition-all duration-200"
              >
                <LogOut size={14} /> Log Out All Devices
              </button>
            </motion.div>
          </div>
        </div>

      </div>
    </StudentDashboardLayout>
  )
}
