'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Eye, EyeOff, GraduationCap, ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { WHATSAPP_NUMBER } from '@/lib/utils/constants'

export default function StudentLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '', general: '' })

  const validate = () => {
    const e = { email: '', password: '', general: '' }
    let ok = true
    if (!form.email.trim()) { e.email = 'Email is required'; ok = false }
    else if (!/\S+@\S+\.\S+/.test(form.email)) { e.email = 'Enter a valid email'; ok = false }
    if (!form.password) { e.password = 'Password is required'; ok = false }
    setErrors(e)
    return ok
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      setErrors(prev => ({ ...prev, general: '' }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      if (error) throw error

      // Check role — must be student
      const role = data.user?.app_metadata?.role
      if (role !== 'student') {
        await supabase.auth.signOut()
        setErrors(prev => ({ ...prev, general: 'This login is for students only. Admins please use the Admin login.' }))
        return
      }

      toast.success('Welcome back! Redirecting to your dashboard…')
      router.push('/student/dashboard')
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please try again.'
      setErrors(prev => ({ ...prev, general: msg === 'Invalid login credentials' ? 'Incorrect email or password.' : msg }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #FDF9F3 0%, #F8F3EA 100%)' }}
    >
      {/* Background gold orb */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8A8AA0] hover:text-[#C9A84C] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div
          className="bg-white rounded-2xl p-8 sm:p-10"
          style={{
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            border: '1px solid #EBEBF0',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              <GraduationCap size={30} style={{ color: '#C9A84C' }} />
            </div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}
            >
              Student Portal
            </h1>
            <p className="text-sm" style={{ color: '#8A8AA0' }}>
              Sign in to access your MLV PG dashboard
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A2E' }}>
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => {
                  setForm(p => ({ ...p, email: e.target.value }))
                  setErrors(p => ({ ...p, email: '' }))
                }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0',
                  background: '#FAFAFA',
                  color: '#1A1A2E',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold" style={{ color: '#1A1A2E' }}>
                  Password
                </label>
                <Link
                  href="/student-login/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#C9A84C' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => {
                    setForm(p => ({ ...p, password: e.target.value }))
                    setErrors(p => ({ ...p, password: '' }))
                  }}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0',
                    background: '#FAFAFA',
                    color: '#1A1A2E',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? '#E8C96B' : 'linear-gradient(135deg, #C9A84C, #E8C96B)',
                color: '#1A1A2E',
                boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
              }}
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Signing in…</>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs mt-6" style={{ color: '#8A8AA0' }}>
            Don&apos;t have an account?{' '}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello MLV PG Management! I am a resident at MLV PG and I would like to get my login credentials for the Student Portal.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-colors"
              style={{ color: '#C9A84C' }}
            >
              Contact MLV PG management
            </a>
          </p>
        </div>

        {/* Admin link */}
        <p className="text-center text-xs mt-4" style={{ color: '#8A8AA0' }}>
          Are you an admin?{' '}
          <Link href="/admin/login" className="underline hover:text-[#C9A84C] transition-colors">
            Admin Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
