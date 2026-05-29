'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Step = 'email' | 'otp' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(['', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: 'forgot_password' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      setResendCountdown(60)
      setStep('otp')
      toast.success('OTP sent to your email!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 3) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 4) { setError('Enter the 4-digit OTP'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, purpose: 'forgot_password' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAttemptsLeft(data.attemptsLeft ?? attemptsLeft - 1)
        throw new Error(data.error || 'Invalid OTP')
      }
      setStep('reset')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return
    setLoading(true)
    setError('')
    setOtp(['', '', '', ''])
    try {
      const res = await fetch('/api/auth/student/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'forgot_password' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP')
      setResendCountdown(60)
      setAttemptsLeft(3)
      toast.success('New OTP sent!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Reset Password ───────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      setStep('done')
      toast.success('Password reset successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    border: '1.5px solid #EBEBF0',
    background: '#FAFAFA',
    color: '#1A1A2E',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #FDF9F3 0%, #F8F3EA 100%)' }}
    >
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/student-login"
          className="inline-flex items-center gap-2 text-sm text-[#8A8AA0] hover:text-[#C9A84C] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="bg-white rounded-2xl p-8 sm:p-10"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #EBEBF0' }}>

          <AnimatePresence mode="wait">
            {/* ── Step: Email ── */}
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    <Mail size={26} style={{ color: '#C9A84C' }} />
                  </div>
                  <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                    Forgot Password?
                  </h1>
                  <p className="text-sm" style={{ color: '#8A8AA0' }}>
                    Enter your registered email to receive a 4-digit OTP
                  </p>
                </div>
                {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A2E' }}>Email Address</label>
                    <input type="email" placeholder="your@email.com" value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : 'Send OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step: OTP Verification ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    <KeyRound size={26} style={{ color: '#C9A84C' }} />
                  </div>
                  <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                    Verify OTP
                  </h2>
                  <p className="text-sm" style={{ color: '#8A8AA0' }}>
                    Enter the 4-digit code sent to <strong className="text-[#1A1A2E]">{email}</strong>
                  </p>
                  <p className="text-xs mt-1 text-[#C9A84C]">Valid for 10 minutes · {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left</p>
                </div>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

                {/* OTP Boxes */}
                <div className="flex gap-3 justify-center mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-14 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all"
                      style={{ border: '2px solid #EBEBF0', background: '#FAFAFA', color: '#1A1A2E' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  ))}
                </div>

                <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 4}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-4"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Verify OTP'}
                </button>

                <button onClick={handleResendOtp} disabled={resendCountdown > 0 || loading}
                  className="w-full py-2.5 text-sm font-medium rounded-xl transition-all"
                  style={{ color: resendCountdown > 0 ? '#8A8AA0' : '#C9A84C', background: 'transparent' }}>
                  {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
                </button>
              </motion.div>
            )}

            {/* ── Step: New Password ── */}
            {step === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    <KeyRound size={26} style={{ color: '#C9A84C' }} />
                  </div>
                  <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                    Set New Password
                  </h2>
                  <p className="text-sm" style={{ color: '#8A8AA0' }}>Choose a strong password for your account</p>
                </div>
                {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {[
                    { label: 'New Password', value: newPassword, show: showNew, setShow: setShowNew, setter: setNewPassword },
                    { label: 'Confirm Password', value: confirmPassword, show: showConfirm, setShow: setShowConfirm, setter: setConfirmPassword },
                  ].map(({ label, value, show, setShow, setter }) => (
                    <div key={label}>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A2E' }}>{label}</label>
                      <div className="relative">
                        <input type={show ? 'text' : 'password'} placeholder="••••••••" value={value}
                          onChange={e => { setter(e.target.value); setError('') }}
                          className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                        <button type="button" onClick={() => setShow((p: boolean) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step: Done ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#C9A84C' }} />
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                  Password Updated!
                </h2>
                <p className="text-sm mb-6" style={{ color: '#8A8AA0' }}>
                  Your password has been reset. You can now log in with your new password.
                </p>
                <Link href="/student-login"
                  className="inline-block py-3 px-8 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E' }}>
                  Go to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
