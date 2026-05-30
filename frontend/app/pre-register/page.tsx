'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, ArrowRight, CheckCircle, Upload, X,
  User, BookOpen, ShieldCheck, CreditCard, Loader2,
  RefreshCw, Eye, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import RazorpayButton from '@/components/payment/RazorpayButton'

// ── Types ────────────────────────────────────────────────────
interface FormData {
  full_name: string
  phone: string
  email: string
  gender: string
  college_name: string
  course: string
  room_preference: string
  check_in_date: string
  parent_contact: string
  food_preference: string
  additional_notes: string
}

const STEPS = [
  { id: 1, label: 'Details',   icon: User },
  { id: 2, label: 'Documents', icon: Upload },
  { id: 3, label: 'Verify',    icon: ShieldCheck },
  { id: 4, label: 'Payment',   icon: CreditCard },
]

const GOLD = '#C9A84C'

// ── Main Page ─────────────────────────────────────────────────
export default function PreRegisterPage() {
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    full_name: '', phone: '', email: '', gender: '',
    college_name: '', course: '', room_preference: '',
    check_in_date: '', parent_contact: '', food_preference: '',
    additional_notes: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Step 2 — Docs
  const [aadharFile, setAadharFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [collegeIdFile, setCollegeIdFile] = useState<File | null>(null)
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [docUrls, setDocUrls] = useState({ aadhar: '', photo: '', college_id: '' })

  // Step 3 — OTP
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpError, setOtpError] = useState('')
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  // Step 4 — Application
  const [applicationId, setApplicationId] = useState('')
  const [submittingApp, setSubmittingApp] = useState(false)
  const [depositPaid, setDepositPaid] = useState(false)

  // ── OTP countdown timer ───────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // ── Step 1 Validation ─────────────────────────────────────
  const validateStep1 = useCallback(() => {
    const e: Partial<FormData> = {}
    if (!formData.full_name.trim()) e.full_name = 'Full name is required'
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address'
    if (!formData.gender) e.gender = 'Please select gender'
    if (!formData.college_name.trim()) e.college_name = 'College name is required'
    if (!formData.course.trim()) e.course = 'Course is required'
    if (!formData.room_preference) e.room_preference = 'Select a room type'
    if (!formData.check_in_date) e.check_in_date = 'Expected join date is required'
    if (!formData.parent_contact.trim() || !/^[6-9]\d{9}$/.test(formData.parent_contact.trim())) e.parent_contact = 'Enter a valid parent mobile number'
    if (!formData.food_preference) e.food_preference = 'Select food preference'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  // ── Step 2 — Upload Documents ─────────────────────────────
  const handleUploadDocs = async () => {
    if (!photoFile) {
      toast.error('Please upload your photo')
      return
    }
    setUploadingDocs(true)
    try {
      const uploadFile = async (file: File | null, path: string) => {
        if (!file) return ''
        const ext = file.name.split('.').pop()
        const filePath = `pre-reg/${path}_${Date.now()}.${ext}`
        const { error } = await supabase.storage
          .from('student-documents')
          .upload(filePath, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('student-documents').getPublicUrl(filePath)
        return data.publicUrl
      }

      const [aadharUrl, photoUrl, collegeIdUrl] = await Promise.all([
        uploadFile(aadharFile, `aadhar/${formData.email}`),
        uploadFile(photoFile, `photos/${formData.email}`),
        uploadFile(collegeIdFile, `college_id/${formData.email}`),
      ])

      setDocUrls({ aadhar: aadharUrl, photo: photoUrl, college_id: collegeIdUrl })
      toast.success('Documents uploaded successfully!')
      setStep(3)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(`Upload failed: ${message}`)
    } finally {
      setUploadingDocs(false)
    }
  }

  // ── Step 3 — Send OTP ─────────────────────────────────────
  const handleSendOtp = async () => {
    setSendingOtp(true)
    setOtpError('')
    try {
      const res = await fetch('/api/auth/student/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, purpose: 'pre_register' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOtpSent(true)
      setCountdown(60)
      toast.success(`OTP sent to ${formData.email}`)
      if (data.debug_otp) toast.info(`Dev OTP: ${data.debug_otp}`, { duration: 30000 })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setOtpError(message)
    } finally {
      setSendingOtp(false)
    }
  }

  // ── Step 3 — Verify OTP ───────────────────────────────────
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      setOtpError('Please enter the complete 4-digit OTP')
      return
    }
    setVerifyingOtp(true)
    setOtpError('')
    try {
      const res = await fetch('/api/auth/student/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode, purpose: 'pre_register' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // OTP verified — now submit application
      await handleSubmitApplication()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'OTP verification failed'
      setOtpError(message)
    } finally {
      setVerifyingOtp(false)
    }
  }

  // ── Submit Application after OTP verified ─────────────────
  const handleSubmitApplication = async () => {
    setSubmittingApp(true)
    try {
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          aadhar_url: docUrls.aadhar,
          photo_url: docUrls.photo,
          college_id_url: docUrls.college_id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApplicationId(data.application_id)
      setStep(4)
      toast.success('Application submitted! 🎉')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed'
      toast.error(message)
      throw err
    } finally {
      setSubmittingApp(false)
    }
  }

  // ── Step 3 — OTP input handlers ───────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setOtpError('')
    if (value && index < 3) otpRefs[index + 1]?.current?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1]?.current?.focus()
    }
  }

  // ── Step 4 — Skip deposit ─────────────────────────────────
  const handleSkipDeposit = async () => {
    toast.info('Deposit marked as pending. You can pay at the PG.')
    // Deposit remains 'pending' in DB
  }

  const field = (
    key: keyof FormData,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={formData[key]}
        onChange={e => {
          setFormData(p => ({ ...p, [key]: e.target.value }))
          setErrors(p => ({ ...p, [key]: '' }))
        }}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all border"
        style={{
          borderColor: errors[key] ? '#ef4444' : '#E5E7EB',
          background: errors[key] ? '#FEF2F2' : '#FAFAFA',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.12)` }}
        onBlur={e => { e.currentTarget.style.borderColor = errors[key] ? '#ef4444' : '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  const selectField = (
    key: keyof FormData,
    label: string,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        value={formData[key]}
        onChange={e => {
          setFormData(p => ({ ...p, [key]: e.target.value }))
          setErrors(p => ({ ...p, [key]: '' }))
        }}
        className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all border appearance-none"
        style={{
          borderColor: errors[key] ? '#ef4444' : '#E5E7EB',
          background: errors[key] ? '#FEF2F2' : '#FAFAFA',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.12)` }}
        onBlur={e => { e.currentTarget.style.borderColor = errors[key] ? '#ef4444' : '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FDFBF6 0%, #F8F3EA 100%)' }}>
      {/* Background orb */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#C9A84C] transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="text-center">
            <p className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">MLV PG Services</p>
            <p className="text-[10px] text-gray-400">Pre-Registration</p>
          </div>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Secure Your Room at{' '}
            <span style={{ color: GOLD }}>MLV PG</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Complete your pre-registration in 4 simple steps</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon
            const isDone = step > s.id
            const isCurrent = step === s.id
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold"
                    style={{
                      background: isDone ? '#C9A84C' : isCurrent ? 'rgba(201,168,76,0.15)' : '#F3F4F6',
                      color: isDone ? 'white' : isCurrent ? GOLD : '#9CA3AF',
                      border: isCurrent ? `2px solid ${GOLD}` : '2px solid transparent',
                    }}
                  >
                    {isDone ? <CheckCircle size={18} /> : <StepIcon size={16} />}
                  </div>
                  <span className="text-[10px] font-semibold hidden sm:block"
                    style={{ color: isCurrent ? GOLD : isDone ? '#6B7280' : '#9CA3AF' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-0.5 w-10 sm:w-16 mx-1 mt-0 sm:-mt-5 rounded-full transition-all duration-500"
                    style={{ background: step > s.id ? GOLD : '#E5E7EB' }} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── STEP 1: Personal Details ─────────────────── */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User size={20} style={{ color: GOLD }} />
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {field('full_name', 'Full Name *', 'text', 'Your full name')}
                  {field('phone', 'Mobile Number *', 'tel', '9876543210')}
                  {field('email', 'Email Address *', 'email', 'john@example.com')}
                  {selectField('gender', 'Gender *', [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ])}
                  {field('college_name', 'College / University *', 'text', 'Acharya Institute of Technology')}
                  {field('course', 'Course *', 'text', 'B.Tech CSE')}
                  {selectField('room_preference', 'Preferred Room Type *', [
                    { value: 'Single Room', label: 'Single Room — ₹13,000/mo' },
                    { value: 'Double Sharing', label: 'Double Sharing — ₹9,500/mo' },
                    { value: 'Triple Sharing', label: 'Triple Sharing — ₹7,500/mo' },
                  ])}
                  {field('check_in_date', 'Expected Join Date *', 'date')}
                  {field('parent_contact', 'Parent Mobile Number *', 'tel', '9876543211')}
                  {selectField('food_preference', 'Food Preference *', [
                    { value: 'Veg', label: '🥗 Vegetarian' },
                    { value: 'Non-Veg', label: '🍗 Non-Vegetarian' },
                    { value: 'Both', label: 'Both' },
                  ])}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requirements (optional)</label>
                  <textarea
                    value={formData.additional_notes}
                    onChange={e => setFormData(p => ({ ...p, additional_notes: e.target.value }))}
                    placeholder="Any dietary needs, special requirements…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border border-gray-200 bg-gray-50 resize-none"
                    style={{ color: '#1A1A2E' }}
                    onFocus={e => { e.currentTarget.style.borderColor = GOLD }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB' }}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => { if (validateStep1()) setStep(2) }}
                    className="h-11 px-8 rounded-full font-bold text-sm flex items-center gap-2 transition-all"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96B)`, color: '#1A1A2E' }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Document Upload ───────────────────── */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Upload size={20} style={{ color: GOLD }} />
                  Document Upload
                </h2>
                <p className="text-sm text-gray-500 mb-6">Upload your documents for verification. Photo is required; others are optional but recommended.</p>

                <div className="space-y-4">
                  {[
                    { label: 'Your Photo *', key: 'photo' as const, file: photoFile, setFile: setPhotoFile, required: true, hint: 'Clear passport-size photo' },
                    { label: 'Aadhaar Card', key: 'aadhar' as const, file: aadharFile, setFile: setAadharFile, required: false, hint: 'Front side of Aadhaar card' },
                    { label: 'College ID Card', key: 'collegeId' as const, file: collegeIdFile, setFile: setCollegeIdFile, required: false, hint: 'Current semester college ID' },
                  ].map(({ label, file, setFile, required, hint }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <p className="text-xs text-gray-400 mb-2">{hint}</p>
                      <div
                        className="relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer"
                        style={{ borderColor: file ? GOLD : '#E5E7EB', background: file ? 'rgba(201,168,76,0.05)' : '#FAFAFA' }}
                        onClick={() => document.getElementById(`file-${label}`)?.click()}
                      >
                        <input
                          id={`file-${label}`}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                        {file ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} style={{ color: GOLD }} />
                              <span className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setFile(null) }}
                              className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-400">
                            <Upload size={18} />
                            <div>
                              <p className="text-sm font-medium">Click to upload {required ? '(required)' : '(optional)'}</p>
                              <p className="text-xs">PNG, JPG, PDF up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="h-11 px-6 rounded-full font-semibold text-sm border border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleUploadDocs}
                    disabled={uploadingDocs}
                    className="h-11 px-8 rounded-full font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96B)`, color: '#1A1A2E' }}
                  >
                    {uploadingDocs ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <>Upload & Continue <ArrowRight size={16} /></>}
                  </button>
                </div>

                {/* Skip option */}
                <p className="text-center text-xs text-gray-400 mt-4">
                  No documents now?{' '}
                  <button
                    onClick={() => setStep(3)}
                    className="underline text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Skip — submit documents later
                  </button>
                </p>
              </div>
            )}

            {/* ── STEP 3: OTP Verification ──────────────────── */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <ShieldCheck size={20} style={{ color: GOLD }} />
                  Email Verification
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  We'll send a 4-digit OTP to{' '}
                  <span className="font-semibold text-gray-800">{formData.email}</span>
                </p>

                {!otpSent ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(201,168,76,0.12)', border: `1px solid rgba(201,168,76,0.25)` }}>
                      <ShieldCheck size={28} style={{ color: GOLD }} />
                    </div>
                    <p className="text-gray-600 text-sm mb-6">Click the button below to receive your verification code</p>
                    <button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="h-11 px-8 rounded-full font-bold text-sm flex items-center gap-2 mx-auto transition-all disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96B)`, color: '#1A1A2E' }}
                    >
                      {sendingOtp ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send Verification Code</>}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-center text-gray-600 mb-6">
                      Enter the 4-digit code sent to your email
                    </p>

                    {/* OTP Input Grid */}
                    <div className="flex justify-center gap-3 mb-4">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all"
                          style={{
                            borderColor: otpError ? '#ef4444' : digit ? GOLD : '#E5E7EB',
                            background: digit ? 'rgba(201,168,76,0.06)' : '#FAFAFA',
                            color: '#1A1A2E',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.15)` }}
                          onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm text-center justify-center mb-4">
                        <AlertCircle size={14} />
                        {otpError}
                      </div>
                    )}

                    {/* Resend countdown */}
                    <div className="text-center mb-6">
                      {countdown > 0 ? (
                        <p className="text-sm text-gray-500">
                          Resend OTP in{' '}
                          <span className="font-bold tabular-nums" style={{ color: GOLD }}>
                            {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                          </span>
                        </p>
                      ) : (
                        <button
                          onClick={handleSendOtp}
                          disabled={sendingOtp}
                          className="text-sm inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          style={{ color: GOLD }}
                        >
                          <RefreshCw size={13} className={sendingOtp ? 'animate-spin' : ''} />
                          {sendingOtp ? 'Resending…' : 'Resend OTP'}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || submittingApp || otp.join('').length !== 4}
                      className="w-full h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96B)`, color: '#1A1A2E' }}
                    >
                      {verifyingOtp || submittingApp
                        ? <><Loader2 size={16} className="animate-spin" /> {submittingApp ? 'Submitting Application…' : 'Verifying…'}</>
                        : <><CheckCircle size={16} /> Verify & Submit Application</>}
                    </button>
                  </div>
                )}

                <div className="mt-4 flex justify-start">
                  <button
                    onClick={() => setStep(2)}
                    disabled={verifyingOtp || submittingApp}
                    className="h-9 px-4 rounded-full text-sm border border-gray-200 text-gray-500 hover:border-gray-300 transition-all"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Security Deposit Payment ─────────── */}
            {step === 4 && (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 sm:p-8">

                  {/* Success Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={32} className="text-green-600" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-gray-900">Application Submitted!</h2>
                    <p className="text-sm text-gray-500 mt-1">Your application has been received.</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{ background: 'rgba(201,168,76,0.1)', border: `1px solid rgba(201,168,76,0.25)` }}>
                      <span className="text-xs text-gray-500">Application ID</span>
                      <span className="font-mono font-bold text-sm" style={{ color: GOLD }}>{applicationId}</span>
                    </div>
                  </div>

                  {/* Deposit Info Card */}
                  <div className="rounded-xl p-4 mb-5" style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Security Deposit</h3>
                    <div className="space-y-2 text-sm">
                      {[
                        ['Amount Due', '₹5,000'],
                        ['Purpose', 'Room Reservation'],
                        ['Valid For', '7 days from today'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-gray-500">{k}</span>
                          <span className="font-semibold text-gray-900">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs text-amber-800">
                        ⚠️ Your seat will only be confirmed after the security deposit is paid.
                      </p>
                    </div>
                  </div>

                  {/* Payment / Paid state */}
                  {!depositPaid ? (
                    <div className="space-y-3">
                      <RazorpayButton
                        amount={5000}
                        label="Pay Security Deposit — ₹5,000"
                        receipt={applicationId}
                        notes={{
                          type: 'security_deposit',
                          name: formData.full_name,
                          email: formData.email,
                          phone: formData.phone,
                        }}
                        onSuccess={(paymentId) => {
                          setDepositPaid(true)
                          toast.success('Security deposit paid! 🎉')
                          console.log('Deposit payment ID:', paymentId)
                        }}
                        onFailure={(err) => {
                          toast.error('Payment failed. Please try again or pay at PG.')
                          console.error('Payment failed:', err)
                        }}
                      />
                      <button
                        onClick={handleSkipDeposit}
                        className="w-full text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 py-2 transition-colors"
                      >
                        Skip for now — Pay at PG in person
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                      >
                        <CheckCircle size={24} className="text-green-600" />
                      </motion.div>
                      <p className="text-green-700 font-semibold text-sm">Deposit Paid Successfully!</p>
                      <p className="text-xs text-gray-400 mt-1">Your seat is now reserved. We'll contact you soon.</p>
                    </div>
                  )}

                  {/* Download Slip + Track */}
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                    <a
                      href={`/slip/${applicationId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-10 rounded-xl border-2 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all"
                      style={{ borderColor: GOLD, color: GOLD }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = GOLD; (e.currentTarget as HTMLElement).style.color = 'white' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = GOLD }}
                    >
                      📄 View / Print Temporary Slip
                    </a>
                    <Link
                      href={`/track-application?id=${applicationId}`}
                      className="w-full h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-gray-300 inline-flex items-center justify-center gap-2 transition-all"
                    >
                      <Eye size={14} /> Track Application Status
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
