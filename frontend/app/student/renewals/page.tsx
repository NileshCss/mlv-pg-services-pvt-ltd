'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { RefreshCcw, CheckCircle, Clock, XCircle, Download, AlertCircle } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Renewal } from '@/types/student'

const GOLD = '#C9A84C'
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  approved: { label: 'Approved', color: '#27AE60', bg: 'rgba(46,204,113,0.1)', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
}

export default function RenewalsPage() {
  const supabase = createClient()
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  const [agreementEndDate, setAgreementEndDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: student } = await supabase.from('students').select('id, agreement_end_date').eq('user_id', session.user.id).single()
      if (!student) return
      setStudentId(student.id)
      setAgreementEndDate(student.agreement_end_date)
      const { data } = await supabase.from('renewals').select('*').eq('student_id', student.id).order('requested_at', { ascending: false })
      setRenewals(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  // Check if renewal can be requested (within 30 days of expiry, no pending request)
  const canRequest = React.useMemo(() => {
    if (!agreementEndDate) return false
    const daysLeft = Math.ceil((new Date(agreementEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const hasPending = renewals.some(r => r.status === 'pending')
    return daysLeft <= 30 && daysLeft > 0 && !hasPending
  }, [agreementEndDate, renewals])

  const daysLeft = agreementEndDate
    ? Math.ceil((new Date(agreementEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const handleRequestRenewal = async () => {
    if (!studentId || !canRequest) return
    setRequesting(true)
    try {
      const { error } = await supabase.from('renewals').insert({ student_id: studentId, status: 'pending' })
      if (error) throw error
      toast.success('Renewal request submitted successfully!')
      const { data } = await supabase.from('renewals').select('*').eq('student_id', studentId).order('requested_at', { ascending: false })
      setRenewals(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit renewal request')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <StudentDashboardLayout title="Renewal Requests">
      <div className="space-y-5">
        {/* Expiry info + request button */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
                <RefreshCcw size={20} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1A1A2E' }}>Agreement End Date</p>
                <p className="text-lg font-bold" style={{ color: GOLD, fontFamily: 'var(--font-playfair), serif' }}>
                  {fmtDate(agreementEndDate)}
                </p>
                {daysLeft !== null && (
                  <p className="text-xs mt-0.5" style={{ color: daysLeft <= 30 ? '#EF4444' : '#8A8AA0' }}>
                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Agreement has expired'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRequestRenewal}
              disabled={!canRequest || requesting}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2"
              style={{
                background: canRequest ? 'linear-gradient(135deg, #C9A84C, #E8C96B)' : '#F0EEE8',
                color: canRequest ? '#1A1A2E' : '#8A8AA0',
                cursor: canRequest ? 'pointer' : 'not-allowed',
                boxShadow: canRequest ? '0 4px 16px rgba(201,168,76,0.3)' : 'none',
              }}
            >
              {requesting ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Submitting…</> : (
                <><RefreshCcw size={15} /> Request Renewal</>
              )}
            </button>
          </div>
          {daysLeft !== null && daysLeft > 30 && (
            <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: '#8A8AA0' }}>
              <AlertCircle size={13} />
              Renewal requests can only be submitted within 30 days of expiry.
            </div>
          )}
        </motion.div>

        {/* Renewals History */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EBEBF0' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EBEBF0' }}>
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>Renewal History</h3>
          </div>
          {loading ? (
            <div className="p-10 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin mx-auto" style={{ borderTopColor: GOLD }} />
            </div>
          ) : renewals.length === 0 ? (
            <div className="p-10 text-center">
              <RefreshCcw size={36} className="mx-auto mb-3" style={{ color: '#C4C4D0' }} />
              <p className="font-semibold" style={{ color: '#1A1A2E' }}>No renewal requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EEE8]">
              {renewals.map(r => {
                const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
                const Icon = cfg.icon
                return (
                  <div key={r.id} className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <Icon size={12} /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#8A8AA0' }}>Requested: {fmtDate(r.requested_at)}</p>
                      {r.new_end_date && <p className="text-xs mt-0.5" style={{ color: '#27AE60' }}>New end date: {fmtDate(r.new_end_date)}</p>}
                      {r.admin_notes && <p className="text-xs mt-0.5" style={{ color: '#4A4A6A' }}>Note: {r.admin_notes}</p>}
                    </div>
                    {r.slip_url && (
                      <a href={r.slip_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(201,168,76,0.1)', color: GOLD }}>
                        <Download size={12} /> Download Slip
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </StudentDashboardLayout>
  )
}
