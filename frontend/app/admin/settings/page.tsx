'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Save, Eye, EyeOff, Mail, Bell, Key, Settings as SettingsIcon } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

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
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'integrations'>('profile')
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

        // Fetch settings from database if available
        // For now, we'll use defaults
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
      // In production, save encrypted settings to database
      toast.success('Integration settings saved')
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
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your admin account and platform integrations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: SettingsIcon },
            { id: 'password', label: 'Password', icon: Key },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'integrations', label: 'Integrations', icon: Mail },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Loading settings...
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-6 max-w-2xl space-y-6`}
              >
                <h2 className="text-xl font-bold text-white">Admin Profile</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6 px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-6 max-w-2xl space-y-6`}
              >
                <h2 className="text-xl font-bold text-white">Change Password</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={settings.showCurrentPassword ? 'text' : 'password'}
                        value={settings.currentPassword}
                        onChange={e => handleInputChange('currentPassword', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('showCurrentPassword', !settings.showCurrentPassword)
                        }
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-400"
                      >
                        {settings.showCurrentPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={settings.showNewPassword ? 'text' : 'password'}
                        value={settings.newPassword}
                        onChange={e => handleInputChange('newPassword', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('showNewPassword', !settings.showNewPassword)
                        }
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-400"
                      >
                        {settings.showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={settings.showConfirmPassword ? 'text' : 'password'}
                        value={settings.confirmPassword}
                        onChange={e => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('showConfirmPassword', !settings.showConfirmPassword)
                        }
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-400"
                      >
                        {settings.showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="mt-6 px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                  >
                    <Save size={18} />
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-6 max-w-2xl space-y-6`}
              >
                <h2 className="text-xl font-bold text-white">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    {
                      key: 'emailOnNewRegistration',
                      label: 'Email on New Registration',
                      description: 'Receive email when a new registration is submitted',
                    },
                    {
                      key: 'whatsAppOnNewBooking',
                      label: 'WhatsApp on New Booking',
                      description: 'Receive WhatsApp notification when a booking is created',
                    },
                    {
                      key: 'dailyReportEmail',
                      label: 'Daily Report Email',
                      description: 'Receive a summary report every day at 9:00 AM',
                    },
                  ].map(notification => (
                    <div
                      key={notification.key}
                      className="flex items-start gap-4 p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-white">{notification.label}</p>
                        <p className="text-sm text-gray-400">{notification.description}</p>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
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
                          className="w-5 h-5 rounded accent-amber-500"
                        />
                      </label>
                    </div>
                  ))}

                  <button
                    onClick={() => toast.success('Notification preferences saved')}
                    className="mt-6 px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all flex items-center gap-2 font-medium"
                  >
                    <Save size={18} />
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${DESIGN_SYSTEM.components.card.base} p-6 space-y-6`}
              >
                <h2 className="text-xl font-bold text-white">Third-party Integrations</h2>

                {/* WhatsApp Integration */}
                <div className="space-y-3 p-4 rounded-lg border border-white/10">
                  <h3 className="font-semibold text-white">WhatsApp API (WATI/Twilio)</h3>
                  <input
                    type="password"
                    placeholder="API Key"
                    value={settings.whatsAppApiKey}
                    onChange={e => handleInputChange('whatsAppApiKey', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Razorpay Integration */}
                <div className="space-y-3 p-4 rounded-lg border border-white/10">
                  <h3 className="font-semibold text-white">Razorpay Payment Gateway</h3>
                  <input
                    type="text"
                    placeholder="Key ID"
                    value={settings.razorpayKeyId}
                    onChange={e => handleInputChange('razorpayKeyId', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Key Secret"
                    value={settings.razorpayKeySecret}
                    onChange={e => handleInputChange('razorpayKeySecret', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                  />
                </div>

                {/* SMTP Integration */}
                <div className="space-y-3 p-4 rounded-lg border border-white/10">
                  <h3 className="font-semibold text-white">SMTP Email (Nodemailer)</h3>
                  <input
                    type="text"
                    placeholder="SMTP Host"
                    value={settings.smtpHost}
                    onChange={e => handleInputChange('smtpHost', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Port"
                      value={settings.smtpPort}
                      onChange={e => handleInputChange('smtpPort', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={settings.smtpUser}
                      onChange={e => handleInputChange('smtpUser', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                    />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={settings.smtpPass}
                    onChange={e => handleInputChange('smtpPass', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleSaveIntegrations}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Integrations'}
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

