'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Search, CheckCircle, Clock, Loader2, ArrowLeft, Eye, Download, AlertCircle } from 'lucide-react'

const GOLD = '#C9A84C'

const STAGES = [
  { key: 'submitted',      label: 'Application Submitted',   desc: 'Your form has been received' },
  { key: 'otp_verified',   label: 'Email Verified',           desc: 'Identity confirmed via OTP' },
  { key: 'deposit_paid',   label: 'Security Deposit',         desc: '₹5,000 deposit paid' },
  { key: 'under_review',   label: 'Under Review',             desc: 'Admin reviewing your application' },
  { key: 'room_allocated', label: 'Room Allocated',           desc: 'Your room has been assigned' },
  { key: 'checked_in',     label: 'Confirmed',                desc: 'Welcome to MLV PG!' },
]

interface AppData {
  application_id: string
  full_name: string
  email: string
  phone: string
  college_name: string
  course: string
  room_preference: string
  check_in_date: string
  status: string
  stage: string
  deposit_status: string
  deposit_paid_at?: string
  created_at: string
}

function TrackForm() {
  const searchParams = useSearchParams()
  const [appId, setAppId] = useState(searchParams.get('id') || '')
  const [result, setResult] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-track if ID is in query string
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setAppId(id.toUpperCase())
      handleTrack(id.toUpperCase())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTrack = async (id?: string) => {
    const trackId = (id || appId).trim().toUpperCase()
    if (!trackId) { setError('Please enter your Application ID'); return }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/applications/track?id=${encodeURIComponent(trackId)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Application not found')
      setResult(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Application not found. Please check your Application ID.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Search Card */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-md p-6 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Application ID
        </label>
        <div className="flex gap-2">
          <input
            id="app-id-input"
            type="text"
            value={appId}
            onChange={e => { setAppId(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            placeholder="e.g. MLV-2026-12345"
            className="flex-1 h-11 px-4 border-2 rounded-xl text-sm font-mono outline-none transition-all"
            style={{
              borderColor: error ? '#ef4444' : '#E5E7EB',
              background: '#FAFAFA',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.12)` }}
            onBlur={e => { e.currentTarget.style.borderColor = error ? '#ef4444' : '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading || !appId}
            id="track-btn"
            className="h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96B)`, color: '#1A1A2E' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Tracking…' : 'Track'}
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Your Application ID was emailed to you after submission (format: MLV-2026-XXXXX)
        </p>
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-amber-100 shadow-md overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #FDFBF6, #F8F3EA)' }}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Application ID</p>
                  <p className="font-mono font-bold text-lg" style={{ color: GOLD }}>{result.application_id}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{result.full_name}</p>
                  <p className="text-xs text-gray-500">{result.college_name} · {result.course}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(201,168,76,0.12)',
                      color: GOLD,
                      border: `1px solid rgba(201,168,76,0.3)`
                    }}>
                    {result.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted {new Date(result.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Application Progress</p>
              <div className="space-y-0">
                {STAGES.map((stage, i) => {
                  const currentIndex = STAGES.findIndex(s => s.key === result.stage)
                  const isDone = i <= currentIndex
                  const isCurrent = i === currentIndex
                  return (
                    <div key={stage.key} className="flex items-start gap-3">
                      {/* Connector + Circle */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
                          style={{
                            background: isDone ? GOLD : '#F3F4F6',
                            color: isDone ? 'white' : '#9CA3AF',
                          }}
                        >
                          {isDone ? <CheckCircle size={14} /> : isCurrent ? <Clock size={12} /> : i + 1}
                        </div>
                        {i < STAGES.length - 1 && (
                          <div className="w-0.5 h-6 mt-1 rounded-full transition-all duration-500"
                            style={{ background: isDone && !isCurrent ? GOLD : '#E5E7EB' }} />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pb-4">
                        <p className="text-sm font-semibold leading-tight"
                          style={{ color: isCurrent ? GOLD : isDone ? '#374151' : '#9CA3AF' }}>
                          {stage.label}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(201,168,76,0.12)', color: GOLD }}>
                              CURRENT
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Deposit Status + Actions */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between items-center py-3 px-4 rounded-xl"
                style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Security Deposit</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">₹5,000</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: result.deposit_status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                    color: result.deposit_status === 'paid' ? '#16A34A' : '#D97706',
                  }}>
                  {result.deposit_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Room Preference', result.room_preference],
                  ['Expected Join', result.check_in_date ? new Date(result.check_in_date).toLocaleDateString('en-IN') : '—'],
                  ['Email', result.email],
                  ['Phone', result.phone],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-gray-400">{k}</p>
                    <p className="font-semibold text-gray-700 mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <a
                href={`/slip/${result.application_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl border-2 text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
                style={{ borderColor: GOLD, color: GOLD }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = GOLD; (e.currentTarget as HTMLElement).style.color = 'white' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = GOLD }}
              >
                <Download size={14} />
                View / Download Temporary Registration Slip
              </a>

              {result.deposit_status === 'pending' && (
                <Link
                  href={`/pre-register?continue=${result.application_id}`}
                  className="w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96B)`, color: '#1A1A2E' }}
                >
                  💳 Pay Security Deposit — ₹5,000
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TrackApplicationPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'linear-gradient(135deg, #FDFBF6 0%, #F8F3EA 100%)' }}>
      {/* Background orb */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }} />

      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8">
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(201,168,76,0.12)', border: `1px solid rgba(201,168,76,0.25)` }}>
            <Eye size={24} style={{ color: GOLD }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Track Your{' '}
            <span style={{ color: GOLD }}>Application</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your Application ID to check status, deposit, and download your slip
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        }>
          <TrackForm />
        </Suspense>

        {/* Help note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Can&apos;t find your Application ID?{' '}
            <a
              href="https://wa.me/918809630649?text=Hello MLV PG! I need help finding my application ID."
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
              style={{ color: GOLD }}
            >
              WhatsApp us
            </a>
            {' '}or call{' '}
            <a href="tel:+918809630649" className="font-semibold" style={{ color: GOLD }}>
              +91 88096 30649
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
