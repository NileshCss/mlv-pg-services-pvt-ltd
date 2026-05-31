'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, Shield, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

// NOTE: This is the primary admin login page using Supabase authentication.
// Do not use app/(auth)/login for admin access as it uses hardcoded credentials.

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { setUser, setLoading: setAuthLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          router.push('/admin/dashboard')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password')
      return
    }

    try {
      setSubmitting(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Login failed')
        return
      }

      if (data.user) {
        setUser(data.user)
        toast.success('Login successful!')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('An error occurred during login')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0E1A]">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-amber-500 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Panel - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo & Branding */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-all duration-300 group inline-flex">
              <div className="w-14 h-14 flex items-center justify-center relative group-hover:drop-shadow-xl transition-all duration-300 rounded-xl p-2">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 opacity-0 group-hover:opacity-20 blur-lg transition-all duration-300" />
                <Image
                  src="/images/logo.png"
                  alt="MLV Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain relative z-10 drop-shadow-md"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">MLV PG Services</h1>
                <p className="text-sm text-gray-400">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-xl p-8 space-y-6"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Secure Admin Access</h2>
              <p className="text-gray-400">Sign in to manage your PG operations</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@mlvpg.com"
                    disabled={submitting}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={submitting}
                    className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center w-full">
                <label className="flex items-center gap-[10px] cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="cursor-pointer appearance-auto rounded-sm focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 focus:ring-offset-[#0A0E1A] transition-all"
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      margin: 0, 
                      accentColor: '#f59e0b',
                      flexShrink: 0 
                    }} 
                  />
                  <span className="text-[14px] text-[#9ca3af] group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-semibold transition-all mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Zap size={14} />
                Secure Admin Access Only
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Features Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 space-y-6">
            <h3 className="text-2xl font-bold text-amber-400">Admin Panel Features</h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🍽', label: 'Manage Food Menu', desc: 'Weekly menu updates' },
                { icon: '📋', label: 'View Registrations', desc: 'Student registrations' },
                { icon: '📅', label: 'Manage Bookings', desc: 'Booking pipeline' },
                { icon: '🏠', label: 'Update Rooms', desc: 'Room availability' },
                { icon: '🖼', label: 'Manage Gallery', desc: 'Image uploads' },
                { icon: '⭐', label: 'Manage Reviews', desc: 'Student testimonials' },
                { icon: '📊', label: 'Dashboard', desc: 'Analytics & stats' },
                { icon: '📤', label: 'Export Data', desc: 'CSV downloads' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                  className="p-4 rounded-lg border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group cursor-pointer"
                >
                  <p className="text-2xl mb-2">{feature.icon}</p>
                  <p className="font-medium text-white text-sm group-hover:text-amber-400 transition-colors">
                    {feature.label}
                  </p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Security Badge */}
            <div className="mt-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Shield className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-green-400 text-sm">Enterprise Security</p>
                  <p className="text-xs text-green-300/70">
                    Powered by Supabase with role-based access control
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

