'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import type { Fee } from '@/types/student'

const GOLD = '#C9A84C'
const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function FeesPage() {
  const supabase = createClient()
  const [fee, setFee] = useState<Fee | null>(null)
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: student } = await supabase.from('students').select('id').eq('user_id', session.user.id).single()
      if (!student) return

      const { data: feeData } = await supabase.from('fees').select('*').eq('student_id', student.id).single()
      setFee(feeData)

      const { data: installments } = await supabase.from('installments').select('amount, status').eq('student_id', student.id)
      if (installments) {
        const paid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
        const pending = installments.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
        const overdue = installments.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
        setSummary({ totalPaid: paid, totalPending: pending, overdue })
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const PLAN_LABEL: Record<string, string> = { monthly: 'Monthly', bi_monthly: '2-Installment', quarterly: '3-Installment' }

  if (loading) return (
    <StudentDashboardLayout title="Fee Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse" style={{ border: '1px solid #EBEBF0' }} />
        ))}
      </div>
    </StudentDashboardLayout>
  )

  return (
    <StudentDashboardLayout title="Fee Details">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Fee', value: fee ? fmtINR(fee.monthly_amount) : '—', icon: CreditCard, color: GOLD },
            { label: 'Total Paid', value: fmtINR(summary.totalPaid), icon: CheckCircle, color: '#27AE60' },
            { label: 'Total Pending', value: fmtINR(summary.totalPending), icon: Clock, color: '#F59E0B', alert: summary.totalPending > 0 },
            { label: 'Overdue Amount', value: fmtINR(summary.overdue), icon: AlertCircle, color: '#EF4444', alert: summary.overdue > 0 },
          ].map(({ label, value, icon: Icon, color, alert }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5"
              style={{ border: `1px solid ${alert ? '#FEE2E2' : '#EBEBF0'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-xl font-bold" style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), serif' }}>{value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#8A8AA0' }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Fee Details Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EBEBF0' }}>
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>Fee Structure</h3>
          </div>
          {!fee ? (
            <div className="p-10 text-center">
              <p className="text-sm" style={{ color: '#8A8AA0' }}>No fee record found. Please contact admin.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EEE8]">
              {[
                { label: 'Monthly Rent', value: fmtINR(fee.monthly_amount) },
                { label: 'Security Deposit', value: fmtINR(fee.security_deposit) },
                { label: 'Security Deposit Status', value: fee.security_deposit_paid ? 'Paid ✓' : 'Pending', highlight: !fee.security_deposit_paid },
                { label: 'Payment Plan', value: PLAN_LABEL[fee.plan_type] || fee.plan_type },
                { label: 'Late Fee', value: fee.late_fee > 0 ? fmtINR(fee.late_fee) : 'None', highlight: fee.late_fee > 0 },
                { label: 'Payment Mode on Record', value: fee.payment_mode || 'Not specified' },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm" style={{ color: '#4A4A6A' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: highlight ? '#EF4444' : '#1A1A2E' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </StudentDashboardLayout>
  )
}
