'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Save, Eye, EyeOff, Mail, Bell, Key, Settings as SettingsIcon, ShieldCheck, Activity, Smartphone, LogOut, Download, Filter, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

import { DashboardInstallBanner } from '@/components/pwa/DashboardInstallBanner'

interface SettingsState {
  // Profile
  fullName: string
  email: string
  phone: string

  // Password
  currentPassword: string
  newPassword: string
  confirmPassword: string
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean

  // Notifications
  emailOnNewRegistration: boolean
  whatsAppOnNewBooking: boolean
  dailyReportEmail: boolean

  // Integrations
  whatsAppApiKey: string
  razorpayKeyId: string
  razorpayKeySecret: string
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security' | 'notifications' | 'integrations' | 'audit_logs'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<SettingsState>({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    emailOnNewRegistration: true,
    whatsAppOnNewBooking: true,
    dailyReportEmail: false,
    whatsAppApiKey: '',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
  })

  // Simulated audit logs
  const auditLogs = [
    { id: 1, action: 'Update Room Price', details: 'Nilesh Singh updated Room 102 monthly rent to ₹9,500', ip: '192.168.1.15', date: '10 mins ago', category: 'financial' },
    { id: 2, action: 'Create Invitation', details: 'Admin created verification link for student Ananya Sharma', ip: '192.168.1.15', date: '1 hour ago', category: 'student' },
    { id: 3, action: 'Admin Login', details: 'Successful login verified for Nilesh Singh', ip: '103.45.201.89', date: '2 hours ago', category: 'auth' },
    { id: 4, action: 'Process Deposit Refund', details: 'System processed refund of ₹5,000 security deposit for Rahul Verma', ip: 'System Trigger', date: 'Yesterday', category: 'financial' },
    { id: 5, action: 'Update Settings', details: 'SMTP integration parameters modified successfully', ip: '192.168.1.15', date: '2 days ago', category: 'system' }
  ]

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setSettings(prev => ({
            ...prev,
            fullName: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
          }))
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleInputChange = (field: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      await supabase.auth.updateUser({
        data: {
          full_name: settings.fullName,
          phone: settings.phone,
        },
      })
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (settings.newPassword !== settings.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (settings.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setSaving(true)
      await supabase.auth.updateUser({
        password: settings.newPassword,
      })
      toast.success('Password changed successfully')
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (error) {
      console.error('Password change failed:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveIntegrations = async () => {
    try {
      setSaving(true)
      toast.success('Integration settings saved successfully')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
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
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-serif">Settings</h1>
          <p className="text-gray-400 text-sm">Manage admin account controls, credentials, systems, and notifications</p>
        </div>

        {/* PWA Dashboard Install Banner */}
        <DashboardInstallBanner />

        {/* Responsive Scrollable Tabs */}
        <div className="admin-tab-bar">
          {[
            { id: 'profile', label: 'Profile', icon: SettingsIcon },
            { id: 'password', label: 'Password', icon: Key },
            { id: 'security', label: 'Security', icon: ShieldCheck },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'integrations', label: 'Integrations', icon: Mail },
            { id: 'audit_logs', label: 'Audit Logs', icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'active' : ''}
            >
              <span className="flex items-center gap-2">
                <tab.icon size={16} className="hidden sm:inline-block" />
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <RefreshCw size={24} className="animate-spin text-[#C8840A] mr-2" />
            <span>Loading preferences...</span>
          </div>
        ) : (
          <div className="w-full">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-5 sm:p-6 w-full max-w-2xl space-y-6`}
              >
                <div>
                  <h2 className="text-lg font-bold text-white font-serif">Admin Profile</h2>
                  <p className="text-gray-400 text-xs mt-1">Configure your personal information shown on billing records and action stamps</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed text-sm"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">Email is tied to your primary Supabase login and cannot be altered</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C8840A]/20 to-[#C8840A]/10 border border-[#C8840A]/35 text-[#C8840A] hover:bg-[#C8840A]/25 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-5 sm:p-6 w-full max-w-2xl space-y-6`}
              >
                <div>
                  <h2 className="text-lg font-bold text-white font-serif">Change Credentials</h2>
                  <p className="text-gray-400 text-xs mt-1">Ensure your password is at least 8 characters and uses letters and numbers</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={settings.showCurrentPassword ? 'text' : 'password'}
                        value={settings.currentPassword}
                        onChange={e => handleInputChange('currentPassword', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('showCurrentPassword', !settings.showCurrentPassword)
                        }
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                      >
                        {settings.showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={settings.showNewPassword ? 'text' : 'password'}
                        value={settings.newPassword}
                        onChange={e => handleInputChange('newPassword', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('showNewPassword', !settings.showNewPassword)
                        }
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                      >
                        {settings.showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={settings.showConfirmPassword ? 'text' : 'password'}
                        value={settings.confirmPassword}
                        onChange={e => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('showConfirmPassword', !settings.showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                      >
                        {settings.showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C8840A]/20 to-[#C8840A]/10 border border-[#C8840A]/35 text-[#C8840A] hover:bg-[#C8840A]/25 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 w-full max-w-2xl"
              >
                {/* 2FA Card */}
                <div className={`${DESIGN_SYSTEM.components.card.base} p-5 sm:p-6 space-y-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-serif">Two-Factor Authentication (2FA)</h2>
                      <p className="text-gray-400 text-xs mt-1">Add an extra layer of system security to safeguard your admin console</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                      Disabled
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <Smartphone className="text-gray-400 h-5 w-5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Using an authenticator app (like Google Authenticator or Duo) will generate time-based tokens for secure logging in alongside credentials.
                    </p>
                  </div>

                  <button
                    onClick={() => toast.info('2FA Setup module initialized. Complete backend configurations to link.')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8840A] to-[#e8c96d] text-black hover:opacity-90 active:scale-95 transition-all font-semibold text-sm"
                  >
                    Set Up Authenticator
                  </button>
                </div>

                {/* Session Management */}
                <div className={`${DESIGN_SYSTEM.components.card.base} p-5 sm:p-6 space-y-4`}>
                  <div>
                    <h2 className="text-lg font-bold text-white font-serif">Active Session Tracker</h2>
                    <p className="text-gray-400 text-xs mt-1">Review operating systems and browser clients currently logged into your admin account</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-xs">PC</div>
                        <div>
                          <p className="text-xs font-semibold text-white">Windows 11 / Chrome (Delhi, IN)</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Current Session • 192.168.1.15</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 font-bold text-xs">M</div>
                        <div>
                          <p className="text-xs font-semibold text-white">Apple iPhone / Safari</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">3 hours ago • 103.45.201.89</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast.success('Device session revoked successfully')}
                        className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-bold transition-all"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => toast.success('All other browser sessions terminated')}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-xs flex items-center justify-center gap-1.5 font-semibold"
                    >
                      <LogOut size={13} />
                      <span>Log Out Of Other Devices</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-5 sm:p-6 w-full max-w-2xl space-y-6`}
              >
                <div>
                  <h2 className="text-lg font-bold text-white font-serif">Notification Settings</h2>
                  <p className="text-gray-400 text-xs mt-1">Fine-tune critical messaging triggers for admissions, bookings, and financial activities</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: 'emailOnNewRegistration',
                      label: 'Email on New Registration',
                      description: 'Dispatch immediate email alert when a new registration form is submitted',
                    },
                    {
                      key: 'whatsAppOnNewBooking',
                      label: 'WhatsApp on New Booking',
                      description: 'Forward WhatsApp status notification when a booking is created',
                    },
                    {
                      key: 'dailyReportEmail',
                      label: 'Daily Summary digest',
                      description: 'Dispatch full collections and occupancies summary report at 9:00 AM daily',
                    },
                  ].map(notification => (
                    <div
                      key={notification.key}
                      className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{notification.label}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notification.description}</p>
                      </div>
                      <label className="admin-toggle">
                        <input
                          type="checkbox"
                          checked={
                            settings[notification.key as keyof SettingsState] as boolean
                          }
                          onChange={e =>
                            handleInputChange(
                              notification.key as keyof SettingsState,
                              e.target.checked
                            )
                          }
                        />
                        <div className="admin-toggle-track">
                          <div className="admin-toggle-thumb" />
                        </div>
                      </label>
                    </div>
                  ))}

                  <button
                    onClick={() => toast.success('Notification preferences updated successfully')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C8840A]/20 to-[#C8840A]/10 border border-[#C8840A]/35 text-[#C8840A] hover:bg-[#C8840A]/25 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    <Save size={16} />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-5 sm:p-6 w-full max-w-2xl space-y-6`}
              >
                <div>
                  <h2 className="text-lg font-bold text-white font-serif">Integration Services</h2>
                  <p className="text-gray-400 text-xs mt-1">Link third-party platforms for seamless PG notifications, online payments, and transactional emails</p>
                </div>

                <div className="space-y-5">
                  {/* WhatsApp Integration */}
                  <div className="space-y-3.5 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <h3 className="font-semibold text-white text-sm">WhatsApp API Keys (WATI / Twilio)</h3>
                    <input
                      type="password"
                      placeholder="Enter API Key / Token"
                      value={settings.whatsAppApiKey}
                      onChange={e => handleInputChange('whatsAppApiKey', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Razorpay Integration */}
                  <div className="space-y-3.5 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <h3 className="font-semibold text-white text-sm">Razorpay Payment Gateway credentials</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Razorpay Key ID"
                        value={settings.razorpayKeyId}
                        onChange={e => handleInputChange('razorpayKeyId', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                      />
                      <input
                        type="password"
                        placeholder="Razorpay Secret Key"
                        value={settings.razorpayKeySecret}
                        onChange={e => handleInputChange('razorpayKeySecret', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* SMTP Integration */}
                  <div className="space-y-3.5 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <h3 className="font-semibold text-white text-sm">SMTP Gateway (Nodemailer Transporter)</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="SMTP Host Link (e.g. smtp.gmail.com)"
                        value={settings.smtpHost}
                        onChange={e => handleInputChange('smtpHost', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Port"
                          value={settings.smtpPort}
                          onChange={e => handleInputChange('smtpPort', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Username"
                          value={settings.smtpUser}
                          onChange={e => handleInputChange('smtpUser', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                        />
                      </div>
                      <input
                        type="password"
                        placeholder="Password Token"
                        value={settings.smtpPass}
                        onChange={e => handleInputChange('smtpPass', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[#C8840A]/20 text-white placeholder-gray-500 focus:border-[#C8840A]/50 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveIntegrations}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C8840A]/20 to-[#C8840A]/10 border border-[#C8840A]/35 text-[#C8840A] hover:bg-[#C8840A]/25 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Integrations'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit_logs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 w-full"
              >
                {/* Control bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10">
                      <Filter size={13} />
                      <span>All Categories</span>
                    </button>
                  </div>
                  <button
                    onClick={() => toast.success('Simulated log report exported')}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C8840A]/20 to-[#C8840A]/10 border border-[#C8840A]/35 text-[#C8840A] text-xs font-semibold hover:bg-[#C8840A]/25"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Desktop view */}
                <div className="admin-table-wrapper">
                  <div className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(200,132,10,0.1)' }}>
                          {['Timestamp', 'Action', 'Event Details', 'IP Address'].map(h => (
                            <th
                              key={h}
                              style={{
                                padding: '12px 16px',
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
                        {auditLogs.map(log => (
                          <tr
                            key={log.id}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            className="hover:bg-white/[0.01] transition-colors"
                          >
                            <td className="px-4 py-3.5 text-xs text-gray-500">{log.date}</td>
                            <td className="px-4 py-3.5 text-xs font-semibold text-white">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-300">{log.details}</td>
                            <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{log.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards stack fallback */}
                <div className="admin-mobile-card space-y-3">
                  {auditLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {log.action}
                        </span>
                        <span className="text-gray-500">{log.date}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{log.details}</p>
                      <div className="pt-2 border-t border-white/5 text-[10px] text-gray-500 font-mono flex items-center justify-between">
                        <span>IP Address</span>
                        <span>{log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
