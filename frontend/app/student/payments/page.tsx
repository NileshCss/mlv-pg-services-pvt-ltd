'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { History, Download } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/types/student'

const GOLD = '#C9A84C'
const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const TYPE_LABEL: Record<string, string> = {
  monthly: 'Monthly Rent', security_deposit: 'Security Deposit',
  renewal: 'Renewal', late_fee: 'Late Fee', other: 'Other',
}
const MODE_LABEL: Record<string, string> = {
  cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer',
  razorpay: 'Online (Razorpay)', cheque: 'Cheque', other: 'Other',
}

export default function PaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: student } = await supabase.from('students').select('id').eq('user_id', session.user.id).single()
      if (!student) return
      const { data } = await supabase.from('payments').select('*').eq('student_id', student.id).order('created_at', { ascending: false })
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <StudentDashboardLayout title="Payment History">
      <div className="space-y-5">
        {/* Total summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 flex items-center gap-4"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
            <History size={22} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: '#8A8AA0' }}>Total Payments Recorded</p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), serif' }}>
              {fmtINR(totalPaid)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-semibold" style={{ color: '#8A8AA0' }}>Transactions</p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), serif' }}>{payments.length}</p>
          </div>
        </motion.div>

        {/* Payments Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EBEBF0' }}>
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>All Transactions</h3>
          </div>
          {loading ? (
            <div className="p-10 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin mx-auto" style={{ borderTopColor: GOLD }} />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center">
              <History size={36} className="mx-auto mb-3" style={{ color: '#C4C4D0' }} />
              <p className="font-semibold" style={{ color: '#1A1A2E' }}>No payment records</p>
              <p className="text-sm mt-1" style={{ color: '#8A8AA0' }}>Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F8F6F1' }}>
                    {['Date', 'Type', 'Amount', 'Mode', 'Transaction ID', 'Receipt'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A8AA0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{ borderTop: '1px solid #F0EEE8' }} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#4A4A6A' }}>{fmtDate(p.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                          {TYPE_LABEL[p.type] || p.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold" style={{ color: '#1A1A2E' }}>{fmtINR(p.amount)}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#4A4A6A' }}>{p.payment_mode ? MODE_LABEL[p.payment_mode] : '—'}</td>
                      <td className="px-5 py-3.5 text-xs font-mono" style={{ color: '#8A8AA0' }}>{p.transaction_id || '—'}</td>
                      <td className="px-5 py-3.5">
                        {p.receipt_url ? (
                          <a href={p.receipt_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD }}>
                            <Download size={12} /> Download
                          </a>
                        ) : <span className="text-xs" style={{ color: '#C4C4D0' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </StudentDashboardLayout>
  )
}
