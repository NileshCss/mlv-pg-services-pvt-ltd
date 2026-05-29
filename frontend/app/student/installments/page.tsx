'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Receipt, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import type { Installment } from '@/types/student'

const GOLD = '#C9A84C'
const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid: { label: 'Paid', color: '#27AE60', bg: 'rgba(46,204,113,0.1)', icon: CheckCircle },
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  overdue: { label: 'Overdue', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle },
}

export default function InstallmentsPage() {
  const supabase = createClient()
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: student } = await supabase.from('students').select('id').eq('user_id', session.user.id).single()
      if (!student) return
      const { data } = await supabase.from('installments').select('*').eq('student_id', student.id).order('due_date', { ascending: true })
      setInstallments(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const totalAmount = installments.reduce((s, i) => s + i.amount, 0)
  const paidAmount = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

  return (
    <StudentDashboardLayout title="Installments">
      <div className="space-y-5">
        {/* Progress bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>Payment Progress</p>
            <p className="text-sm font-bold" style={{ color: GOLD }}>{fmtINR(paidAmount)} / {fmtINR(totalAmount)}</p>
          </div>
          <div className="w-full rounded-full h-2.5" style={{ background: '#F0EEE8' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-2.5 rounded-full"
              style={{ background: `linear-gradient(to right, ${GOLD}, #E8C96B)` }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: '#8A8AA0' }}>{progress.toFixed(0)}% paid</p>
        </motion.div>

        {/* Installments Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EBEBF0' }}>
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              All Installments
            </h3>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin mx-auto" style={{ borderTopColor: GOLD }} />
            </div>
          ) : installments.length === 0 ? (
            <div className="p-10 text-center">
              <Receipt size={36} className="mx-auto mb-3" style={{ color: '#C4C4D0' }} />
              <p className="font-semibold" style={{ color: '#1A1A2E' }}>No installments found</p>
              <p className="text-sm mt-1" style={{ color: '#8A8AA0' }}>Your payment schedule will appear here once configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr style={{ background: '#F8F6F1' }}>
                    {['#', 'Due Date', 'Amount', 'Status', 'Paid On', 'Receipt'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A8AA0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst, idx) => {
                    const cfg = STATUS_CONFIG[inst.status] || STATUS_CONFIG.pending
                    const Icon = cfg.icon
                    return (
                      <tr key={inst.id} style={{ borderTop: '1px solid #F0EEE8' }}
                        className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium" style={{ color: '#1A1A2E' }}>{inst.installment_no}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: '#4A4A6A' }}>{fmtDate(inst.due_date)}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: '#1A1A2E' }}>{fmtINR(inst.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            <Icon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: '#8A8AA0' }}>
                          {inst.paid_at ? fmtDate(inst.paid_at) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {inst.receipt_url ? (
                            <a href={inst.receipt_url} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                              style={{ color: GOLD }}>
                              <Download size={12} /> Download
                            </a>
                          ) : <span className="text-xs" style={{ color: '#C4C4D0' }}>—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </StudentDashboardLayout>
  )
}
