'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CreditCard, Search, Calendar, Download, ArrowUpRight, Loader2, Plus, CheckCircle, X } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'

export default function AdminPaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'monthly' | 'security_deposit' | 'renewal' | 'other'>('all')

  // Manual Payment Modal
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [manualForm, setManualForm] = useState({
    student_id: '',
    amount: '',
    payment_type: 'monthly' as 'monthly' | 'security_deposit' | 'renewal' | 'late_fee' | 'other',
    payment_mode: 'cash' as 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other',
    transaction_id: '',
    paid_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [submittingManual, setSubmittingManual] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [paymentsRes, studentsRes] = await Promise.all([
        supabase.from('payments').select('*, students(full_name, student_id)').order('created_at', { ascending: false }),
        supabase.from('students').select('id, full_name, student_id, email').eq('is_active', true).order('full_name'),
      ])
      if (paymentsRes.error) throw paymentsRes.error
      setPayments(paymentsRes.data || [])
      setStudents(studentsRes.data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      toast.error('Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.student_id || !manualForm.amount) {
      toast.error('Student and amount are required')
      return
    }
    setSubmittingManual(true)
    try {
      const { error } = await supabase.from('payments').insert({
        student_id: manualForm.student_id,
        amount: Number(manualForm.amount),
        payment_mode: manualForm.payment_mode,
        transaction_id: manualForm.transaction_id || null,
        type: manualForm.payment_type === 'monthly' ? 'monthly' : manualForm.payment_type,
        payment_type: manualForm.payment_type,
        status: 'paid',
        paid_at: new Date(`${manualForm.paid_date}T00:00:00`).toISOString(),
        notes: manualForm.notes || null,
      })
      if (error) throw error
      toast.success('Payment recorded successfully!')
      setManualModalOpen(false)
      setManualForm({
        student_id: '', amount: '', payment_type: 'monthly', payment_mode: 'cash',
        transaction_id: '', paid_date: new Date().toISOString().split('T')[0], notes: '',
      })
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment')
    } finally {
      setSubmittingManual(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const totalCollected = React.useMemo(() => {
    return payments.reduce((acc, pay) => acc + parseFloat(pay.amount || 0), 0)
  }, [payments])

  const filteredPayments = payments.filter(pay => {
    const name = pay.students?.full_name?.toLowerCase() || ''
    const id = pay.students?.student_id?.toLowerCase() || ''
    const txn = pay.transaction_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()

    const matchesSearch = name.includes(term) || id.includes(term) || txn.includes(term)
    const matchesType = typeFilter === 'all' || pay.type === typeFilter

    return matchesSearch && matchesType
  })

  const TYPE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
    monthly: { label: 'Monthly Rent', bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
    security_deposit: { label: 'Security Deposit', bg: 'rgba(39,174,96,0.1)', color: '#27AE60' },
    renewal: { label: 'Stay Renewal', bg: 'rgba(155,89,182,0.1)', color: '#9B59B6' },
    late_fee: { label: 'Late Fee Charge', bg: 'rgba(231,76,60,0.1)', color: '#E74C3C' },
    other: { label: 'Other stay charge', bg: 'rgba(127,140,141,0.1)', color: '#7F8C8D' }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0A0E1A] p-6 lg:p-8 text-gray-100"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Manual Payment Button */}
          <button
            onClick={() => setManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)', color: '#000' }}
          >
            <Plus size={15} /> Record Manual Payment
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
              <CreditCard style={{ color: GOLD }} /> Transaction History
            </h1>
            <p className="text-sm text-gray-500 mt-1">Audit log of all student financial collections and deposit clearances</p>
          </div>
          <div className="bg-[#0F1629] px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Gross Collections</p>
              <p className="text-xl font-bold text-white">₹{totalCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10">
              <ArrowUpRight size={18} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            {(['all', 'monthly', 'security_deposit', 'renewal', 'other'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  typeFilter === f
                    ? 'bg-[#C8840A] text-[#F5A623] border-[#F5A623]/30'
                    : 'bg-[#0F1629] text-gray-400 border-white/5 hover:border-amber-500/20'
                }`}
              >
                {f === 'all' ? 'All Transactions' : f === 'monthly' ? 'Rent' : f === 'security_deposit' ? 'Deposits' : f === 'renewal' ? 'Renewals' : 'Others'}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-80 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by student name or Transaction ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table list */}
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
            <CreditCard size={38} className="mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-gray-300">No payment logs found</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Txn Type</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Mode</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Transaction ID</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Date Recorded</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.map((pay) => {
                    const badge = TYPE_BADGES[pay.type] || TYPE_BADGES.other
                    return (
                      <tr key={pay.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-white">{pay.students?.full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{pay.students?.student_id || '—'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-300 uppercase">
                          {pay.payment_mode || '—'}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-white">
                          ₹{pay.amount}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                          {pay.transaction_id || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Calendar size={11} className="text-gray-500" /> {pay.created_at?.split('T')[0]}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                          <div className="flex justify-end gap-1">
                            <a href={pay.receipt_url || '#'} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                              title="Download Receipt"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Manual Payment Recording Modal ────────────── */}
        <AnimatePresence>
          {manualModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submittingManual && setManualModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl text-gray-200 overflow-y-auto max-h-[90vh]">
                  <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>
                      Record Manual Payment
                    </h3>
                    <button onClick={() => setManualModalOpen(false)} disabled={submittingManual}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleManualPayment} className="p-6 space-y-4">
                    {/* Student Select */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Student *</label>
                      <select
                        required
                        value={manualForm.student_id}
                        onChange={e => setManualForm(p => ({ ...p, student_id: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      >
                        <option value="">Select student…</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.student_id || s.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Amount */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Amount (₹) *</label>
                        <input
                          type="number" required min="1" placeholder="e.g. 9500"
                          value={manualForm.amount}
                          onChange={e => setManualForm(p => ({ ...p, amount: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Payment Date *</label>
                        <input
                          type="date" required
                          value={manualForm.paid_date}
                          onChange={e => setManualForm(p => ({ ...p, paid_date: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Payment Type */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Payment Type</label>
                        <select
                          value={manualForm.payment_type}
                          onChange={e => setManualForm(p => ({ ...p, payment_type: e.target.value as typeof manualForm.payment_type }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                        >
                          <option value="monthly">Monthly Rent</option>
                          <option value="security_deposit">Security Deposit</option>
                          <option value="renewal">Stay Renewal</option>
                          <option value="late_fee">Late Fee</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {/* Payment Mode */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Payment Mode</label>
                        <select
                          value={manualForm.payment_mode}
                          onChange={e => setManualForm(p => ({ ...p, payment_mode: e.target.value as typeof manualForm.payment_mode }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                        >
                          <option value="cash">Cash</option>
                          <option value="upi">UPI / GPay / PhonePe</option>
                          <option value="bank_transfer">Bank Transfer / IMPS</option>
                          <option value="cheque">Cheque</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Transaction Ref */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Transaction Reference (optional)</label>
                      <input
                        type="text" placeholder="UPI Ref / Txn ID / Cheque No."
                        value={manualForm.transaction_id}
                        onChange={e => setManualForm(p => ({ ...p, transaction_id: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Admin Notes (optional)</label>
                      <textarea
                        rows={2} placeholder="Any notes about this payment…"
                        value={manualForm.notes}
                        onChange={e => setManualForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setManualModalOpen(false)} disabled={submittingManual}
                        className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={submittingManual}
                        className="flex-1 py-3 text-sm font-bold rounded-xl text-black flex items-center justify-center gap-2 transition-all"
                        style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                        {submittingManual
                          ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                          : <><CheckCircle size={15} /> Record Payment</>}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  )
}
